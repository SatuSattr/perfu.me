import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
    src: string;
    isPrimary?: boolean;
    isDetail?: boolean;
    position: number;
    canUp?: boolean;
    canDown?: boolean;
    onUp?: () => void;
    onDown?: () => void;
    onRemove?: () => void;
    className?: string;
}

export function ImageCard({ src, isPrimary, isDetail, position, canUp, canDown, onUp, onDown, onRemove, className = '' }: Props) {
    return (
        <div className={cn('relative rounded-xl border border-[#e6e6e6] bg-[#f7f7f7] overflow-hidden aspect-square group shrink-0', className)}>
            <img src={src} alt={`Foto ${position + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxWidth: '100%' }} loading="lazy" />
            {isPrimary ? (
                <span className="absolute left-1 top-1 bg-[#1a1a1a] text-white text-[7px] uppercase tracking-[0.12em] font-sans font-medium px-1.5 py-0.5 rounded-full">
                    Utama
                </span>
            ) : isDetail ? (
                <span className="absolute left-1 top-1 bg-white text-[#1a1a1a] text-[7px] uppercase tracking-[0.12em] font-sans font-medium px-1.5 py-0.5 rounded-full border border-[#e6e6e6] shadow-sm">
                    Detail
                </span>
            ) : null}
            <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-0.5">
                <span className="bg-white/90 backdrop-blur text-[#1a1a1a] text-[8px] font-sans font-medium px-1 py-0.5 rounded-full border border-[#e6e6e6] leading-none">#{position + 1}</span>
                <div className="flex items-center gap-0.5">
                    <Button variant="secondary" size="icon-sm" onClick={onUp} disabled={!canUp} aria-label="Pindah ke atas" className="bg-white/90 backdrop-blur h-5 w-5 p-0">
                        <ChevronUp size={10} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onDown} disabled={!canDown} aria-label="Pindah ke bawah" className="bg-white/90 backdrop-blur h-5 w-5 p-0">
                        <ChevronDown size={10} strokeWidth={1.8} />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={onRemove} aria-label="Hapus foto" className="text-[#888] hover:border-red-400 hover:text-red-500 h-5 w-5 p-0">
                        <X size={10} strokeWidth={1.8} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
