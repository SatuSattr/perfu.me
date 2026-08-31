import * as React from 'react';
import { router } from '@inertiajs/react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, TextArea } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ReviewDraft {
    name: string;
    rating: number;
    date: string;
    message: string;
}

interface Props {
    mode: 'create' | 'edit';
    productSlug: string;
    initial?: ReviewDraft & { id?: number };
    onClose: () => void;
    onSuccess?: () => void;
    onDirtyChange?: (dirty: boolean) => void;
    className?: string;
}

export function ReviewFormPanel({ mode, productSlug, initial, onClose, onSuccess, onDirtyChange, className = '' }: Props) {
    const initDraft: ReviewDraft = React.useMemo(
        () => ({
            name: initial?.name ?? '',
            rating: initial?.rating ?? 5,
            date: initial?.date ?? '',
            message: initial?.message ?? '',
        }),
        [initial],
    );

    const [draft, setDraft] = React.useState<ReviewDraft>(initDraft);
    const [saving, setSaving] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        setDraft(initDraft);
        setErrors({});
    }, [initDraft]);

    const isDirty = React.useMemo(() => JSON.stringify(draft) !== JSON.stringify(initDraft), [draft, initDraft]);

    React.useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // keep legacy static for fallback
    React.useEffect(() => {
        (ReviewFormPanel as unknown as { _isDirty?: boolean })._isDirty = isDirty;
    }, [isDirty]);

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!draft.name.trim()) e.name = 'Nama wajib diisi.';
        if (!draft.message.trim()) e.message = 'Pesan wajib diisi.';
        if (draft.rating < 1 || draft.rating > 5) e.rating = 'Rating 1-5.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSave() {
        if (!validate() || saving) return;
        setSaving(true);
        const payload = {
            name: draft.name,
            rating: draft.rating,
            date: draft.date,
            message: draft.message,
        };

        const opts = {
            preserveScroll: true,
            onError: (errs: Record<string, string>) => {
                setErrors(errs as Record<string, string>);
                setSaving(false);
            },
            onSuccess: () => {
                setSaving(false);
                onSuccess?.();
            },
            onFinish: () => setSaving(false),
        } as const;

        if (mode === 'edit' && initial?.id) {
            router.put(`/products/${productSlug}/reviews/${initial.id}`, payload, opts);
        } else {
            router.post(`/products/${productSlug}/reviews`, payload, opts);
        }
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-col gap-4">
                <Input
                    label="Nama *"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Rafi A."
                    error={errors.name}
                    autoFocus
                />
                <Input
                    label="Tanggal"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    placeholder="18 Aug 2026"
                    error={errors.date}
                />
                <div className="flex flex-col gap-2">
                    <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-[#888]">Rating *</span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setDraft({ ...draft, rating: s })}
                                className={cn('p-1', s <= draft.rating ? 'text-amber-400' : 'text-[#e6e6e6]')}
                                aria-label={`Rating ${s}`}
                            >
                                <Star size={18} fill={s <= draft.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                            </button>
                        ))}
                    </div>
                    {errors.rating && (
                        <p className="font-sans text-[11px] text-red-500" role="alert">
                            {errors.rating}
                        </p>
                    )}
                </div>
                <TextArea
                    label="Pesan *"
                    value={draft.message}
                    onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                    rows={4}
                    placeholder="Aromanya..."
                    error={errors.message}
                />
            </div>

            {/* footer actions — inside panel but also mirrored to SidePanel footer slot for consistency */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f5f5f5] mt-2">
                <Button variant="outline" size="md" onClick={onClose} disabled={saving}>
                    Batal
                </Button>
                <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
                    <Check size={12} strokeWidth={1.8} />
                    {saving ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Ulasan'}
                </Button>
            </div>
        </div>
    );
}

// Helper for parent to check dirty without prop drilling (reusable pattern)
// Parent can import and check: (ReviewFormPanel as any)._isDirty
export function isReviewFormDirty(): boolean {
    return !!(ReviewFormPanel as unknown as { _isDirty?: boolean })._isDirty;
}
export function resetReviewFormDirty() {
    (ReviewFormPanel as unknown as { _isDirty?: boolean })._isDirty = false;
}
