import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    src: string;
    isPrimary?: boolean;
    position: number;
    canUp?: boolean;
    canDown?: boolean;
    onUp?: () => void;
    onDown?: () => void;
    onRemove?: () => void;
    className?: string;
}

export function ImageCard({ src, isPrimary, position, canUp, canDown, onUp, onDown, onRemove, className = '' }: Props) {
    return (
        <div className={cn('relative rounded-xl border border-[#e6e6e6] bg-[#f7f7f7] overflow-hidden aspect-square group shrink-0', className)}>
            <img src={src} alt={`Foto ${position + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxWidth: '100%' }} loading="lazy" />
            {isPrimary && (
                <span className="absolute left-1.5 top-1.5 bg-[#1a1a1a] text-white text-[8px] uppercase tracking-[0.12em] font-sans font-medium px-2 py-1 rounded-full">
                    Utama
                </span>
            )}
            <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                <span className="bg-white/90 backdrop-blur text-[#1a1a1a] text-[10px] font-sans font-medium px-1.5 py-1 rounded-full border border-[#e6e6e6]">#{position + 1}</span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onUp}
                        disabled={!canUp}
                        aria-label="Pindah ke atas"
                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a] hover:text-[#1a1a1a] inline-flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronUp size={12} strokeWidth={1.8} />
                    </button>
                    <button
                        type="button"
                        onClick={onDown}
                        disabled={!canDown}
                        aria-label="Pindah ke bawah"
                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a] hover:text-[#1a1a1a] inline-flex items-center justify-center transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronDown size={12} strokeWidth={1.8} />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label="Hapus foto"
                        className="w-7 h-7 rounded-full bg-white border border-[#e6e6e6] text-[#888] hover:border-red-400 hover:text-red-500 inline-flex items-center justify-center transition-colors duration-200"
                    >
                        <X size={12} strokeWidth={1.8} />
                    </button>
                </div>
            </div>
        </div>
    );
}
