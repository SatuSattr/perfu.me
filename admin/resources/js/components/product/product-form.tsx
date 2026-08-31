import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Input, TextArea } from '@/components/ui/input';
import { Button, ButtonLink } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/form/combobox';
import { MediaSection, type MediaItem } from './media-section';
import { VariantsSection } from './variants-section';
import type { OptionItem } from './variant-panel';

interface Enums {
    genders: string[];
    types: string[];
    categories: string[];
    optionModes: string[];
}

interface ProductPayload {
    id?: number;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    gender: string;
    price: number;
    stock: number | null;
    category: string;
    type: string;
    image: string | null;
    detailImage: string | null;
    images: string[];
    sizeLabel: string | null;
    is_active?: boolean;
    options: {
        id: string;
        name: string;
        label: string;
        mode: 'dropdown' | 'normal';
        required: boolean;
        position: number;
        choices: { id: string; name: string; price: number | null; stock: number }[];
    }[];
    reviews: { name: string; rating: number; date: string; message: string }[];
}

interface Props {
    initialData?: ProductPayload;
    enums: Enums;
    isEdit?: boolean;
    className?: string;
}

function slugify(s: string): string {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function ProductForm({ initialData, enums, isEdit = false, className = '' }: Props) {
    const initialImages: MediaItem[] = useMemo(() => {
        if (!initialData?.images?.length) return [];
        return initialData.images.map((path, idx) => ({ path, preview: path, file: null, position: idx }));
    }, [initialData]);

    const initialOptions: OptionItem[] = useMemo(() => {
        if (!initialData?.options) return [];
        return initialData.options.map((o, idx) => ({
            key: o.id,
            label: o.label,
            mode: o.mode,
            required: o.required,
            position: o.position ?? idx,
            choices: o.choices.map((c, ci) => ({ key: c.id, name: c.name, price: c.price, stock: c.stock, position: ci })),
        }));
    }, [initialData]);

    const form = useForm({
        name: initialData?.name ?? '',
        slug: initialData?.slug ?? '',
        tagline: initialData?.tagline ?? '',
        description: initialData?.description ?? '',
        gender: initialData?.gender ?? 'Pria',
        price: initialData?.price ?? 0,
        stock: (initialData?.stock as unknown as string) ?? '',
        category: initialData?.category ?? 'EDP',
        type: (initialData?.type as 'signature' | 'inspired') ?? 'signature',
        size_label: initialData?.sizeLabel ?? '',
        is_active: initialData?.is_active ?? true,
        images: initialImages,
        options: initialOptions,
    });

    const autoSlug = useMemo(() => slugify(form.data.name), [form.data.name]);
    useEffect(() => {
        if (!isEdit && form.data.name && !form.data.slug) {
            // only auto-fill if slug empty
            form.setData('slug', autoSlug);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSlug]);

    const isDirty = useMemo(() => {
        if (!isEdit) return true;
        if (!initialData) return false;
        const normImages = (imgs: MediaItem[]) =>
            imgs.map((img, i) => ({
                path: img.path,
                preview: img.preview ?? img.path,
                hasFile: !!img.file,
                position: img.position ?? i,
            }));
        const normOptions = (opts: OptionItem[]) =>
            opts.map((o, i) => ({
                key: o.key,
                label: o.label,
                mode: o.mode,
                required: !!o.required,
                position: o.position ?? i,
                choices: o.choices.map((c, ci) => ({
                    key: c.key,
                    name: c.name,
                    price: c.price === '' || c.price === null || c.price === undefined ? null : Number(c.price),
                    stock: Number(c.stock),
                    position: c.position ?? ci,
                })),
            }));
        const initial = {
            name: initialData.name ?? '',
            slug: initialData.slug ?? '',
            tagline: initialData.tagline ?? '',
            description: initialData.description ?? '',
            gender: initialData.gender ?? '',
            price: Number(initialData.price ?? 0),
            stock:
                initialData.stock === null ||
                initialData.stock === undefined ||
                (initialData.stock as unknown as string) === ''
                    ? null
                    : Number(initialData.stock),
            category: initialData.category ?? '',
            type: initialData.type ?? '',
            size_label: initialData.sizeLabel ?? '',
            is_active: !!initialData.is_active,
            images: normImages(initialImages),
            options: normOptions(initialOptions),
        };
        const current = {
            name: form.data.name ?? '',
            slug: form.data.slug ?? '',
            tagline: form.data.tagline ?? '',
            description: form.data.description ?? '',
            gender: form.data.gender ?? '',
            price: Number((form.data.price as unknown as number) ?? 0),
            stock:
                (form.data.stock as unknown as string) === '' ||
                form.data.stock === null ||
                form.data.stock === undefined
                    ? null
                    : Number(form.data.stock),
            category: form.data.category ?? '',
            type: form.data.type ?? '',
            size_label: (form.data.size_label as unknown as string) ?? '',
            is_active: !!form.data.is_active,
            images: normImages(form.data.images as unknown as MediaItem[]),
            options: normOptions(form.data.options as unknown as OptionItem[]),
        };
        return JSON.stringify(initial) !== JSON.stringify(current);
    }, [isEdit, initialData, initialImages, initialOptions, form.data]);

    function handleReset() {
        // revoke blob URLs for files that will be discarded
        (form.data.images as unknown as MediaItem[]).forEach((img) => {
            if (img.file && img.preview) {
                try {
                    URL.revokeObjectURL(img.preview);
                } catch {}
            }
        });
        form.setData({
            name: initialData?.name ?? '',
            slug: initialData?.slug ?? '',
            tagline: initialData?.tagline ?? '',
            description: initialData?.description ?? '',
            gender: initialData?.gender ?? 'Pria',
            price: initialData?.price ?? 0,
            stock: (initialData?.stock as unknown as string) ?? '',
            category: initialData?.category ?? 'EDP',
            type: (initialData?.type as unknown as string) ?? 'signature',
            size_label: initialData?.sizeLabel ?? '',
            is_active: initialData?.is_active ?? true,
            images: initialImages as unknown as typeof form.data.images,
            options: initialOptions as unknown as typeof form.data.options,
        } as unknown as typeof form.data);
        form.clearErrors();
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const url = isEdit ? `/products/${initialData?.slug}` : '/products';
        const method = isEdit ? 'put' : 'post';

        form.transform((data) => ({
            ...data,
            slug: data.slug || autoSlug,
            price: Number(data.price),
            stock: data.stock === '' || (data.stock as unknown) === null ? null : Number(data.stock),
            tagline: data.tagline || null,
            description: data.description || null,
            size_label: data.size_label || null,
            // normalize options positions
            options: data.options.map((o, idx) => ({
                key: o.key,
                label: o.label,
                mode: o.mode,
                required: o.required,
                position: idx,
                choices: o.choices.map((c, ci) => ({
                    key: c.key,
                    name: c.name,
                    price: c.price === '' || c.price === null ? null : Number(c.price),
                    stock: Number(c.stock),
                    position: ci,
                })),
            })),
        }));

        if (method === 'put') {
            form.put(url, {
                forceFormData: true,
                preserveScroll: true,
                onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            });
        } else {
            form.post(url, {
                forceFormData: true,
                preserveScroll: true,
                onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
            });
        }
    }

    const showCapsule = !isEdit || isDirty;

    return (
        <form onSubmit={submit} className={cn('flex flex-col gap-6', showCapsule && 'pb-20', className)}>
            <div className="flex items-center gap-3">
                <ButtonLink href="/products" variant="secondary" size="icon" aria-label="Kembali">
                    <ArrowLeft size={14} strokeWidth={1.8} />
                </ButtonLink>
                <div>
                    <h1 className="font-sans text-[18px] font-semibold text-[#1a1a1a] tracking-tight leading-none">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
                    <p className="font-sans text-[11px] text-[#888] mt-1">{isEdit ? `Mengubah ${initialData?.name}` : 'Buat produk baru yang akan tampil di store'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6">
                    <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">Informasi Dasar</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
                        <Input label="Nama Produk *" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={(form.errors as unknown as Record<string, string>).name} placeholder="Dynamyst" required />
                        <Input label="Slug" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} error={(form.errors as unknown as Record<string, string>).slug} placeholder={autoSlug || 'dynamyst'} />
                        <Input label="Tagline" value={form.data.tagline} onChange={(e) => form.setData('tagline', e.target.value)} error={(form.errors as unknown as Record<string, string>).tagline} placeholder="Fresh. Bold. Confident." />
                        <div className="grid grid-cols-2 gap-3">
                            <Combobox label="Gender *" placeholder="Pilih gender" value={form.data.gender ? { code: form.data.gender, name: form.data.gender } : null} onSelect={(opt) => form.setData('gender', opt.code)} options={enums.genders.map((g) => ({ code: g, name: g }))} error={(form.errors as unknown as Record<string, string>).gender} typeable={false} />
                            <Combobox label="Tipe *" placeholder="Pilih tipe" value={form.data.type ? { code: form.data.type, name: form.data.type } : null} onSelect={(opt) => form.setData('type', opt.code as FormData['type'])} options={enums.types.map((t) => ({ code: t, name: t }))} error={(form.errors as unknown as Record<string, string>).type} typeable={false} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Combobox label="Kategori *" placeholder="Pilih kategori" value={form.data.category ? { code: form.data.category, name: form.data.category } : null} onSelect={(opt) => form.setData('category', opt.code)} options={enums.categories.map((c) => ({ code: c, name: c }))} error={(form.errors as unknown as Record<string, string>).category} typeable={false} />
                            <Input label="Label Ukuran" value={form.data.size_label} onChange={(e) => form.setData('size_label', e.target.value)} placeholder="15ml, 35ml, 50ml" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Harga Dasar *" type="number" value={String(form.data.price)} onChange={(e) => form.setData('price', Number(e.target.value))} error={(form.errors as unknown as Record<string, string>).price} placeholder="45000" required />
                            <Input label={form.data.type === 'inspired' ? 'Stok (kosong = di varian)' : 'Stok *'} type="number" value={form.data.stock as string} onChange={(e) => form.setData('stock', e.target.value as unknown as number)} error={(form.errors as unknown as Record<string, string>).stock} placeholder={form.data.type === 'inspired' ? 'Kosongkan' : '30'} disabled={form.data.type === 'inspired' && form.data.options.length > 0} />
                        </div>
                        <div className="lg:col-span-2">
                            <TextArea label="Deskripsi" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Aroma fresh, sporty..." rows={3} error={(form.errors as unknown as Record<string, string>).description} />
                        </div>
                        <div className="lg:col-span-2 pt-1">
                            <Checkbox label="Aktif" description="tampil di store jika aktif" checked={form.data.is_active} onCheckedChange={(v) => form.setData('is_active', v)} labelClassName="font-medium" />
                        </div>
                    </div>
                </div>
                <MediaSection images={form.data.images} onChange={(next) => form.setData('images', next)} error={(form.errors as unknown as Record<string, string>)['images.0.file']} className="h-full flex flex-col" />
            </div>

            <VariantsSection options={form.data.options as unknown as OptionItem[]} onChange={(next) => form.setData('options', next as unknown as typeof form.data.options)} type={form.data.type as 'signature' | 'inspired'} />

            {showCapsule && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-[#e6e6e6] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] px-2 py-2 flex items-center gap-1 sm:gap-2 max-w-[calc(100vw-32px)]">
                    {isEdit ? (
                        <Button type="button" variant="outline" size="md" onClick={handleReset} className="whitespace-nowrap rounded-full">
                            <X size={12} strokeWidth={1.8} />
                            Batal
                        </Button>
                    ) : (
                        <ButtonLink href="/products" variant="outline" size="md" className="whitespace-nowrap rounded-full">
                            <X size={12} strokeWidth={1.8} />
                            Batal
                        </ButtonLink>
                    )}
                    <span className="w-px h-6 bg-[#e6e6e6] hidden sm:block" aria-hidden="true" />
                    <Button type="submit" disabled={form.processing} variant="primary" size="md" className="whitespace-nowrap rounded-full">
                        <Check size={12} strokeWidth={1.8} />
                        {form.processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
                    </Button>
                </div>
            )}
        </form>
    );
}

type FormData = {
    type: 'signature' | 'inspired';
};
