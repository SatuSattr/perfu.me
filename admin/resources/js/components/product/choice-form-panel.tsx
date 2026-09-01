import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChoiceItem } from './choice-row';

interface Props {
    mode: 'create' | 'edit';
    initial?: ChoiceItem;
    onClose: () => void;
    onSave: (draft: ChoiceItem) => void;
    onDirtyChange?: (dirty: boolean) => void;
    className?: string;
}

export function ChoiceFormPanel({ mode, initial, onClose, onSave, onDirtyChange, className = '' }: Props) {
    const initDraft: ChoiceItem = React.useMemo(
        () => ({
            key: initial?.key ?? '',
            name: initial?.name ?? '',
            price: initial?.price ?? 0,
            stock: initial?.stock ?? 0,
            position: initial?.position ?? 0,
        }),
        [initial],
    );

    const [draft, setDraft] = React.useState<ChoiceItem>(initDraft);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        setDraft(initDraft);
        setErrors({});
    }, [initDraft]);

    const isDirty = React.useMemo(() => JSON.stringify(draft) !== JSON.stringify(initDraft), [draft, initDraft]);

    React.useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!draft.name.trim()) e.name = 'Nama wajib diisi.';
        if (!draft.key.trim()) e.key = 'Key wajib diisi.';
        else if (!/^[a-z0-9_-]+$/.test(draft.key)) e.key = 'Hanya a-z, 0-9, _ dan -.';
        if (draft.stock === null || draft.stock === undefined || Number.isNaN(Number(draft.stock))) e.stock = 'Stok wajib diisi.';
        else if (Number(draft.stock) < 0) e.stock = 'Minimal 0.';
        if (draft.price === null || draft.price === undefined || Number.isNaN(Number(draft.price))) e.price = 'Harga wajib diisi.';
        else if (Number(draft.price) < 0) e.price = 'Minimal 0.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSave() {
        if (!validate()) return;
        const cleaned: ChoiceItem = {
            ...draft,
            key: draft.key.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
            name: draft.name.trim(),
            price: Number(draft.price),
            stock: Number(draft.stock),
        };
        onSave(cleaned);
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-col gap-4">
                <Input
                    label="Nama *"
                    value={draft.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        const autoKey = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        setDraft({ ...draft, name, key: autoKey || draft.key });
                    }}
                    placeholder="Creed Aventus"
                    error={errors.name}
                    autoFocus
                />
                <Input
                    label="Key *"
                    value={draft.key}
                    onChange={(e) => setDraft({ ...draft, key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                    placeholder="creed-aventus"
                    error={errors.key}
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Harga *"
                        type="number"
                        value={draft.price ?? 0}
                        onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                        placeholder="0"
                        error={errors.price}
                    />
                    <Input label="Stok *" type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} error={errors.stock} />
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f5f5f5] mt-2">
                <Button variant="outline" size="md" onClick={onClose}>
                    Batal
                </Button>
                <Button variant="primary" size="md" onClick={handleSave}>
                    <Check size={12} strokeWidth={1.8} />
                    {mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Pilihan'}
                </Button>
            </div>
        </div>
    );
}
