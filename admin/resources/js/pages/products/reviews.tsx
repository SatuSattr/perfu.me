import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Trash2, Pencil, Star, Check, X, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { CheckedCombobox } from "@/components/ui/checked-combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SidePanel } from "@/components/ui/side-panel";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { ReviewFormPanel } from "@/components/product/review-form-panel";
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
    initialEditingReviewId?: number | null;
    initialIsCreate?: boolean;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function parsePanelFromPath(pathname: string): { mode: 'create' | 'edit' | null; id: number | null } {
    if (pathname.endsWith('/reviews/create')) return { mode: 'create', id: null };
    const m = pathname.match(/\/reviews\/(\d+)\/edit\/?$/);
    if (m) return { mode: 'edit', id: Number(m[1]) };
    return { mode: null, id: null };
}

export default function ProductReviewsPage() {
    const { product, reviews, counts, filters, initialEditingReviewId, initialIsCreate } = usePage<PageProps>().props;
    const [q, setQ] = useState(filters.q ?? "");
    const [stars, setStars] = useState(filters.stars ?? "");
    const [sort, setSort] = useState(filters.sort ?? "latest");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [confirmSingleId, setConfirmSingleId] = useState<number | null>(null);
    const [confirmBulk, setConfirmBulk] = useState(false);

    // Panel state
    const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(() => {
        if (initialIsCreate) return 'create';
        if (initialEditingReviewId) return 'edit';
        if (typeof window !== 'undefined') return parsePanelFromPath(window.location.pathname).mode;
        return null;
    });
    const [activeId, setActiveId] = useState<number | null>(() => {
        if (initialEditingReviewId) return initialEditingReviewId;
        if (typeof window !== 'undefined') return parsePanelFromPath(window.location.pathname).id;
        return null;
    });
    const [panelDirty, setPanelDirty] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

    const basePath = `/products/${product.slug}/reviews`;
    const isPanelOpen = panelMode !== null;

    const activeReview = useMemo(() => {
        if (panelMode !== 'edit' || activeId === null) return null;
        return reviews.data.find((r) => r.id === activeId) ?? null;
    }, [panelMode, activeId, reviews.data]);

    // Sync with server initial props (direct visit)
    useEffect(() => {
        if (initialIsCreate) {
            setPanelMode('create');
            setActiveId(null);
        } else if (initialEditingReviewId) {
            setPanelMode('edit');
            setActiveId(initialEditingReviewId);
        }
    }, [initialIsCreate, initialEditingReviewId]);

    // Popstate sync (back/forward)
    useEffect(() => {
        function onPop() {
            const parsed = parsePanelFromPath(window.location.pathname);
            setPanelMode(parsed.mode);
            setActiveId(parsed.id);
            setPanelDirty(false);
            setShowUnsavedConfirm(false);
        }
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    useEffect(() => {
        setQ(filters.q ?? "");
        setStars(filters.stars ?? "");
        setSort(filters.sort ?? "latest");
    }, [filters.q, filters.stars, filters.sort]);

    useEffect(() => {
        setSelected(new Set());
    }, [reviews.current_page]);

    const starCounts = counts ?? {};

    const allIdsOnPage = useMemo(() => reviews.data.map((r) => r.id), [reviews.data]);
    const allSelected = allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selected.has(id));

    function applyFilters(next: Partial<PageProps["filters"]>) {
        router.get(
            basePath,
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

    const openCreate = useCallback(() => {
        const url = `${basePath}/create`;
        window.history.pushState({}, "", url);
        setPanelMode('create');
        setActiveId(null);
        setPanelDirty(false);
    }, [basePath]);

    const openEdit = useCallback(
        (row: ReviewRow) => {
            const url = `${basePath}/${row.id}/edit`;
            window.history.pushState({}, "", url);
            setPanelMode('edit');
            setActiveId(row.id);
            setPanelDirty(false);
        },
        [basePath],
    );

    const doClosePanel = useCallback(() => {
        window.history.replaceState({}, "", basePath);
        setPanelMode(null);
        setActiveId(null);
        setPanelDirty(false);
        setShowUnsavedConfirm(false);
    }, [basePath]);

    const requestClosePanel = useCallback(() => {
        if (panelDirty) {
            setShowUnsavedConfirm(true);
        } else {
            doClosePanel();
        }
    }, [panelDirty, doClosePanel]);

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
            (next.find((v) => ["latest", "oldest"].includes(v)) as "latest" | "oldest") ?? "latest";
        const nextStars = next.filter((v) => ["5", "4", "3", "2", "1"].includes(v)).join(",");
        setSort(nextSort);
        setStars(nextStars);
        router.get(
            basePath,
            { q, stars: nextStars, sort: nextSort, per_page: filters.per_page },
            { preserveState: false, replace: true },
        );
    }

    return (
        <AppLayout>
            <Head title={`Ulasan — ${product.name} — Perfu.me Admin`} />
            <div className={cn("flex flex-col gap-6", selected.size > 0 && "pb-20")}>
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
                                <p className="font-sans text-[11px] text-[#888] mt-1">{reviews.total} ulasan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 min-w-0">
                        <SearchBar value={q} onChange={setQ} onSearch={onSearch} placeholder="Cari nama atau pesan..." className="w-full" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="primary" size="lg" onClick={openCreate}>
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
                                        { code: "5", name: "5 ★★★★★", count: starCounts["5"] ?? 0 },
                                        { code: "4", name: "4 ★★★★", count: starCounts["4"] ?? 0 },
                                        { code: "3", name: "3 ★★★", count: starCounts["3"] ?? 0 },
                                        { code: "2", name: "2 ★★", count: starCounts["2"] ?? 0 },
                                        { code: "1", name: "1 ★", count: starCounts["1"] ?? 0 },
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
                        <span className="w-px h-6 bg-[#e6e6e6] hidden sm:block" aria-hidden="true" />
                        <Button variant="secondary" size="md" onClick={() => toggleAll(!allSelected)} className="whitespace-nowrap">
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

                <Table<ReviewRow & Record<string, unknown>>
                    columns={[
                        {
                            key: 'select',
                            header: (
                                <div className="flex justify-center">
                                    <span
                                        className={
                                            selected.size > 0
                                                ? 'inline-flex transition-opacity duration-200 opacity-100'
                                                : 'inline-flex transition-opacity duration-200 opacity-0 pointer-events-none'
                                        }
                                        aria-hidden={selected.size === 0}
                                    >
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={(v) => toggleAll(!!v)}
                                            aria-label="Pilih semua ulasan"
                                            tabIndex={selected.size > 0 ? 0 : -1}
                                        />
                                    </span>
                                    {selected.size === 0 && <span className="sr-only">Pilih</span>}
                                </div>
                            ),
                            headerClassName: 'w-5 pl-4 pr-0 py-3',
                            cellClassName: 'w-5 pl-4 pr-0 py-3 align-middle',
                            render: (_v, row) => {
                                const r = row as ReviewRow;
                                const isChecked = selected.has(r.id);
                                return (
                                    <div className="flex justify-center">
                                        <span className={cn('inline-flex transition-opacity duration-200', isChecked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100')}>
                                            <Checkbox checked={isChecked} onCheckedChange={(v) => toggleOne(r.id, !!v)} aria-label={`Pilih ulasan ${r.name}`} />
                                        </span>
                                    </div>
                                );
                            },
                        },
                        {
                            key: 'message',
                            header: 'Ulasan',
                            render: (_v, row) => {
                                const r = row as ReviewRow;
                                return (
                                    <div className="flex gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-[#f0f0f0] border border-[#e6e6e6] flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="font-sans text-[10px] font-medium tracking-[0.08em] text-[#1a1a1a]">{getInitials(r.name)}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-sans text-[13px] font-medium text-[#1a1a1a] leading-none truncate">{r.name || 'Tanpa nama'}</p>
                                            <p className="font-sans text-[12.5px] leading-[1.6] text-[#555] mt-1.5 break-words line-clamp-2">{r.message || '—'}</p>
                                        </div>
                                    </div>
                                );
                            },
                        },
                        {
                            key: 'rating',
                            header: 'Rating',
                            render: (_v, row) => {
                                const r = row as ReviewRow;
                                return (
                                    <span className="flex gap-0.5 items-center">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={10} fill={s <= r.rating ? 'currentColor' : 'none'} strokeWidth={1.5} className={s <= r.rating ? 'text-amber-400' : 'text-[#e6e6e6]'} />
                                        ))}
                                    </span>
                                );
                            },
                        },
                        {
                            key: 'date',
                            header: 'Tanggal',
                            cellClassName: 'whitespace-nowrap font-sans text-[11px] text-[#888]',
                            render: (_v, row) => (row as ReviewRow).date || '-',
                        },
                        {
                            key: 'actions',
                            header: 'Aksi',
                            headerClassName: 'text-right',
                            cellClassName: 'text-right',
                            render: (_v, row) => {
                                const r = row as ReviewRow;
                                return (
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button variant="secondary" size="icon" onClick={() => openEdit(r)} aria-label="Edit ulasan">
                                            <Pencil size={14} strokeWidth={1.5} />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => onDeleteSingle(r.id)} aria-label="Hapus ulasan" className="text-[#888] hover:border-red-400 hover:text-red-500">
                                            <Trash2 size={14} strokeWidth={1.5} />
                                        </Button>
                                    </div>
                                );
                            },
                        },
                    ]}
                    data={reviews.data as unknown as (ReviewRow & Record<string, unknown>)[]}
                    rowKey={(row) => (row as ReviewRow).id}
                    getRowClassName={(row) => {
                        const r = row as ReviewRow;
                        const isChecked = selected.has(r.id);
                        return isChecked ? 'bg-[#f5f5f5]' : '';
                    }}
                    emptyText="Belum ada ulasan"
                    pagination={{ links: reviews.links, current_page: reviews.current_page, last_page: reviews.last_page, total: reviews.total }}
                    paginationMetaText={reviews.last_page > 1 ? `Hal ${reviews.current_page} dari ${reviews.last_page} · ${reviews.total} ulasan` : `${reviews.total} ulasan · Hal 1 dari 1`}
                />
            </div>

            {/* Sidebar — reusable */}
            <SidePanel
                open={isPanelOpen}
                onOpenChange={(open) => {
                    if (!open) requestClosePanel();
                }}
                title={panelMode === 'create' ? 'Tambah Ulasan' : 'Edit Ulasan'}
                subtitle={panelMode === 'edit' ? activeReview?.name : product.name}
                width="md"
            >
                {panelMode === 'create' ? (
                    <ReviewFormPanel
                        mode="create"
                        productSlug={product.slug}
                        onClose={requestClosePanel}
                        onDirtyChange={setPanelDirty}
                        onSuccess={doClosePanel}
                    />
                ) : panelMode === 'edit' && activeReview ? (
                    <ReviewFormPanel
                        key={activeReview.id}
                        mode="edit"
                        productSlug={product.slug}
                        initial={{
                            id: activeReview.id,
                            name: activeReview.name,
                            rating: activeReview.rating,
                            date: activeReview.date,
                            message: activeReview.message,
                        }}
                        onClose={requestClosePanel}
                        onDirtyChange={setPanelDirty}
                        onSuccess={doClosePanel}
                    />
                ) : panelMode === 'edit' ? (
                    <p className="font-sans text-[12px] text-[#888]">Ulasan tidak ditemukan. Mungkin sudah terhapus atau halaman sudah berganti.</p>
                ) : null}
            </SidePanel>

            {/* Unsaved confirm */}
            <ConfirmDialog
                open={showUnsavedConfirm}
                title="Batalkan perubahan?"
                message="Perubahan belum disimpan. Yakin ingin menutup tanpa menyimpan?"
                confirmText="Tutup"
                cancelText="Lanjutkan Edit"
                variant="danger"
                onCancel={() => setShowUnsavedConfirm(false)}
                onConfirm={doClosePanel}
            />

            {/* Delete single */}
            <ConfirmDialog
                open={confirmSingleId !== null}
                title="Hapus ulasan?"
                message="Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onCancel={() => setConfirmSingleId(null)}
                onConfirm={() => {
                    const id = confirmSingleId;
                    router.delete(`/products/${product.slug}/reviews`, {
                        data: { ids: [id] },
                        preserveScroll: true,
                        onSuccess: () => setConfirmSingleId(null),
                        onFinish: () => setConfirmSingleId(null),
                    });
                }}
            />

            {/* Delete bulk */}
            <ConfirmDialog
                open={confirmBulk}
                title={`Hapus ${selected.size} ulasan terpilih?`}
                message="Tindakan ini tidak dapat dibatalkan. Ulasan yang dipilih akan dihapus permanen."
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onCancel={() => setConfirmBulk(false)}
                onConfirm={() => {
                    router.delete(`/products/${product.slug}/reviews`, {
                        data: { ids: Array.from(selected) },
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelected(new Set());
                            setConfirmBulk(false);
                        },
                        onFinish: () => setConfirmBulk(false),
                    });
                }}
            />
        </AppLayout>
    );
}
