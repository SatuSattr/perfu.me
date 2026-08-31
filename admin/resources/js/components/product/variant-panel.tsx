import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChoiceRow, type ChoiceItem } from './choice-row';

export interface OptionItem {
    key: string;
    label: string;
    mode: 'dropdown' | 'normal';
    required: boolean;
    position: number;
    choices: ChoiceItem[];
}

interface Props {
    option: OptionItem;
    index: number;
    total: number;
    onEdit: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onChoicesChange: (next: ChoiceItem[]) => void;
    className?: string;
}

export function VariantPanel({ option, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onChoicesChange, className = '' }: Props) {
    function updateChoices(next: ChoiceItem[]) {
        onChoicesChange(next.map((c, i) => ({ ...c, position: i })));
    }

    function addChoice() {
        const next: ChoiceItem[] = [
            ...option.choices,
            { key: `pilihan-${option.choices.length + 1}`, name: '', price: null, stock: 0, position: option.choices.length },
        ];
        updateChoices(next);
    }

    return (
        <div className={cn('bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6', className)}>
            {/* Header: Varian - {label} */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                            Varian — {option.label || option.key || `#${index + 1}`}
                        </h3>
                        <Badge className="text-[8px]">{option.mode === 'dropdown' ? 'Dropdown' : 'Pill'}</Badge>
                        {option.required && (
                            <span className="font-sans text-[9px] uppercase tracking-[0.12em] text-[#888] bg-[#f5f5f5] border border-[#e6e6e6] rounded-full px-2 py-0.5">
                                Wajib
                            </span>
                        )}
                    </div>
                    <p className="font-sans text-[11px] text-[#888] mt-1 truncate">
                        key: <span className="font-mono text-[#555]">{option.key || '—'}</span> · {option.choices.length} pilihan
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button variant="secondary" size="icon-sm" onClick={onMoveUp} disabled={index === 0} aria-label="Pindah ke atas">
                        <ChevronUp size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onMoveDown} disabled={index === total - 1} aria-label="Pindah ke bawah">
                        <ChevronDown size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onEdit} aria-label="Edit varian">
                        <Pencil size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={onDelete} aria-label="Hapus varian" className="text-[#888] hover:border-red-400 hover:text-red-500">
                        <Trash2 size={12} strokeWidth={1.8} />
                    </Button>
                </div>
            </div>

            {/* Choices */}
            <div className="mt-5 border-t border-[#f5f5f5] pt-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">Pilihan ({option.choices.length})</span>
                    <Button variant="secondary" size="sm" onClick={addChoice} className="text-[10px]">
                        <Plus size={12} strokeWidth={1.8} />
                        Tambah Pilihan
                    </Button>
                </div>

                {option.choices.length === 0 ? (
                    <p className="font-sans text-[12px] text-[#aaa] text-center py-6 bg-[#fafafa] rounded-xl border border-dashed border-[#e6e6e6]">Belum ada pilihan</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {option.choices.map((choice, idx) => (
                            <ChoiceRow
                                key={`${choice.key}-${idx}`}
                                choice={choice}
                                canUp={idx > 0}
                                canDown={idx < option.choices.length - 1}
                                onUp={() => {
                                    const next = [...option.choices];
                                    const [m] = next.splice(idx, 1);
                                    next.splice(idx - 1, 0, m);
                                    updateChoices(next);
                                }}
                                onDown={() => {
                                    const next = [...option.choices];
                                    const [m] = next.splice(idx, 1);
                                    next.splice(idx + 1, 0, m);
                                    updateChoices(next);
                                }}
                                onRemove={() => updateChoices(option.choices.filter((_, i) => i !== idx))}
                                onChange={(patch) => {
                                    const next = option.choices.map((c, i) => (i === idx ? { ...c, ...patch } : c));
                                    // keep position stable, don't renumber here — parent handles via updateChoices on reorder
                                    onChoicesChange(next);
                                }}
                            />
                        ))}
                    </div>
                )}

                {option.mode === 'normal' && option.choices.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {option.choices.map((c) => (
                            <span key={c.key} className="px-3 py-1.5 rounded-full bg-[#f5f5f5] border border-[#e6e6e6] font-sans text-[11px] text-[#1a1a1a]">
                                {c.name || c.key}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
