import { router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input, TextArea } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Draft {
    id?: number;
    slug: string;
    name: string;
    description: string;
    is_active: boolean;
}

interface Props {
    mode: 'create' | 'edit';
    table: 'category' | 'type';
    initial?: Draft;
    onClose: () => void;
    onSuccess?: () => void;
    onDirtyChange?: (dirty: boolean) => void;
    className?: string;
}

function slugify(s: string): string {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function CategoryFormPanel({ mode, table, initial, onClose, onSuccess, onDirtyChange, className = '' }: Props) {
    const initDraft: Draft = React.useMemo(
        () => ({
            slug: initial?.slug ?? '',
            name: initial?.name ?? '',
            description: initial?.description ?? '',
            is_active: initial?.is_active ?? true,
        }),
        [initial],
    );

    const [draft, setDraft] = React.useState<Draft>(initDraft);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [saving, setSaving] = React.useState(false);

    const autoSlug = React.useMemo(() => slugify(draft.name), [draft.name]);

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
        if (draft.name.trim().length > 40) e.name = 'Maksimal 40 karakter.';
        if (draft.slug && !/^[a-z0-9-]+$/.test(draft.slug)) e.slug = 'Slug hanya a-z, 0-9, -.';
        if (draft.description && draft.description.length > 500) e.description = 'Maksimal 500 karakter.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSave() {
        if (!validate() || saving) return;
        setSaving(true);
        const payload = {
            name: draft.name.trim(),
            slug: draft.slug || autoSlug || null,
            description: draft.description || null,
            is_active: !!draft.is_active,
        };

        const base = table === 'category' ? '/categories' : '/categories/types';
        const opts = {
            preserveScroll: true,
            headers: { Accept: 'application/json' },
            onError: (errs: Record<string, string>) => {
                setErrors(errs as Record<string, string>);
                setSaving(false);
            },
            onSuccess: () => {
                setSaving(false);
                setErrors({});
                onSuccess?.();
            },
            onFinish: () => setSaving(false),
        } as never;

        if (mode === 'edit' && initial?.id) {
            // need slug for route; use initial slug
            const slug = initial.slug;
            const url = table === 'category' ? `/categories/${slug}` : `/categories/types/${slug}`;
            router.put(url, payload as never, opts);
        } else {
            router.post(base, payload as never, opts);
        }
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-col gap-4">
                <Input
                    label="Nama *"
                    value={draft.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        setDraft((d) => ({ ...d, name, slug: d.slug ? d.slug : slugify(name) }));
                    }}
                    placeholder={table === 'category' ? 'EDP' : 'Signature'}
                    error={errors.name}
                    autoFocus
                    required
                />
                <Input
                    label="Slug"
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder={autoSlug || (table === 'category' ? 'edp' : 'signature')}
                    error={errors.slug}
                />
                <TextArea
                    label="Deskripsi"
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Deskripsi singkat"
                    rows={3}
                    error={errors.description}
                />
                <Switch
                    label="Aktif"
                    description="tampil di store & pilihan produk jika aktif"
                    checked={draft.is_active}
                    onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
                    labelClassName="font-medium"
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#f5f5f5] mt-2">
                <Button variant="outline" size="md" onClick={onClose} disabled={saving} className="rounded-full">
                    Batal
                </Button>
                <Button variant="primary" size="md" onClick={handleSave} disabled={saving} className="rounded-full">
                    <Check size={12} strokeWidth={1.8} />
                    {saving ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
            </div>
        </div>
    );
}
