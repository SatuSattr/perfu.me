import { ImagePlus } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ImageCard } from "./image-card";

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
}

export function MediaSection({
    images,
    onChange,
    error,
    className = "",
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

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
        onChange(next);
        if (inputRef.current) inputRef.current.value = "";
    }

    function renumber(list: MediaItem[]) {
        list.forEach((item, idx) => {
            item.position = idx;
        });
    }

    function removeAt(index: number) {
        const item = images[index];
        if (item?.preview && item.file) URL.revokeObjectURL(item.preview);
        const next = images.filter((_, i) => i !== index);
        renumber(next);
        onChange(next);
    }

    function move(from: number, to: number) {
        if (to < 0 || to >= images.length) return;
        const next = [...images];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        renumber(next);
        onChange(next);
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
                    className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white border border-[#1a1a1a] hover:bg-[#333] font-sans text-[11px] uppercase tracking-[0.12em] px-4 py-2 rounded-full transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ImagePlus size={14} strokeWidth={1.5} />
                    Tambah Foto
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                        <ImageCard
                            key={`${img.path}-${idx}`}
                            src={img.preview ?? img.path}
                            isPrimary={idx === 0}
                            position={idx}
                            canUp={idx > 0}
                            canDown={idx < images.length - 1}
                            onUp={() => move(idx, idx - 1)}
                            onDown={() => move(idx, idx + 1)}
                            onRemove={() => removeAt(idx)}
                        />
                    ))}
                </div>
            )}

            {images[1] && (
                <p className="font-sans text-[11px] text-[#888] mt-3">
                    Foto ke-2 otomatis jadi{" "}
                    <span className="text-[#1a1a1a] font-medium">
                        detail image
                    </span>{" "}
                    di store.
                </p>
            )}

            {error && (
                <p
                    className="font-sans text-[11px] text-red-500 mt-3"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
