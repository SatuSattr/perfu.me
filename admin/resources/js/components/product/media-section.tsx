import { ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { ImageCard } from "./image-card";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";

export interface MediaItem {
    path: string;
    file?: File | null;
    preview?: string;
    position: number;
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

    function renumber(list: MediaItem[]) {
        list.forEach((item, idx) => {
            item.position = idx;
        });
    }

    function persist(next: MediaItem[]) {
        onChange(next);
        if (!autoSave || !productSlug || saving) return;
        setSaving(true);
        const payload = {
            images: next.map((img, idx) => ({
                path: img.file ? '' : img.path,
                position: idx,
                file: img.file ?? null,
            })),
        };
        router.patch(`/products/${productSlug}/media`, payload as never, {
            preserveScroll: true,
            // @ts-expect-error forceFormData is valid for Inertia
            forceFormData: true,
            headers: { Accept: 'application/json' },
            onFinish: () => setSaving(false),
        } as never);
    }

    function handleFiles(files: FileList | null) {
        if (!files) return;
        const remaining = 6 - images.length;
        if (remaining <= 0) return;
        const sliced = Array.from(files).slice(0, remaining);
        const next: MediaItem[] = [...images];
        for (const file of sliced) {
            if (file.size > 2 * 1024 * 1024) continue;
            const preview = URL.createObjectURL(file);
            next.push({ path: preview, file, preview, position: next.length });
        }
        renumber(next);
        persist(next);
        if (inputRef.current) inputRef.current.value = "";
    }

    function removeAt(index: number) {
        const item = images[index];
        if (item?.preview && item.file) URL.revokeObjectURL(item.preview);
        const next = images.filter((_, i) => i !== index);
        renumber(next);
        persist(next);
        setConfirmDeleteIdx(null);
    }

    function move(from: number, to: number) {
        if (to < 0 || to >= images.length) return;
        const next = [...images];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        renumber(next);
        persist(next);
    }

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
                        Maks 6 foto · 2MB/foto · urutan menentukan tampil di
                        store
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={images.length >= 6}
                    aria-label="Tambah foto"
                    className="p-2 text-[#888] hover:text-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ImagePlus size={20} strokeWidth={1.5} />
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {images.length === 0 ? (
                <div className="border border-dashed border-[#e6e6e6] rounded-xl p-8 text-center bg-[#fafafa]">
                    <p className="font-sans text-[12px] text-[#aaa]">
                        Belum ada foto
                    </p>
                    <p className="font-sans text-[11px] text-[#bbb] mt-1">
                        Tambahkan foto untuk galeri produk
                    </p>
                </div>
            ) : (
                <div className="max-h-[380px] overflow-y-auto pr-1 -mr-1">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {images.map((img, idx) => (
                            <ImageCard
                                key={`${img.path}-${idx}`}
                                src={img.preview ?? img.path}
                                isPrimary={idx === 0}
                                isDetail={idx === 1}
                                position={idx}
                                canUp={idx > 0}
                                canDown={idx < images.length - 1}
                                onUp={() => move(idx, idx - 1)}
                                onDown={() => move(idx, idx + 1)}
                                onRemove={() => setConfirmDeleteIdx(idx)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <p
                    className="font-sans text-[11px] text-red-500 mt-3"
                    role="alert"
                >
                    {error}
                </p>
            )}

            <ConfirmDialog
                open={confirmDeleteIdx !== null}
                title="Hapus foto?"
                message={`Foto #${(confirmDeleteIdx ?? 0) + 1} akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
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
