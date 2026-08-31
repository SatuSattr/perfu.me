import * as React from "react";
import { router } from "@inertiajs/react";
import { Check, X } from "lucide-react";
import { Input, TextArea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/form/combobox";
import { cn } from "@/lib/utils";

interface Enums {
    genders: string[];
    types: string[];
    categories: string[];
    optionModes: string[];
}

interface InfoDraft {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    gender: string;
    price: number;
    stock: string | number | null;
    category: string;
    type: "signature" | "inspired";
    size_label: string;
    is_active: boolean;
}

interface Props {
    productSlug: string;
    initial: InfoDraft;
    enums: Enums;
    onSlugChange?: (newSlug: string) => void;
    className?: string;
}

function slugify(s: string): string {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function InfoPanel({
    productSlug,
    initial,
    enums,
    onSlugChange,
    className = "",
}: Props) {
    const [draft, setDraft] = React.useState<InfoDraft>(initial);
    const [saving, setSaving] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const autoSlug = React.useMemo(() => slugify(draft.name), [draft.name]);

    React.useEffect(() => {
        setDraft(initial);
        setErrors({});
    }, [initial]);

    const isDirty = React.useMemo(() => {
        const norm = (d: InfoDraft) => ({
            name: d.name ?? "",
            slug: d.slug ?? "",
            tagline: d.tagline ?? "",
            description: d.description ?? "",
            gender: d.gender ?? "",
            price: Number(d.price ?? 0),
            stock:
                d.stock === "" || d.stock === null || d.stock === undefined
                    ? null
                    : Number(d.stock),
            category: d.category ?? "",
            type: d.type ?? "",
            size_label: d.size_label ?? "",
            is_active: !!d.is_active,
        });
        return JSON.stringify(norm(initial)) !== JSON.stringify(norm(draft));
    }, [draft, initial]);

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!draft.name.trim()) e.name = "Nama produk wajib diisi.";
        if (draft.slug && !/^[a-z0-9-]+$/.test(draft.slug))
            e.slug = "Slug hanya a-z, 0-9, -.";
        if (!draft.gender) e.gender = "Gender wajib diisi.";
        if (
            draft.price === "" ||
            draft.price === null ||
            Number.isNaN(Number(draft.price))
        )
            e.price = "Harga wajib diisi.";
        return Object.keys(e).length === 0 ? true : (setErrors(e), false);
    }

    function handleReset() {
        setDraft(initial);
        setErrors({});
    }

    function handleSave() {
        if (!isDirty || saving) return;
        // simple client validate for required fields
        if (!draft.name.trim()) {
            setErrors({ name: "Nama produk wajib diisi." });
            return;
        }
        setSaving(true);
        const payload: Record<string, unknown> = {
            name: draft.name,
            slug: draft.slug || autoSlug || null,
            tagline: draft.tagline || null,
            description: draft.description || null,
            gender: draft.gender,
            price: Number(draft.price),
            stock:
                draft.stock === "" || draft.stock === null
                    ? null
                    : Number(draft.stock),
            category: draft.category,
            type: draft.type,
            size_label: draft.size_label || null,
            is_active: !!draft.is_active,
        };

        router.patch(
            `/products/${productSlug}/basic`,
            payload as never,
            {
                preserveScroll: true,
                headers: { Accept: "application/json" },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setSaving(false);
                },
                onSuccess: (page) => {
                    setSaving(false);
                    setErrors({});
                    // update local initial is handled by parent via page props reload? For now assume parent will update via Inertia props after patch (we stay on same page, use response JSON to update).
                    // If slug changed, notify parent to update URL without reload
                    const newSlug =
                        (
                            page.props as unknown as {
                                product?: { slug?: string };
                            }
                        )?.product?.slug ??
                        (payload.slug as string) ??
                        productSlug;
                    // try to get slug from JSON response if available via page props flash? Instead check payload
                    if (newSlug && newSlug !== productSlug) {
                        onSlugChange?.(newSlug);
                        window.history.replaceState(
                            {},
                            "",
                            `/products/${newSlug}/edit`,
                        );
                    }
                },
                onFinish: () => setSaving(false),
            } as never,
        );
    }

    return (
        <div
            className={cn(
                "bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6 flex flex-col",
                className,
            )}
        >
            <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                Informasi Dasar
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5 flex-1">
                <Input
                    label="Nama Produk *"
                    value={draft.name}
                    onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value })
                    }
                    error={errors.name}
                    placeholder="Dynamyst"
                    required
                />
                <Input
                    label="Slug"
                    value={draft.slug}
                    onChange={(e) =>
                        setDraft({
                            ...draft,
                            slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-"),
                        })
                    }
                    error={errors.slug}
                    placeholder={autoSlug || "dynamyst"}
                />
                <Input
                    label="Tagline"
                    value={draft.tagline}
                    onChange={(e) =>
                        setDraft({ ...draft, tagline: e.target.value })
                    }
                    error={errors.tagline}
                    placeholder="Fresh. Bold. Confident."
                />
                <div className="grid grid-cols-2 gap-3">
                    <Combobox
                        label="Gender *"
                        placeholder="Pilih gender"
                        value={
                            draft.gender
                                ? { code: draft.gender, name: draft.gender }
                                : null
                        }
                        onSelect={(opt) =>
                            setDraft({ ...draft, gender: opt.code })
                        }
                        options={enums.genders.map((g) => ({
                            code: g,
                            name: g,
                        }))}
                        error={errors.gender}
                        typeable={false}
                    />
                    <Combobox
                        label="Tipe *"
                        placeholder="Pilih tipe"
                        value={
                            draft.type
                                ? { code: draft.type, name: draft.type }
                                : null
                        }
                        onSelect={(opt) =>
                            setDraft({
                                ...draft,
                                type: opt.code as InfoDraft["type"],
                            })
                        }
                        options={enums.types.map((t) => ({ code: t, name: t }))}
                        error={errors.type}
                        typeable={false}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Combobox
                        label="Kategori *"
                        placeholder="Pilih kategori"
                        value={
                            draft.category
                                ? { code: draft.category, name: draft.category }
                                : null
                        }
                        onSelect={(opt) =>
                            setDraft({ ...draft, category: opt.code })
                        }
                        options={enums.categories.map((c) => ({
                            code: c,
                            name: c,
                        }))}
                        error={errors.category}
                        typeable={false}
                    />
                    <Input
                        label="Label Ukuran"
                        value={draft.size_label}
                        onChange={(e) =>
                            setDraft({ ...draft, size_label: e.target.value })
                        }
                        placeholder="15ml, 35ml, 50ml"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Harga Dasar *"
                        type="number"
                        value={String(draft.price)}
                        onChange={(e) =>
                            setDraft({
                                ...draft,
                                price: Number(e.target.value),
                            })
                        }
                        error={errors.price}
                        placeholder="45000"
                        required
                    />
                    <Input
                        label={
                            draft.type === "inspired"
                                ? "Stok (kosong = di varian)"
                                : "Stok *"
                        }
                        type="number"
                        value={draft.stock as string}
                        onChange={(e) =>
                            setDraft({
                                ...draft,
                                stock: e.target.value as unknown as number,
                            })
                        }
                        error={errors.stock}
                        placeholder={
                            draft.type === "inspired" ? "Kosongkan" : "30"
                        }
                    />
                </div>
                <div className="lg:col-span-2">
                    <TextArea
                        label="Deskripsi"
                        value={draft.description}
                        onChange={(e) =>
                            setDraft({ ...draft, description: e.target.value })
                        }
                        placeholder="Aroma fresh, sporty..."
                        rows={3}
                        error={errors.description}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between gap-4 pt-4 mt-6 border-t border-[#f5f5f5] min-h-[44px]">
                <Switch
                    label="Aktif"
                    description="tampil di store jika aktif"
                    checked={draft.is_active}
                    onCheckedChange={(v) =>
                        setDraft({ ...draft, is_active: v })
                    }
                    labelClassName="font-medium"
                />
                {isDirty && (
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleReset}
                            disabled={saving}
                            className="rounded-full"
                        >
                            <X size={12} strokeWidth={1.8} />
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-full"
                        >
                            <Check size={12} strokeWidth={1.8} />
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
