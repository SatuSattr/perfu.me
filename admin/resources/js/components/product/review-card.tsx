import { Star, Pencil, Trash2, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input, TextArea } from '@/components/ui/input';

export interface ReviewItem {
    id?: number;
    name: string;
    rating: number;
    date: string;
    message: string;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface Props {
    review: ReviewItem;
    onSave: (next: ReviewItem) => void;
    onDelete: () => void;
    isEditing?: boolean;
    onEditingChange?: (editing: boolean) => void;
    isEdited?: boolean;
    className?: string;
}

export function ReviewCard({ review, onSave, onDelete, isEditing, onEditingChange, isEdited, className = '' }: Props) {
    const [internalEditing, setInternalEditing] = useState(false);
    const editing = isEditing ?? internalEditing;
    const setEditing = onEditingChange ?? setInternalEditing;
    const [draft, setDraft] = useState<ReviewItem>(review);

    useEffect(() => {
        if (editing) setDraft(review);
    }, [review, editing]);

    function handleSave() {
        if (!draft.name.trim() || !draft.message.trim()) return;
        onSave(draft);
        setEditing(false);
    }

    if (editing) {
        return (
            <div className={cn('rounded-xl border border-[#1a1a1a]/15 bg-[#f0f0f0] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-3', className)}>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6">
                        <Input label="Nama" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Rafi A." />
                    </div>
                    <div className="col-span-6">
                        <Input label="Tanggal" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="18 Aug 2026" />
                    </div>
                    <div className="col-span-12 flex items-center gap-2">
                        <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-[#888]">Rating</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setDraft({ ...draft, rating: s })}
                                    className={cn('p-1', s <= draft.rating ? 'text-amber-400' : 'text-[#e6e6e6]')}
                                >
                                    <Star size={14} fill={s <= draft.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12">
                        <TextArea label="Pesan" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} rows={2} placeholder="Aromanya..." />
                    </div>
                    <div className="col-span-12 flex justify-end gap-1.5 mt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setDraft(review);
                                setEditing(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e6e6e6] text-[#666] hover:border-[#1a1a1a] font-sans text-[11px] transition-colors"
                        >
                            <X size={12} strokeWidth={1.8} />
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white hover:bg-[#333] font-sans text-[11px] transition-colors"
                        >
                            <Check size={12} strokeWidth={1.8} />
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => setEditing(true)}
            className={cn(
                'group relative flex gap-2.5 p-3 rounded-xl border overflow-hidden cursor-pointer transition-colors',
                isEdited ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300' : 'border-transparent hover:border-[#e6e6e6] hover:bg-[#fafafa]',
                className,
            )}
        >
            {isEdited && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-400" aria-hidden="true" />}
            <div className="w-7 h-7 rounded-full bg-[#f5f5f5] border border-[#e6e6e6] flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-sans text-[10px] font-medium tracking-[0.08em] text-[#1a1a1a]">{getInitials(review.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-sans text-[12px] font-medium text-[#1a1a1a] leading-none">{review.name || 'Tanpa nama'}</span>
                    <span className="flex gap-0.5 items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} fill={s <= review.rating ? 'currentColor' : 'none'} strokeWidth={1.5} className={s <= review.rating ? 'text-amber-400' : 'text-[#e6e6e6]'} />
                        ))}
                    </span>
                    <span className="text-[#ddd] text-[10px]">·</span>
                    <span className="font-sans text-[10px] text-[#aaa] leading-none">{review.date || '-'}</span>
                </div>
                <p className="font-sans text-[12.5px] leading-[1.6] text-[#555] mt-1.5 break-words">{review.message || '—'}</p>
            </div>
            <div className="hidden group-hover:flex items-center justify-center gap-1.5 shrink-0 self-center">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditing(true);
                    }}
                    aria-label="Edit ulasan"
                    className="w-7 h-7 rounded-full bg-white border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a] hover:text-[#1a1a1a] inline-flex items-center justify-center transition-colors"
                >
                    <Pencil size={12} strokeWidth={1.5} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    aria-label="Hapus ulasan"
                    className="w-7 h-7 rounded-full bg-white border border-[#e6e6e6] text-[#888] hover:border-red-400 hover:text-red-500 inline-flex items-center justify-center transition-colors"
                >
                    <Trash2 size={12} strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}
