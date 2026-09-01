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
    category: string;
    type: "signature" | "inspired";
    is_active: boolean;
    is_featured: boolean;
}

interface Props {
    productSlug: string;
    initial: InfoDraft;
    enums: Enums;
    featuredCount?: number;
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
    featuredCount = 0,
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
            category: d.category ?? "",
            type: d.type ?? "",
            is_active: !!d.is_active,
            is_featured: !!d.is_featured,
        });
        return JSON.stringify(norm(initial)) !== JSON.stringify(norm(draft));
    }, [draft, initial]);

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!draft.name.trim()) e.name = "Nama produk wajib diisi.";
        if (draft.slug && !/^[a-z0-9-]+$/.test(draft.slug))
            e.slug = "Slug hanya a-z, 0-9, -.";
        if (!draft.gender) e.gender = "Gender wajib diisi.";
        return Object.keys(e).length === 0 ? true : (setErrors(e), false);
    }

    function handleReset() {
        setDraft(initial);
        setErrors({});
    }

    function handleSave() {
        if (!isDirty || saving) return;
        if (!validate()) return;
        setSaving(true);
        const payload: Record<string, unknown> = {
            name: draft.name,
            slug: draft.slug || autoSlug || null,
            tagline: draft.tagline || null,
            description: draft.description || null,
            gender: draft.gender,
            category: draft.category,
            type: draft.type,
            is_active: !!draft.is_active,
            is_featured: !!draft.is_featured,
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
                    const newSlug =
                        (
                            page.props as unknown as {
                                product?: { slug?: string };
                            }
                        )?.product?.slug ??
                        (payload.slug as string) ??
                        productSlug;
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
            {(() => {
                const limitReached = !draft.is_featured && (featuredCount ?? 0) >= 6;
                return (
                    <>
                        <div className="flex items-center justify-between gap-4 pt-4 mt-6 border-t border-[#f5f5f5] min-h-[44px]">
                            <div className="flex items-center gap-6">
                                <Switch
                                    label="Aktif"
                                    description="tampil di store jika aktif"
                                    checked={draft.is_active}
                                    onCheckedChange={(v) =>
                                        setDraft({ ...draft, is_active: v })
                                    }
                                    labelClassName="font-medium"
                                />
                                <Switch
                                    label="Featured"
                                    description={limitReached ? 'Sudah mencapai batas (6/6)' : 'tampil di landing max 6'}
                                    checked={draft.is_featured}
                                    disabled={limitReached}
                                    onCheckedChange={(v) =>
                                        setDraft({ ...draft, is_featured: v })
                                    }
                                    labelClassName="font-medium"
                                />
                            </div>
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
                                        {saving ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </div>
                            )}
                        </div>
                        {errors.is_featured && (
                            <p className="font-sans text-[11px] text-red-500 mt-2" role="alert">
                                {errors.is_featured}
                            </p>
                        )}
                        {limitReached && !errors.is_featured && (
                            <p className="font-sans text-[11px] text-[#888] mt-2">Nonaktifkan salah satu produk featured untuk menambah yang baru.</p>
                        )}
                    </>
                );
            })()}
        </div>
    );
}
