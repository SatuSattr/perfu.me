import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import type { OptionItem } from './variant-panel';

interface Props {
    mode: 'create' | 'edit';
    initial?: OptionItem;
    onClose: () => void;
    onSave: (draft: OptionItem) => void;
    onDirtyChange?: (dirty: boolean) => void;
    className?: string;
}

const defaultDraft = (pos: number): OptionItem => ({
    key: '',
    label: '',
    mode: 'dropdown',
    required: true,
    is_base: false,
    position: pos,
    choices: [],
});

export function VariantFormPanel({ mode, initial, onClose, onSave, onDirtyChange, className = '' }: Props) {
    const initDraft: OptionItem = React.useMemo(() => {
        if (initial) return { ...initial, choices: [...(initial.choices ?? [])] };
        return defaultDraft(0);
    }, [initial]);

    const [draft, setDraft] = React.useState<OptionItem>(initDraft);
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
        if (!draft.key.trim()) e.key = 'Key wajib diisi.';
        else if (!/^[a-z0-9_-]+$/.test(draft.key)) e.key = 'Hanya a-z, 0-9, _ dan -.';
        if (!draft.label.trim()) e.label = 'Label wajib diisi.';
        if (!['dropdown', 'normal'].includes(draft.mode)) e.mode = 'Mode tidak valid.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSave() {
        if (!validate()) return;
        // ensure slugified key
        const cleaned: OptionItem = {
            ...draft,
            key: draft.key.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
            label: draft.label.trim(),
        };
        onSave(cleaned);
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-col gap-4">
                <Input
                    label="Key *"
                    value={draft.key}
                    onChange={(e) => setDraft({ ...draft, key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                    placeholder="aroma"
                    error={errors.key}
                    autoFocus
                />
                <Input
                    label="Label *"
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                    placeholder="Pilih Aroma"
                    error={errors.label}
                />
                <Combobox
                    label="Mode *"
                    placeholder="Pilih mode"
                    value={{ code: draft.mode, name: draft.mode === 'dropdown' ? 'Dropdown' : 'Pill' }}
                    onSelect={(opt) => setDraft({ ...draft, mode: opt.code as OptionItem['mode'] })}
                    options={[
                        { code: 'dropdown', name: 'Dropdown' },
                        { code: 'normal', name: 'Pill' },
                    ]}
                    error={errors.mode}
                    typeable={false}
                />
                <div className="pt-1">
                    <Checkbox
                        label="Wajib dipilih"
                        description="pelanggan harus memilih salah satu pilihan sebelum checkout"
                        checked={draft.required}
                        onCheckedChange={(v) => setDraft({ ...draft, required: v })}
                    />
                </div>
                <div className="pt-1">
                    <Checkbox
                        label="Varian dasar"
                        description="harga terendah dari varian ini tampil di katalog; hanya satu varian bisa jadi dasar"
                        checked={draft.is_base}
                        onCheckedChange={(v) => setDraft({ ...draft, is_base: v, required: v ? true : draft.required })}
                    />
                </div>
                {errors.required && (
                    <p className="font-sans text-[11px] text-red-500" role="alert">
                        {errors.required}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f5f5f5] mt-2">
                <Button variant="outline" size="md" onClick={onClose}>
                    Batal
                </Button>
                <Button variant="primary" size="md" onClick={handleSave}>
                    <Check size={12} strokeWidth={1.8} />
                    {mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Varian'}
                </Button>
            </div>
        </div>
    );
}
