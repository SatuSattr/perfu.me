import { Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OptionCard, type OptionItem } from './option-card';

interface Props {
    options: OptionItem[];
    onChange: (next: OptionItem[]) => void;
    type: 'signature' | 'inspired';
    className?: string;
}

export function OptionsSection({ options, onChange, type, className = '' }: Props) {
    function renumber(list: OptionItem[]) {
        return list.map((o, i) => ({ ...o, position: i, choices: o.choices.map((c, ci) => ({ ...c, position: ci })) }));
    }

    function addOption() {
        const next: OptionItem[] = [
            ...options,
            {
                key: `opsi-${options.length + 1}`,
                label: '',
                mode: 'dropdown',
                required: true,
                position: options.length,
                choices: [],
            },
        ];
        onChange(renumber(next));
    }

    function removeAt(idx: number) {
        onChange(renumber(options.filter((_, i) => i !== idx)));
    }

    function move(from: number, to: number) {
        if (to < 0 || to >= options.length) return;
        const next = [...options];
        const [m] = next.splice(from, 1);
        next.splice(to, 0, m);
        onChange(renumber(next));
    }

    return (
        <div className={cn('bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6', className)}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">Varian</h3>
                    <p className="font-sans text-[11px] text-[#888] mt-1">Urutan opsi & pilihan menentukan tampil di halaman detail store · up/down untuk atur</p>
                    {type === 'signature' && options.length > 0 && (
                        <p className="font-sans text-[11px] text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Tipe signature biasanya tanpa varian — varian akan tetap disimpan.</p>
                    )}
                </div>
                <Button variant="primary" size="md" onClick={addOption}>
                    <Plus size={14} strokeWidth={1.8} />
                    Tambah Opsi
                </Button>
            </div>

            {options.length === 0 ? (
                <div className="bg-[#fafafa] rounded-xl border border-dashed border-[#e6e6e6] p-8 text-center">
                    <Tag size={20} strokeWidth={1.5} className="mx-auto text-[#bbb]" />
                    <p className="font-sans text-[12px] text-[#888] mt-2">Belum ada varian</p>
                    <p className="font-sans text-[11px] text-[#aaa]">Tambah untuk produk inspired — kosong = produk signature</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {options.map((opt, idx) => (
                        <OptionCard
                            key={`${opt.key}-${idx}`}
                            option={opt}
                            index={idx}
                            total={options.length}
                            onChange={(patch) => {
                                const next = options.map((o, i) => (i === idx ? { ...o, ...patch } : o));
                                onChange(renumber(next));
                            }}
                            onRemove={() => removeAt(idx)}
                            onMoveUp={() => move(idx, idx - 1)}
                            onMoveDown={() => move(idx, idx + 1)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
