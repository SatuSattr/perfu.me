import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface ChoiceItem {
    key: string;
    name: string;
    price: number | null;
    stock: number;
    position: number;
}

interface Props {
    choice: ChoiceItem;
    canUp?: boolean;
    canDown?: boolean;
    onUp?: () => void;
    onDown?: () => void;
    onRemove?: () => void;
    onChange: (patch: Partial<ChoiceItem>) => void;
    className?: string;
}

export function ChoiceRow({ choice, canUp, canDown, onUp, onDown, onRemove, onChange, className = '' }: Props) {
    return (
        <div className={cn('grid grid-cols-12 gap-2 items-end bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-3', className)}>
            <div className="col-span-5 sm:col-span-4">
                <Input
                    label="Nama"
                    value={choice.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        const autoKey = name
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '');
                        onChange({ name, key: autoKey || choice.key });
                    }}
                    placeholder="Creed Aventus"
                    className="py-2.5 text-[12px]"
                />
            </div>
            <div className="col-span-3 sm:col-span-3">
                <Input label="Key" value={choice.key} onChange={(e) => onChange({ key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })} placeholder="creed-aventus" className="py-2.5 text-[12px]" />
            </div>
            <div className="col-span-2 sm:col-span-2">
                <Input
                    label="Harga"
                    type="number"
                    value={choice.price ?? ''}
                    onChange={(e) => onChange({ price: e.target.value === '' ? null : Number(e.target.value) })}
                    placeholder="Kosong = default"
                    className="py-2.5 text-[12px]"
                />
            </div>
            <div className="col-span-2 sm:col-span-2">
                <Input label="Stok" type="number" value={choice.stock} onChange={(e) => onChange({ stock: Number(e.target.value) })} className="py-2.5 text-[12px]" />
            </div>
            <div className="col-span-12 sm:col-span-1 flex items-center justify-end sm:justify-center gap-1 pt-1">
                <button
                    type="button"
                    onClick={onUp}
                    disabled={!canUp}
                    aria-label="Pindah ke atas"
                    className="w-7 h-7 rounded-full bg-white border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a] inline-flex items-center justify-center transition-colors disabled:opacity-40"
                >
                    <ChevronUp size={12} strokeWidth={1.8} />
                </button>
                <button
                    type="button"
                    onClick={onDown}
                    disabled={!canDown}
                    aria-label="Pindah ke bawah"
                    className="w-7 h-7 rounded-full bg-white border border-[#e6e6e6] text-[#555] hover:border-[#1a1a1a] inline-flex items-center justify-center transition-colors disabled:opacity-40"
                >
                    <ChevronDown size={12} strokeWidth={1.8} />
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Hapus pilihan"
                    className="w-7 h-7 rounded-full bg-white border border-[#e6e6e6] text-[#888] hover:border-red-400 hover:text-red-500 inline-flex items-center justify-center transition-colors"
                >
                    <X size={12} strokeWidth={1.8} />
                </button>
            </div>
        </div>
    );
}
