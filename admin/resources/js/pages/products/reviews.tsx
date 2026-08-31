import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Trash2, Pencil, Star, Check, X, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { CheckedCombobox } from "@/components/ui/checked-combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, TextArea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ReviewItem } from "@/components/product/review-card";

interface ReviewRow extends ReviewItem {
    id: number;
    timestamp: string | null;
    is_visible: boolean;
}

interface Paginated {
    data: ReviewRow[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface PageProps {
    product: { id: number; slug: string; name: string; image: string | null };
    reviews: Paginated;
    counts: Record<string, number>;
    filters: { q: string; stars: string; sort: string; per_page: number };
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProductReviewsPage() {
    const { product, reviews, counts, filters } = usePage<PageProps>().props;
    const [q, setQ] = useState(filters.q ?? "");
    const [stars, setStars] = useState(filters.stars ?? "");
    const [sort, setSort] = useState(filters.sort ?? "latest");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draft, setDraft] = useState<ReviewItem | null>(null);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [savingId, setSavingId] = useState<number | null>(null);
    const [confirmSingleId, setConfirmSingleId] = useState<number | null>(null);
    const [confirmBulk, setConfirmBulk] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [newDraft, setNewDraft] = useState<ReviewItem>({
        name: "",
        rating: 5,
        date: "",
        message: "",
    });
    const [savingNew, setSavingNew] = useState(false);

    useEffect(() => {
        setQ(filters.q ?? "");
        setStars(filters.stars ?? "");
        setSort(filters.sort ?? "latest");
    }, [filters.q, filters.stars, filters.sort]);

    useEffect(() => {
        setSelected(new Set());
        setEditingId(null);
        setDraft(null);
        setShowAdd(false);
        setNewDraft({ name: "", rating: 5, date: "", message: "" });
    }, [reviews.current_page]);

    const starCounts = counts ?? {};

    const allIdsOnPage = useMemo(
        () => reviews.data.map((r) => r.id),
        [reviews.data],
    );
    const allSelected =
        allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selected.has(id));

    function applyFilters(next: Partial<PageProps["filters"]>) {
        router.get(
            `/products/${product.slug}/reviews`,
            {
                q,
                stars,
                sort,
                per_page: filters.per_page,
                ...next,
            },
            { preserveState: false, replace: true, preserveScroll: true },
        );
    }

    function onSearch() {
        applyFilters({ q });
    }

    function startEdit(row: ReviewRow) {
        // Exclusive: close add-mode if open so only one form is visible
        setShowAdd(false);
        setNewDraft({ name: "", rating: 5, date: "", message: "" });
        setEditingId(row.id);
        setDraft({
            id: row.id,
            name: row.name,
            rating: row.rating,
            date: row.date,
            message: row.message,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setDraft(null);
    }

    function handleSave(row: ReviewRow) {
        if (!draft || savingId) return;
        if (!draft.name.trim() || !draft.message.trim()) return;
        setSavingId(row.id);
        router.put(
            `/products/${product.slug}/reviews/${row.id}`,
            {
                name: draft.name,
                rating: draft.rating,
                date: draft.date,
                message: draft.message,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingId(null),
                onSuccess: () => {
                    setEditingId(null);
                    setDraft(null);
                },
            },
        );
    }

    function handleAddSave() {
        if (!newDraft.name.trim() || !newDraft.message.trim() || savingNew)
            return;
        setSavingNew(true);
        router.post(
            `/products/${product.slug}/reviews`,
            {
                name: newDraft.name,
                rating: newDraft.rating,
                date: newDraft.date,
                message: newDraft.message,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingNew(false),
                onSuccess: () => {
                    setShowAdd(false);
                    setNewDraft({ name: "", rating: 5, date: "", message: "" });
                },
            },
        );
    }

    function onDeleteSingle(id: number) {
        setConfirmSingleId(id);
    }

    function onBulkDelete() {
        if (selected.size === 0) return;
        setConfirmBulk(true);
    }

    function toggleOne(id: number, checked: boolean) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    }

    function toggleAll(checked: boolean) {
        if (checked) setSelected(new Set(allIdsOnPage));
        else setSelected(new Set());
    }

    const filterValue = useMemo(() => {
        const s = stars ? stars.split(",").filter(Boolean) : [];
        return [sort, ...s];
    }, [sort, stars]);

    function handleFilterChange(next: string[]) {
        const nextSort =
            (next.find((v) => ["latest", "oldest"].includes(v)) as
                | "latest"
                | "oldest") ?? "latest";
        const nextStars = next
            .filter((v) => ["5", "4", "3", "2", "1"].includes(v))
            .join(",");
        setSort(nextSort);
        setStars(nextStars);
        router.get(
            `/products/${product.slug}/reviews`,
            { q, stars: nextStars, sort: nextSort, per_page: filters.per_page },
            { preserveState: false, replace: true },
        );
    }

    return (
        <AppLayout>
            <Head title={`Ulasan — ${product.name} — Perfu.me Admin`} />
            <div
                className={cn(
                    "flex flex-col gap-6",
                    selected.size > 0 && "pb-20",
                )}
            >
                <div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/products"
                            className="w-8 h-8 rounded-full border border-[#e6e6e6] bg-white text-[#555] hover:border-[#1a1a1a] inline-flex items-center justify-center transition-colors"
                        >
                            <ArrowLeft size={14} strokeWidth={1.8} />
                        </Link>
                        <div className="flex items-center gap-3 min-w-0">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-[#e6e6e6] bg-[#f7f7f7] shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#f7f7f7] border border-[#e6e6e6] shrink-0" />
                            )}
                            <div className="min-w-0">
                                <h1 className="font-sans text-[18px] font-semibold text-[#1a1a1a] tracking-tight leading-none truncate">
                                    Ulasan — {product.name}
                                </h1>
                                <p className="font-sans text-[11px] text-[#888] mt-1">
                                    {reviews.total} ulasan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search + Filter — separate container like /products */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 min-w-0">
                        <SearchBar
                            value={q}
                            onChange={setQ}
                            onSearch={onSearch}
                            placeholder="Cari nama atau pesan..."
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => {
                                setEditingId(null);
                                setDraft(null);
                                setNewDraft({ name: "", rating: 5, date: "", message: "" });
                                setShowAdd(true);
                            }}
                        >
                            <Plus size={14} strokeWidth={1.8} />
                            <span className="hidden sm:inline">Tambah Ulasan</span>
                            <span className="sm:hidden">Tambah</span>
                        </Button>
                        <CheckedCombobox
                            label="Filter Ulasan"
                            buttonLabel="Filter"
                            value={filterValue}
                            onChange={handleFilterChange}
                            groups={[
                                {
                                    label: "Time",
                                    maxSelected: 1,
                                    options: [
                                        { code: "latest", name: "Terbaru" },
                                        { code: "oldest", name: "Terlama" },
                                    ],
                                },
                                {
                                    label: "Stars",
                                    options: [
                                        {
                                            code: "5",
                                            name: "5 ★★★★★",
                                            count: starCounts["5"] ?? 0,
                                        },
                                        {
                                            code: "4",
                                            name: "4 ★★★★",
                                            count: starCounts["4"] ?? 0,
                                        },
                                        {
                                            code: "3",
                                            name: "3 ★★★",
                                            count: starCounts["3"] ?? 0,
                                        },
                                        {
                                            code: "2",
                                            name: "2 ★★",
                                            count: starCounts["2"] ?? 0,
                                        },
                                        {
                                            code: "1",
                                            name: "1 ★",
                                            count: starCounts["1"] ?? 0,
                                        },
                                    ],
                                },
                            ]}
                            placeholder="Cari filter..."
                            className="shrink-0"
                        />
                    </div>
                </div>

                {/* Fixed bottom capsule — only when something checked */}
                {selected.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-[#e6e6e6] rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] px-2 py-2 flex items-center gap-1 sm:gap-2 max-w-[calc(100vw-32px)]">
                        <span className="font-sans text-[11px] font-medium text-[#1a1a1a] px-3 whitespace-nowrap hidden sm:inline">
                            {selected.size} terpilih
                        </span>
                        <span className="font-sans text-[11px] font-medium text-[#1a1a1a] px-2 whitespace-nowrap sm:hidden">
                            {selected.size}
                        </span>
                        <span
                            className="w-px h-6 bg-[#e6e6e6] hidden sm:block"
                            aria-hidden="true"
                        />
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={() => toggleAll(!allSelected)}
                            className="whitespace-nowrap"
                        >
                            <Check size={12} strokeWidth={1.8} />
                            {allSelected ? "Uncheck all" : "Check all"}
                        </Button>
                        <Button variant="danger" size="md" onClick={onBulkDelete} className="whitespace-nowrap">
                            <Trash2 size={12} strokeWidth={1.8} />
                            Hapus
                        </Button>
                        <Button variant="outline" size="md" onClick={() => setSelected(new Set())} className="whitespace-nowrap">
                            <X size={12} strokeWidth={1.8} />
                            Batal
                        </Button>
                    </div>
                )}

                {/* Table — same style as /products with pagination inside card */}
                <div className="border border-[#e6e6e6] rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fafafa] border-b border-[#e6e6e6]">
                                    <th className="w-5 pl-4 pr-0 py-3">
                                        <div className="flex justify-center">
                                            <span
                                                className={
                                                    selected.size > 0
                                                        ? "inline-flex transition-opacity duration-200 opacity-100"
                                                        : "inline-flex transition-opacity duration-200 opacity-0 pointer-events-none"
                                                }
                                                aria-hidden={
                                                    selected.size === 0
                                                }
                                            >
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={(v) =>
                                                        toggleAll(!!v)
                                                    }
                                                    aria-label="Pilih semua ulasan"
                                                    tabIndex={
                                                        selected.size > 0
                                                            ? 0
                                                            : -1
                                                    }
                                                />
                                            </span>
                                            {selected.size === 0 && (
                                                <span className="sr-only">
                                                    Pilih
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Ulasan
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Rating
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Tanggal
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {showAdd && (
                                    <tr className="border-b border-[#e6e6e6] bg-[#fafafa]">
                                        <td colSpan={5} className="p-4">
                                            <div
                                                className={cn(
                                                    "rounded-xl border border-[#1a1a1a]/15 bg-[#faf9f9] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-3",
                                                    savingNew &&
                                                        "opacity-60 pointer-events-none",
                                                )}
                                            >
                                                <div className="grid grid-cols-12 gap-2">
                                                    <div className="col-span-6">
                                                        <Input
                                                            label="Nama"
                                                            value={
                                                                newDraft.name
                                                            }
                                                            onChange={(e) =>
                                                                setNewDraft({
                                                                    ...newDraft,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            placeholder="Rafi A."
                                                        />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <Input
                                                            label="Tanggal"
                                                            value={
                                                                newDraft.date
                                                            }
                                                            onChange={(e) =>
                                                                setNewDraft({
                                                                    ...newDraft,
                                                                    date: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            placeholder="18 Aug 2026"
                                                        />
                                                    </div>
                                                    <div className="col-span-12 flex items-center gap-2">
                                                        <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-[#888]">
                                                            Rating
                                                        </span>
                                                        <div className="flex gap-0.5">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((s) => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setNewDraft(
                                                                            {
                                                                                ...newDraft,
                                                                                rating: s,
                                                                            },
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        "p-1",
                                                                        s <=
                                                                            newDraft.rating
                                                                            ? "text-amber-400"
                                                                            : "text-[#e6e6e6]",
                                                                    )}
                                                                >
                                                                    <Star
                                                                        size={
                                                                            14
                                                                        }
                                                                        fill={
                                                                            s <=
                                                                            newDraft.rating
                                                                                ? "currentColor"
                                                                                : "none"
                                                                        }
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-12">
                                                        <TextArea
                                                            label="Pesan"
                                                            value={
                                                                newDraft.message
                                                            }
                                                            onChange={(e) =>
                                                                setNewDraft({
                                                                    ...newDraft,
                                                                    message:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            rows={2}
                                                            placeholder="Aromanya..."
                                                        />
                                                    </div>
                                                    <div className="col-span-12 flex justify-end gap-1.5 mt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setShowAdd(false);
                                                                setNewDraft({ name: "", rating: 5, date: "", message: "" });
                                                            }}
                                                        >
                                                            <X size={12} strokeWidth={1.8} />
                                                            Batal
                                                        </Button>
                                                        <Button variant="primary" size="sm" onClick={handleAddSave}>
                                                            <Check size={12} strokeWidth={1.8} />
                                                            Simpan
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {reviews.data.length === 0 && !showAdd ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-10 text-center font-sans text-[12px] text-[#aaa]"
                                        >
                                            Belum ada ulasan
                                        </td>
                                    </tr>
                                ) : (
                                    reviews.data.map((row) => {
                                        const isEditing = editingId === row.id;
                                        const isSaving = savingId === row.id;
                                        const isChecked = selected.has(row.id);

                                        if (isEditing && draft) {
                                            return (
                                                <tr
                                                    key={row.id}
                                                    className="border-b border-[#f2f2f2] bg-[#fafafa]"
                                                >
                                                    <td
                                                        colSpan={5}
                                                        className="p-4"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "rounded-xl border border-[#1a1a1a]/15 bg-[#faf9f9] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-3",
                                                                isSaving &&
                                                                    "opacity-60 pointer-events-none",
                                                            )}
                                                        >
                                                            <div className="grid grid-cols-12 gap-2">
                                                                <div className="col-span-6">
                                                                    <Input
                                                                        label="Nama"
                                                                        value={
                                                                            draft.name
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setDraft(
                                                                                {
                                                                                    ...draft,
                                                                                    name: e
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Rafi A."
                                                                    />
                                                                </div>
                                                                <div className="col-span-6">
                                                                    <Input
                                                                        label="Tanggal"
                                                                        value={
                                                                            draft.date
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setDraft(
                                                                                {
                                                                                    ...draft,
                                                                                    date: e
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="18 Aug 2026"
                                                                    />
                                                                </div>
                                                                <div className="col-span-12 flex items-center gap-2">
                                                                    <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-[#888]">
                                                                        Rating
                                                                    </span>
                                                                    <div className="flex gap-0.5">
                                                                        {[
                                                                            1,
                                                                            2,
                                                                            3,
                                                                            4,
                                                                            5,
                                                                        ].map(
                                                                            (
                                                                                s,
                                                                            ) => (
                                                                                <button
                                                                                    key={
                                                                                        s
                                                                                    }
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        setDraft(
                                                                                            {
                                                                                                ...draft,
                                                                                                rating: s,
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                    className={cn(
                                                                                        "p-1",
                                                                                        s <=
                                                                                            draft.rating
                                                                                            ? "text-amber-400"
                                                                                            : "text-[#e6e6e6]",
                                                                                    )}
                                                                                >
                                                                                    <Star
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        fill={
                                                                                            s <=
                                                                                            draft.rating
                                                                                                ? "currentColor"
                                                                                                : "none"
                                                                                        }
                                                                                        strokeWidth={
                                                                                            1.5
                                                                                        }
                                                                                    />
                                                                                </button>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-span-12">
                                                                    <TextArea
                                                                        label="Pesan"
                                                                        value={
                                                                            draft.message
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setDraft(
                                                                                {
                                                                                    ...draft,
                                                                                    message:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        rows={2}
                                                                        placeholder="Aromanya..."
                                                                    />
                                                                </div>
                                                                <div className="col-span-12 flex justify-end gap-1.5 mt-1">
                                                                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                                                                        <X size={12} strokeWidth={1.8} />
                                                                        Batal
                                                                    </Button>
                                                                    <Button variant="primary" size="sm" onClick={() => handleSave(row)}>
                                                                        <Check size={12} strokeWidth={1.8} />
                                                                        Simpan
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                            <tr
                                                key={row.id}
                                                className={cn(
                                                    "group border-b border-[#f2f2f2] last:border-0 transition-colors",
                                                    isChecked
                                                        ? "bg-[#f5f5f5]"
                                                        : "hover:bg-[#fafafa]",
                                                )}
                                            >
                                                <td className="w-5 pl-4 pr-0 py-3 align-middle">
                                                    <div className="flex justify-center">
                                                        <span
                                                            className={cn(
                                                                "inline-flex transition-opacity duration-200",
                                                                isChecked
                                                                    ? "opacity-100"
                                                                    : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    isChecked
                                                                }
                                                                onCheckedChange={(
                                                                    v,
                                                                ) =>
                                                                    toggleOne(
                                                                        row.id,
                                                                        !!v,
                                                                    )
                                                                }
                                                                aria-label={`Pilih ulasan ${row.name}`}
                                                            />
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="pl-4 pr-4 py-3 max-w-[420px]">
                                                    <div className="flex gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-full bg-[#f0f0f0] border border-[#e6e6e6] flex items-center justify-center shrink-0 mt-0.5">
                                                            <span className="font-sans text-[10px] font-medium tracking-[0.08em] text-[#1a1a1a]">
                                                                {getInitials(
                                                                    row.name,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-sans text-[13px] font-medium text-[#1a1a1a] leading-none truncate">
                                                                {row.name ||
                                                                    "Tanpa nama"}
                                                            </p>
                                                            <p className="font-sans text-[12.5px] leading-[1.6] text-[#555] mt-1.5 break-words line-clamp-2">
                                                                {row.message ||
                                                                    "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="flex gap-0.5 items-center">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (s) => (
                                                                <Star
                                                                    key={s}
                                                                    size={10}
                                                                    fill={
                                                                        s <=
                                                                        row.rating
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    className={
                                                                        s <=
                                                                        row.rating
                                                                            ? "text-amber-400"
                                                                            : "text-[#e6e6e6]"
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap font-sans text-[11px] text-[#888]">
                                                    {row.date || "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            onClick={() => startEdit(row)}
                                                            aria-label="Edit ulasan"
                                                        >
                                                            <Pencil size={14} strokeWidth={1.5} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => onDeleteSingle(row.id)}
                                                            aria-label="Hapus ulasan"
                                                            className="text-[#888] hover:border-red-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={14} strokeWidth={1.5} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {reviews.last_page > 1 ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e6e6e6] bg-[#fafafa]/50 px-4 py-3">
                            <span className="font-sans text-[11px] text-[#888]">
                                Hal {reviews.current_page} dari{" "}
                                {reviews.last_page} · {reviews.total} ulasan
                            </span>
                            <div className="flex items-center gap-1 flex-wrap justify-center">
                                {reviews.links.map((link, i) => {
                                    const isPrev =
                                        link.label.includes("Previous") ||
                                        link.label.includes("&laquo;");
                                    const isNext =
                                        link.label.includes("Next") ||
                                        link.label.includes("&raquo;");
                                    const label = isPrev
                                        ? "Prev"
                                        : isNext
                                          ? "Next"
                                          : link.label
                                                .replace(/&[^;]+;/g, "")
                                                .trim();
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url ?? "#"}
                                            preserveState
                                            preserveScroll
                                            className={cn(
                                                "min-w-[36px] h-8 px-3 inline-flex items-center justify-center rounded-full font-sans text-[12px] border transition-colors duration-200",
                                                link.active
                                                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                                                    : "bg-white text-[#666] border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]",
                                                !link.url &&
                                                    "opacity-40 pointer-events-none",
                                            )}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: label,
                                                }}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between border-t border-[#e6e6e6] bg-[#fafafa]/50 px-4 py-3">
                            <span className="font-sans text-[11px] text-[#888]">
                                {reviews.total} ulasan · Hal 1 dari 1
                            </span>
                            <span className="font-sans text-[11px] text-[#aaa]">
                                —
                            </span>
                        </div>
                    )}
                </div>

                {confirmSingleId !== null && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="bg-white rounded-2xl border border-[#e6e6e6] p-6 w-full max-w-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                            <h3 className="font-sans text-[14px] font-semibold text-[#1a1a1a]">
                                Hapus ulasan?
                            </h3>
                            <p className="font-sans text-[12.5px] text-[#666] leading-[1.7] mt-2">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmSingleId(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        const id = confirmSingleId;
                                        router.delete(
                                            `/products/${product.slug}/reviews`,
                                            {
                                                data: { ids: [id] },
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    setConfirmSingleId(null),
                                                onFinish: () =>
                                                    setConfirmSingleId(null),
                                            },
                                        );
                                    }}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {confirmBulk && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="bg-white rounded-2xl border border-[#e6e6e6] p-6 w-full max-w-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                            <h3 className="font-sans text-[14px] font-semibold text-[#1a1a1a]">
                                Hapus {selected.size} ulasan terpilih?
                            </h3>
                            <p className="font-sans text-[12.5px] text-[#666] leading-[1.7] mt-2">
                                Tindakan ini tidak dapat dibatalkan. Ulasan yang
                                dipilih akan dihapus permanen.
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmBulk(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        router.delete(
                                            `/products/${product.slug}/reviews`,
                                            {
                                                data: {
                                                    ids: Array.from(selected),
                                                },
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    setSelected(new Set());
                                                    setConfirmBulk(false);
                                                },
                                                onFinish: () =>
                                                    setConfirmBulk(false),
                                            },
                                        );
                                    }}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
