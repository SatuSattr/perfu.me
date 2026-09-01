import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { ImageCard } from "./image-card";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { uploadMedia } from "@/lib/upload";

export interface MediaItem {
    path: string;
    file?: File | null;
    preview?: string;
    position: number;
    type: 'image' | 'video';
    mime?: string | null;
    id?: number;
    progress?: number;
    status?: 'uploading' | 'done' | 'error' | 'pending';
    error?: string;
}

interface Props {
    images: MediaItem[];
    onChange: (next: MediaItem[]) => void;
    error?: string;
    className?: string;
    productSlug?: string;
    autoSave?: boolean;
}

export function MediaSection({
    images,
    onChange,
    error,
    className = "",
    productSlug,
    autoSave = false,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const imagesRef = useRef(images);
    imagesRef.current = images;

    function renumber(list: MediaItem[]) {
        list.forEach((item, idx) => {
            item.position = idx;
        });
    }

    function persist(next: MediaItem[]) {
        onChange(next);
        if (!autoSave || !productSlug || saving) return;
        // only for reorder / delete (no file upload) — bulk patch with paths only
        const hasUploading = next.some((i) => i.status === 'uploading' || i.status === 'pending');
        if (hasUploading) return;
        const hasFile = next.some((i) => !!i.file);
        if (hasFile) return; // files are handled via single upload endpoint
        setSaving(true);
        const payload = {
            images: next.map((img, idx) => ({
                path: img.path,
                type: img.type,
                position: idx,
            })),
        };
        router.patch(`/products/${productSlug}/media`, payload as never, {
            preserveScroll: true,
            headers: { Accept: 'application/json' },
            onFinish: () => setSaving(false),
        } as never);
    }

    async function uploadSingle(file: File, position: number, targetIdx: number, controller?: AbortController) {
        if (!productSlug) return;
        const ctrl = controller ?? new AbortController();
        // mark uploading
        updateItem(targetIdx, { status: 'uploading', progress: 0, error: undefined });
        try {
            const res = await uploadMedia(productSlug, file, position, (p) => {
                updateItem(targetIdx, { progress: p.percent });
            }, ctrl.signal);
            const cur = imagesRef.current;
            const item = cur[targetIdx];
            if (item?.preview && item.preview.startsWith('blob:')) {
                try {
                    URL.revokeObjectURL(item.preview);
                } catch {}
            }
            const next = [...cur];
            const idx = targetIdx < next.length ? targetIdx : next.length - 1;
            next[idx] = {
                ...next[idx],
                path: res.uploaded.path,
                preview: res.uploaded.path,
                file: null,
                type: res.uploaded.type as 'image' | 'video',
                mime: res.uploaded.mime,
                position: res.uploaded.position,
                status: 'done',
                progress: 100,
                error: undefined,
                id: res.uploaded.id,
            };
            const serverMedia: MediaItem[] = res.media.map((m) => ({
                path: m.path,
                preview: m.path,
                file: null,
                position: m.position,
                type: m.type as 'image' | 'video',
                mime: m.mime,
                id: m.id,
                status: 'done' as const,
                progress: 100,
            }));
            const uploadingRemain = next.filter((n, i) => i !== idx && (n.status === 'uploading' || n.status === 'pending'));
            const merged = [...serverMedia.filter((m) => !uploadingRemain.some((u) => u.preview === m.path)), ...uploadingRemain];
            renumber(merged);
            onChange(merged);
        } catch (e: unknown) {
            const err = e as Error & { status?: number; name?: string };
            if (err.name === 'AbortError') {
                const cur = imagesRef.current;
                const next = cur.filter((_, i) => i !== targetIdx);
                renumber(next);
                onChange(next);
                return;
            }
            const msg = err.message || 'Gagal upload';
            updateItem(targetIdx, { status: 'error', error: msg, progress: undefined });
        }
    }

    function updateItem(idx: number, patch: Partial<MediaItem>) {
        const cur = imagesRef.current;
        const next = [...cur];
        if (!next[idx]) return;
        next[idx] = { ...next[idx], ...patch };
        onChange(next);
    }

    function handleFiles(files: FileList | null) {
        if (!files) return;
        setLocalError(null);
        const remaining = 6 - images.length;
        if (remaining <= 0) {
            setLocalError('Maksimal 6 media sudah tercapai.');
            return;
        }
        const sliced = Array.from(files).slice(0, remaining);
        if (autoSave && productSlug) {
            // Drive-like: preview instantly + async upload per file
            const next: MediaItem[] = [...images];
            const startIdx = next.length;
            const toUpload: { file: File; idx: number; pos: number }[] = [];
            for (const file of sliced) {
                const isVideo = file.type.startsWith('video/');
                const max = isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024;
                if (file.size > max) {
                    const preview = URL.createObjectURL(file);
                    next.push({
                        path: preview,
                        preview,
                        file,
                        position: next.length,
                        type: isVideo ? 'video' : 'image',
                        mime: file.type,
                        status: 'error',
                        error: isVideo ? 'Maksimal 100MB per video.' : 'Maksimal 2MB per foto.',
                    });
                    continue;
                }
                const preview = URL.createObjectURL(file);
                const item: MediaItem = {
                    path: preview,
                    preview,
                    file,
                    position: next.length,
                    type: isVideo ? 'video' : 'image',
                    mime: file.type,
                    status: 'pending',
                    progress: 0,
                };
                next.push(item);
                toUpload.push({ file, idx: next.length - 1, pos: item.position });
            }
            renumber(next);
            onChange(next);
            if (inputRef.current) inputRef.current.value = "";
            // start uploads after state pushed (next tick) — use setTimeout to allow render
            setTimeout(() => {
                for (const u of toUpload) {
                    // need to capture correct idx after renumber
                    uploadSingle(u.file, u.pos, u.idx);
                }
            }, 0);
        } else {
            // create mode: just preview, wait for final save (bulk)
            const next: MediaItem[] = [...images];
            for (const file of sliced) {
                const isVideo = file.type.startsWith('video/');
                const max = isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024;
                if (file.size > max) {
                    setLocalError(isVideo ? 'Maksimal 100MB per video.' : 'Maksimal 2MB per foto.');
                    continue;
                }
                const preview = URL.createObjectURL(file);
                next.push({ path: preview, file, preview, position: next.length, type: isVideo ? 'video' : 'image', mime: file.type, status: 'done' });
            }
            renumber(next);
            persist(next);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function removeAt(index: number) {
        const item = images[index];
        if (item?.preview && item.preview.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(item.preview);
            } catch {}
        }
        // if uploading, cancel would have been via onCancel; here just remove
        const next = images.filter((_, i) => i !== index);
        renumber(next);
        persist(next);
        setConfirmDeleteIdx(null);
    }

    function move(from: number, to: number) {
        if (to < 0 || to >= images.length) return;
        // block moving while uploading
        if (images.some((i) => i.status === 'uploading' || i.status === 'pending')) return;
        const next = [...images];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        renumber(next);
        persist(next);
    }

    function retryAt(idx: number) {
        const item = images[idx];
        if (!item?.file) return;
        uploadSingle(item.file, item.position, idx);
    }

    function cancelAt(idx: number) {
        const item = images[idx];
        if (item?.preview && item.preview.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(item.preview);
            } catch {}
        }
        const next = images.filter((_, i) => i !== idx);
        renumber(next);
        onChange(next);
        // if autoSave, need to sync delete via bulk patch (server still has not created if pending/error, else need delete)
        // For already uploaded (done), persist will patch
        if (autoSave && productSlug && item.status === 'done') {
            persist(next);
        }
    }

    const isUploading = images.some((i) => i.status === 'uploading' || i.status === 'pending');

    return (
        <div
            className={cn(
                "bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                        Media
                    </h3>
                    <p className="font-sans text-[11px] text-[#888] mt-1">
                        Maks 6 media · foto 2MB / video 100MB · streaming progresif
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={images.length >= 6 || isUploading}
                    aria-label="Tambah media"
                    className="p-2 text-[#888] hover:text-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title={isUploading ? 'Menunggu upload selesai' : undefined}
                >
                    <ImagePlus size={20} strokeWidth={1.5} />
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {images.length === 0 ? (
                <div className="border border-dashed border-[#e6e6e6] rounded-xl p-8 text-center bg-[#fafafa]">
                    <p className="font-sans text-[12px] text-[#aaa]">Belum ada media</p>
                    <p className="font-sans text-[11px] text-[#bbb] mt-1">Tambahkan foto atau video pendek untuk galeri</p>
                </div>
            ) : (
                <div className="max-h-[380px] overflow-y-auto pr-1 -mr-1">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {images.map((img, idx) => (
                            <ImageCard
                                key={`${img.path}-${idx}`}
                                src={img.preview ?? img.path}
                                type={img.type}
                                isPrimary={idx === 0}
                                isDetail={idx === 1}
                                position={idx}
                                canUp={idx > 0 && !isUploading}
                                canDown={idx < images.length - 1 && !isUploading}
                                onUp={() => move(idx, idx - 1)}
                                onDown={() => move(idx, idx + 1)}
                                onRemove={() => setConfirmDeleteIdx(idx)}
                                progress={img.progress}
                                status={img.status}
                                error={img.error}
                                onRetry={img.status === 'error' && img.file ? () => retryAt(idx) : undefined}
                                onCancel={() => cancelAt(idx)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {(error || localError) && (
                <p
                    className="font-sans text-[11px] text-red-500 mt-3"
                    role="alert"
                >
                    {error ?? localError}
                </p>
            )}

            <ConfirmDialog
                open={confirmDeleteIdx !== null}
                title="Hapus media?"
                message={`Media #${(confirmDeleteIdx ?? 0) + 1} akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onCancel={() => setConfirmDeleteIdx(null)}
                onConfirm={() => {
                    if (confirmDeleteIdx !== null) removeAt(confirmDeleteIdx);
                }}
            />
        </div>
    );
}
