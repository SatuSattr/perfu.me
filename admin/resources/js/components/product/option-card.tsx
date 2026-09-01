import { ChevronDown, ChevronUp, X, Plus, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
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
    onChange: (patch: Partial<OptionItem>) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    className?: string;
}

export function OptionCard({ option, index, total, onChange, onRemove, onMoveUp, onMoveDown, className = '' }: Props) {
    const [collapsed, setCollapsed] = useState(false);

    function updateChoices(next: ChoiceItem[]) {
        onChange({ choices: next.map((c, i) => ({ ...c, position: i })) });
    }

    function addChoice() {
        const next: ChoiceItem[] = [
            ...option.choices,
            { key: `pilihan-${option.choices.length + 1}`, name: '', price: null, stock: 0, position: option.choices.length },
        ];
        updateChoices(next);
    }

    return (
        <div className={cn('bg-white border border-[#e6e6e6] rounded-2xl p-4', className)}>
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex w-7 h-7 rounded-full bg-[#f5f5f5] border border-[#e6e6e6] items-center justify-center shrink-0 mt-6">
                    <GripVertical size={12} strokeWidth={1.5} className="text-[#bbb]" />
                </span>
                <div className="flex-1 grid grid-cols-12 gap-3">
                    <div className="col-span-6 sm:col-span-3">
                        <Input label="Key" value={option.key} onChange={(e) => onChange({ key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })} placeholder="aroma" />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                        <Input label="Label" value={option.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Pilih Aroma" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                        <Combobox
                            label="Mode"
                            placeholder="Pilih mode"
                            value={{ code: option.mode, name: option.mode === 'dropdown' ? 'Dropdown' : 'Pill' }}
                            onSelect={(opt) => onChange({ mode: opt.code as OptionItem['mode'] })}
                            options={[
                                { code: 'dropdown', name: 'Dropdown' },
                                { code: 'normal', name: 'Pill' },
                            ]}
                            typeable={false}
                        />
                    </div>
                    <div className="col-span-6 sm:col-span-2 flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
                            <input
                                type="checkbox"
                                checked={option.required}
                                onChange={(e) => onChange({ required: e.target.checked })}
                                className="w-[14px] h-[14px] rounded border-[#e6e6e6] text-[#1a1a1a] focus:ring-[#1a1a1a]"
                            />
                            <span className="font-sans text-[11px] text-[#666]">Wajib</span>
                        </label>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-6">
                    <span className="hidden sm:inline-flex font-sans text-[10px] text-[#aaa] mr-1">#{index + 1}</span>
                    <Button variant="secondary" size="icon-sm" onClick={onMoveUp} disabled={index === 0} aria-label="Pindah ke atas">
                        <ChevronUp size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={onMoveDown} disabled={index === total - 1} aria-label="Pindah ke bawah">
                        <ChevronDown size={12} strokeWidth={1.8} />
                    </Button>
                    <Button variant="secondary" size="icon-sm" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? 'Buka' : 'Tutup'}>
                        <ChevronDown size={12} strokeWidth={1.8} className={cn('transition-transform', collapsed && '-rotate-90')} />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={onRemove} aria-label="Hapus opsi" className="text-[#888] hover:border-red-400 hover:text-red-500">
                        <X size={12} strokeWidth={1.8} />
                    </Button>
                </div>
            </div>

            {!collapsed && (
                <div className="mt-4 border-t border-[#f5f5f5] pt-4">
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
                                        onChange({ choices: next });
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
            )}
        </div>
    );
}
