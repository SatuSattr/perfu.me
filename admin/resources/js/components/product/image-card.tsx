import { ChevronDown, ChevronUp, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
    src: string;
    type?: 'image' | 'video';
    isPrimary?: boolean;
    isDetail?: boolean;
    position: number;
    canUp?: boolean;
    canDown?: boolean;
    onUp?: () => void;
    onDown?: () => void;
    onRemove?: () => void;
    className?: string;
    progress?: number;
    status?: 'uploading' | 'done' | 'error' | 'pending';
    error?: string;
    onRetry?: () => void;
    onCancel?: () => void;
}

export function ImageCard({ src, type = 'image', isPrimary, isDetail, position, canUp, canDown, onUp, onDown, onRemove, className = '', progress, status, error, onRetry, onCancel }: Props) {
    const isVideo = type === 'video';
    const isUploading = status === 'uploading' || status === 'pending';
    const isError = status === 'error';
    return (
        <div className={cn('relative rounded-xl border border-[#e6e6e6] bg-[#f7f7f7] overflow-hidden aspect-square group shrink-0', className, isUploading && 'ring-1 ring-[#1a1a1a]/10')}>
            {isVideo ? (
                <video src={src} className="w-full h-full object-cover block" muted loop playsInline preload="metadata" controls={false} />
            ) : (
                <img src={src} alt={`Foto ${position + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxWidth: '100%' }} loading="lazy" />
            )}
            {isVideo && !isUploading && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-1.5 pointer-events-none">
                    <Play size={12} fill="white" strokeWidth={1.5} />
                </span>
            )}
            {isVideo ? (
                <span className="absolute left-1 top-1 bg-[#1a1a1a] text-white text-[7px] uppercase tracking-[0.12em] font-sans font-medium px-1.5 py-0.5 rounded-full">Video</span>
            ) : isPrimary ? (
                <span className="absolute left-1 top-1 bg-[#1a1a1a] text-white text-[7px] uppercase tracking-[0.12em] font-sans font-medium px-1.5 py-0.5 rounded-full">
                    Utama
                </span>
            ) : isDetail ? (
                <span className="absolute left-1 top-1 bg-white text-[#1a1a1a] text-[7px] uppercase tracking-[0.12em] font-sans font-medium px-1.5 py-0.5 rounded-full border border-[#e6e6e6] shadow-sm">
                    Detail
                </span>
            ) : null}

            {/* Drive-like uploading overlay */}
            {isUploading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 p-2">
                    <span className="h-6 w-6 rounded-full border-2 border-[#e6e6e6] border-t-[#1a1a1a] animate-spin" aria-hidden="true" />
                    <span className="font-sans text-[10px] font-medium text-[#1a1a1a]">{progress ?? 0}%</span>
                    <div className="w-full h-1 bg-[#e6e6e6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1a1a1a] transition-all duration-200" style={{ width: `${progress ?? 0}%` }} />
                    </div>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="font-sans text-[10px] text-[#888] hover:text-[#1a1a1a] underline underline-offset-2">
                            Batal
                        </button>
                    )}
                </div>
            )}

            {isError && (
                <div className="absolute inset-0 bg-red-50/90 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 p-2 text-center">
                    <span className="font-sans text-[10px] font-medium text-red-600 leading-tight line-clamp-2 px-1">{error ?? 'Gagal upload'}</span>
                    <div className="flex items-center gap-1">
                        {onRetry && (
                            <button type="button" onClick={onRetry} className="font-sans text-[10px] font-medium text-[#1a1a1a] bg-white border border-[#e6e6e6] rounded-full px-2 py-1 hover:border-[#1a1a1a] transition-colors">
                                Coba lagi
                            </button>
                        )}
                        {onCancel && (
                            <button type="button" onClick={onCancel} className="font-sans text-[10px] text-[#888] hover:text-[#1a1a1a]">
                                Hapus
                            </button>
                        )}
                    </div>
                </div>
            )}

            {!isUploading && !isError && (
                <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
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
            )}
        </div>
    );
}
