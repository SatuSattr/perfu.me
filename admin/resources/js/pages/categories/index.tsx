import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { SearchBar } from '@/components/ui/search-bar';
import { SidePanel } from '@/components/ui/side-panel';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { CategoryFormPanel } from '@/components/category/category-form-panel';
import { cn } from '@/lib/utils';

interface Row {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    position: number;
    is_active: boolean;
    products_count: number;
    created_at: string | null;
}

interface PageProps {
    categories: Row[];
    types: Row[];
    initialTable?: 'category' | 'type' | null;
    initialEditingId?: number | null;
    initialEditingSlug?: string | null;
    initialIsCreate?: boolean;
    initialType?: string;
}

function parsePanelFromPath(pathname: string): { table: 'category' | 'type'; mode: 'create' | 'edit' | null; slug: string | null } {
    if (pathname.endsWith('/categories/create')) return { table: 'category', mode: 'create', slug: null };
    if (pathname.endsWith('/categories/types/create')) return { table: 'type', mode: 'create', slug: null };
    let m = pathname.match(/\/categories\/types\/([^/]+)\/edit\/?$/);
    if (m) return { table: 'type', mode: 'edit', slug: m[1] };
    m = pathname.match(/\/categories\/([^/]+)\/edit\/?$/);
    if (m) return { table: 'category', mode: 'edit', slug: m[1] };
    return { table: 'category', mode: null, slug: null };
}

export default function CategoriesPage() {
    const { categories, types, initialEditingSlug, initialIsCreate, initialTable } = usePage<PageProps>().props;
    const basePath = '/categories';

    const [panelTable, setPanelTable] = useState<'category' | 'type'>(() => {
        if (initialTable) return initialTable as 'category' | 'type';
        if (typeof window !== 'undefined') return parsePanelFromPath(window.location.pathname).table;
        return 'category';
    });
    const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(() => {
        if (initialIsCreate) return 'create';
        if (initialEditingSlug) return 'edit';
        if (typeof window !== 'undefined') return parsePanelFromPath(window.location.pathname).mode;
        return null;
    });
    const [activeSlug, setActiveSlug] = useState<string | null>(() => {
        if (initialEditingSlug) return initialEditingSlug;
        if (typeof window !== 'undefined') return parsePanelFromPath(window.location.pathname).slug;
        return null;
    });
    const [panelDirty, setPanelDirty] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ table: 'category' | 'type'; slug: string } | null>(null);
    const [categoryQ, setCategoryQ] = useState('');
    const [typeQ, setTypeQ] = useState('');

    const isPanelOpen = panelMode !== null;

    const activeCategory = useMemo(() => {
        if (panelTable !== 'category' || !activeSlug) return null;
        return categories.find((c) => c.slug === activeSlug) ?? null;
    }, [panelTable, activeSlug, categories]);

    const activeType = useMemo(() => {
        if (panelTable !== 'type' || !activeSlug) return null;
        return types.find((t) => t.slug === activeSlug) ?? null;
    }, [panelTable, activeSlug, types]);

    const filteredCategories = useMemo(() => {
        const q = categoryQ.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((c) => `${c.name} ${c.slug} ${c.description ?? ''}`.toLowerCase().includes(q));
    }, [categories, categoryQ]);

    const filteredTypes = useMemo(() => {
        const q = typeQ.trim().toLowerCase();
        if (!q) return types;
        return types.filter((t) => `${t.name} ${t.slug} ${t.description ?? ''}`.toLowerCase().includes(q));
    }, [types, typeQ]);

    useEffect(() => {
        if (initialIsCreate) {
            setPanelMode('create');
            setPanelTable((initialTable as 'category' | 'type') ?? 'category');
            setActiveSlug(null);
        } else if (initialEditingSlug) {
            setPanelMode('edit');
            setPanelTable((initialTable as 'category' | 'type') ?? 'category');
            setActiveSlug(initialEditingSlug);
        }
    }, [initialIsCreate, initialEditingSlug, initialTable]);

    useEffect(() => {
        function onPop() {
            const parsed = parsePanelFromPath(window.location.pathname);
            setPanelTable(parsed.table);
            setPanelMode(parsed.mode);
            setActiveSlug(parsed.slug);
            setPanelDirty(false);
            setShowUnsavedConfirm(false);
        }
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    const openCreate = useCallback(
        (table: 'category' | 'type') => {
            const url = table === 'category' ? `${basePath}/create` : `${basePath}/types/create`;
            window.history.pushState({}, '', url);
            setPanelTable(table);
            setPanelMode('create');
            setActiveSlug(null);
            setPanelDirty(false);
        },
        [basePath],
    );

    const openEdit = useCallback(
        (table: 'category' | 'type', row: Row) => {
            const url = table === 'category' ? `${basePath}/${row.slug}/edit` : `${basePath}/types/${row.slug}/edit`;
            window.history.pushState({}, '', url);
            setPanelTable(table);
            setPanelMode('edit');
            setActiveSlug(row.slug);
            setPanelDirty(false);
        },
        [basePath],
    );

    const doClosePanel = useCallback(() => {
        window.history.replaceState({}, '', basePath);
        setPanelMode(null);
        setActiveSlug(null);
        setPanelDirty(false);
        setShowUnsavedConfirm(false);
    }, [basePath]);

    const requestClosePanel = useCallback(() => {
        if (panelDirty) setShowUnsavedConfirm(true);
        else doClosePanel();
    }, [panelDirty, doClosePanel]);

    function handleDelete() {
        if (!confirmDelete) return;
        const url = confirmDelete.table === 'category' ? `/categories/${confirmDelete.slug}` : `/categories/types/${confirmDelete.slug}`;
        router.delete(url, {
            preserveScroll: true,
            headers: { Accept: 'application/json' },
            onSuccess: () => setConfirmDelete(null),
            onError: () => setConfirmDelete(null),
        });
    }

    function renderTable(rows: Row[], table: 'category' | 'type') {
        return (
            <Table<Row & Record<string, unknown>>
                columns={[
                    { key: 'name', header: 'Nama', render: (_v, row) => <span className="font-sans text-[13px] font-medium text-[#1a1a1a] whitespace-nowrap">{(row as Row).name}</span> },
                    { key: 'slug', header: 'Slug', cellClassName: 'font-mono text-[11px] text-[#888] whitespace-nowrap', render: (v) => v as string },
                    { key: 'description', header: 'Deskripsi', headerClassName: 'hidden sm:table-cell', cellClassName: 'hidden sm:table-cell font-sans text-[12px] text-[#666] max-w-[240px] truncate', render: (v) => (v as string) || '—' },
                    {
                        key: 'is_active',
                        header: 'Status',
                        render: (_v, row) => {
                            const r = row as Row;
                            return <Badge className={r.is_active ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]' : 'bg-[#f5f5f5] text-[#888]'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge>;
                        },
                    },
                    { key: 'products_count', header: 'Produk', cellClassName: 'font-sans text-[12px] text-[#1a1a1a]', render: (v) => String(v) },
                    {
                        key: 'actions',
                        header: 'Aksi',
                        headerClassName: 'text-right',
                        cellClassName: 'text-right',
                        render: (_v, row) => {
                            const r = row as Row;
                            return (
                                <div className="flex items-center justify-end gap-1.5">
                                    <Button variant="secondary" size="icon" onClick={() => openEdit(table, r)} aria-label={`Edit ${r.name}`}>
                                        <Pencil size={14} strokeWidth={1.5} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setConfirmDelete({ table, slug: r.slug })}
                                        aria-label={`Hapus ${r.name}`}
                                        className="text-[#888] hover:border-red-400 hover:text-red-500"
                                        disabled={r.products_count > 0}
                                        title={r.products_count > 0 ? 'Masih dipakai produk' : 'Hapus'}
                                    >
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </Button>
                                </div>
                            );
                        },
                    },
                ]}
                data={rows as unknown as (Row & Record<string, unknown>)[]}
                rowKey={(row) => (row as Row).slug}
                emptyText={`Belum ada ${table === 'category' ? 'kategori' : 'tipe'}.`}
                pagination={{ links: [], current_page: 1, last_page: 1, total: rows.length }}
                paginationLabel={table === 'category' ? 'kategori' : 'tipe'}
                paginationMetaText={`${rows.length} ${table === 'category' ? 'kategori' : 'tipe'} · Hal 1 dari 1`}
            />
        );
    }

    return (
        <AppLayout>
            <Head title="Kategori & Tipe — Perfu.me Admin" />
            <div className="flex flex-col gap-10">
                <div>
                    <h1 className="font-sans text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Kategori & Tipe</h1>
                    <p className="font-sans text-[12.5px] text-[#888] mt-1">Kelola kategori dan tipe produk — dipakai di form produk.</p>
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-sans text-[14px] font-semibold text-[#1a1a1a]">Kategori</h2>
                        <p className="font-sans text-[12px] text-[#888]">{filteredCategories.length} kategori</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <div className="flex-1 min-w-0">
                            <SearchBar value={categoryQ} onChange={setCategoryQ} onSearch={() => {}} placeholder="Cari kategori..." className="w-full" />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="primary" size="lg" onClick={() => openCreate('category')} className="whitespace-nowrap">
                                <Plus size={14} strokeWidth={1.8} />
                                Tambah Kategori
                            </Button>
                        </div>
                    </div>
                    {renderTable(filteredCategories, 'category')}
                </div>

                {/* Types */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-sans text-[14px] font-semibold text-[#1a1a1a]">Tipe</h2>
                        <p className="font-sans text-[12px] text-[#888]">{filteredTypes.length} tipe</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <div className="flex-1 min-w-0">
                            <SearchBar value={typeQ} onChange={setTypeQ} onSearch={() => {}} placeholder="Cari tipe..." className="w-full" />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button variant="primary" size="lg" onClick={() => openCreate('type')} className="whitespace-nowrap">
                                <Plus size={14} strokeWidth={1.8} />
                                Tambah Tipe
                            </Button>
                        </div>
                    </div>
                    {renderTable(filteredTypes, 'type')}
                </div>
            </div>

            <SidePanel
                open={isPanelOpen}
                onOpenChange={(open) => {
                    if (!open) requestClosePanel();
                }}
                title={
                    panelMode === 'create'
                        ? panelTable === 'category'
                            ? 'Tambah Kategori'
                            : 'Tambah Tipe'
                        : panelTable === 'category'
                          ? 'Edit Kategori'
                          : 'Edit Tipe'
                }
                subtitle={
                    panelMode === 'edit'
                        ? panelTable === 'category'
                            ? activeCategory?.name
                            : activeType?.name
                        : panelTable === 'category'
                          ? 'Kategori baru'
                          : 'Tipe baru'
                }
                width="md"
            >
                {panelMode === 'create' && (
                    <CategoryFormPanel
                        mode="create"
                        table={panelTable}
                        onClose={requestClosePanel}
                        onSuccess={doClosePanel}
                        onDirtyChange={setPanelDirty}
                    />
                )}
                {panelMode === 'edit' && panelTable === 'category' && activeCategory && (
                    <CategoryFormPanel
                        key={activeCategory.slug}
                        mode="edit"
                        table="category"
                        initial={activeCategory}
                        onClose={requestClosePanel}
                        onSuccess={doClosePanel}
                        onDirtyChange={setPanelDirty}
                    />
                )}
                {panelMode === 'edit' && panelTable === 'type' && activeType && (
                    <CategoryFormPanel
                        key={activeType.slug}
                        mode="edit"
                        table="type"
                        initial={activeType}
                        onClose={requestClosePanel}
                        onSuccess={doClosePanel}
                        onDirtyChange={setPanelDirty}
                    />
                )}
                {panelMode === 'edit' && !activeCategory && !activeType && (
                    <p className="font-sans text-[12px] text-[#888]">Data tidak ditemukan. Mungkin sudah terhapus.</p>
                )}
            </SidePanel>

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

            <ConfirmDialog
                open={confirmDelete !== null}
                title={confirmDelete?.table === 'category' ? 'Hapus kategori?' : 'Hapus tipe?'}
                message={
                    confirmDelete
                        ? (() => {
                              const row = confirmDelete.table === 'category' ? categories.find((c) => c.slug === confirmDelete.slug) : types.find((t) => t.slug === confirmDelete.slug);
                              if (row && row.products_count > 0) return `Tidak bisa dihapus — masih dipakai ${row.products_count} produk.`;
                              return 'Tindakan ini tidak dapat dibatalkan.';
                          })()
                        : ''
                }
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onCancel={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
            />
        </AppLayout>
    );
}
