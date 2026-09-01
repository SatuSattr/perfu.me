import { Head, router, usePage } from "@inertiajs/react";
import { Trash2, Pencil, Plus, Star } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { CheckedCombobox } from "@/components/ui/checked-combobox";
import { Table } from "@/components/ui/table";
import { formatPrice } from "@/lib/format";

interface ProductRow {
    id: number;
    slug: string;
    name: string;
    tagline: string | null;
    gender: string;
    type: string;
    category: string;
    price: number;
    stock: number | null;
    is_active: boolean;
    image: string | null;
    totalStock: number;
    priceRange: [number, number];
    updated_at: string | null;
}

interface PageProps {
    products: {
        data: ProductRow[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: { q: string; type: string; gender: string; category: string };
    filterCounts: {
        type: Record<string, number>;
        gender: Record<string, number>;
        category: Record<string, number>;
    };
}

export default function ProductsIndex() {
    const { products, filters, filterCounts } = usePage<PageProps>().props;
    const [q, setQ] = useState(filters.q ?? "");
    const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

    function applyFilters(next: Partial<PageProps["filters"]>) {
        router.get(
            "/products",
            { ...filters, ...next, q },
            { preserveState: true, replace: true },
        );
    }

    function onSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ q });
    }

    return (
        <AppLayout>
            <Head title="Produk — Perfu.me Admin" />
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="font-sans text-[22px] font-semibold text-[#1a1a1a] tracking-tight mt-1">
                        Produk
                    </h1>
                    <p className="font-sans text-[12.5px] text-[#888] mt-1">
                        Kelola {products.data.length} produk
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 min-w-0">
                        <SearchBar
                            value={q}
                            onChange={setQ}
                            onSearch={() => applyFilters({ q })}
                            placeholder="Search"
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <CheckedCombobox
                            label="Filter Atribut"
                            buttonLabel="Filter"
                            value={
                                [filters.type, filters.gender, filters.category].filter(
                                    Boolean,
                                ) as string[]
                            }
                            onChange={(next) => {
                                const type =
                                    next.find((v) =>
                                        ["signature", "inspired"].includes(v),
                                    ) ?? "";
                                const gender =
                                    next.find((v) =>
                                        ["Pria", "Wanita", "Unisex"].includes(
                                            v,
                                        ),
                                    ) ?? "";
                                // category is any remaining value not type/gender
                                const category =
                                    next.find(
                                        (v) =>
                                            !["signature", "inspired", "Pria", "Wanita", "Unisex"].includes(v),
                                    ) ?? "";
                                applyFilters({ type, gender, category });
                            }}
                            groups={[
                                {
                                    label: "Tipe",
                                    maxSelected: 1,
                                    options: [
                                        {
                                            code: "signature",
                                            name: "Signature",
                                            count:
                                                filterCounts?.type?.signature ??
                                                0,
                                        },
                                        {
                                            code: "inspired",
                                            name: "Inspired",
                                            count:
                                                filterCounts?.type?.inspired ??
                                                0,
                                        },
                                    ],
                                },
                                {
                                    label: "Gender",
                                    maxSelected: 1,
                                    options: [
                                        {
                                            code: "Pria",
                                            name: "Pria",
                                            count:
                                                filterCounts?.gender?.Pria ?? 0,
                                        },
                                        {
                                            code: "Wanita",
                                            name: "Wanita",
                                            count:
                                                filterCounts?.gender?.Wanita ??
                                                0,
                                        },
                                        {
                                            code: "Unisex",
                                            name: "Unisex",
                                            count:
                                                filterCounts?.gender?.Unisex ??
                                                0,
                                        },
                                    ],
                                },
                                {
                                    label: "Kategori",
                                    maxSelected: 1,
                                    options: Object.entries(filterCounts?.category ?? {}).map(([code, count]) => ({
                                        code,
                                        name: code.toUpperCase(),
                                        count: count as number,
                                    })),
                                },
                            ]}
                            placeholder="Cari atribut..."
                            className="shrink-0"
                        />
                        <ButtonLink href="/products/create" variant="primary" size="lg" className="no-underline">
                            <Plus size={14} strokeWidth={1.8} />
                            <span className="hidden sm:inline">Tambah Produk</span>
                            <span className="sm:hidden">Tambah</span>
                        </ButtonLink>
                    </div>
                </div>

                <Table<ProductRow & Record<string, unknown>>
                    columns={[
                        {
                            key: 'name',
                            header: 'Produk',
                            render: (_v, row) => (
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className="rounded-lg bg-[#f7f7f7] border border-[#e6e6e6] overflow-hidden shrink-0 flex items-center justify-center"
                                        style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, maxWidth: 40, maxHeight: 40 }}
                                    >
                                        {row.image ? (
                                            <img
                                                src={row.image as string}
                                                alt={row.name as string}
                                                style={{ width: 40, height: 40, objectFit: 'cover', display: 'block', maxWidth: 40 }}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="font-sans text-[10px] text-[#bbb]">—</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-sans text-[13px] font-medium text-[#1a1a1a] leading-none truncate">{row.name as string}</p>
                                        <p className="font-sans text-[11px] text-[#888] leading-none mt-1 truncate max-w-[200px]">{(row.tagline as string) ?? (row.slug as string)}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'type',
                            header: 'Tipe',
                            render: (_v, row) => <Badge className="text-[9px] uppercase tracking-[0.12em]">{row.type as string}</Badge>,
                        },
                        {
                            key: 'gender',
                            header: 'Gender',
                            cellClassName: 'font-sans text-[12px] text-[#555]',
                            render: (v) => v as string,
                        },
                        {
                            key: 'price',
                            header: 'Harga',
                            render: (_v, row) => (
                                <>
                                    <span className="font-sans text-[12px] font-medium text-[#1a1a1a]">{formatPrice(row.price as number)}</span>
                                    {(row.priceRange as [number, number])[0] !== (row.priceRange as [number, number])[1] && (
                                        <span className="font-sans text-[11px] text-[#888] ml-1">
                                            ({formatPrice((row.priceRange as [number, number])[0])}–{formatPrice((row.priceRange as [number, number])[1])})
                                        </span>
                                    )}
                                </>
                            ),
                        },
                        {
                            key: 'totalStock',
                            header: 'Stok',
                            render: (_v, row) => (
                                <span className={`font-sans text-[12px] ${(row.totalStock as number) > 0 ? 'text-[#1a1a1a]' : 'text-red-500'}`}>
                                    {(row.totalStock as number) > 0 ? `${row.totalStock as number}` : 'Habis'}
                                </span>
                            ),
                        },
                        {
                            key: 'actions',
                            header: 'Aksi',
                            headerClassName: 'text-right',
                            cellClassName: 'text-right',
                            render: (_v, row) => (
                                <div className="flex items-center justify-end gap-1.5">
                                    <ButtonLink href={`/products/${row.slug as string}/reviews`} variant="secondary" size="icon" aria-label={`Ulasan ${row.name as string}`}>
                                        <Star size={14} strokeWidth={1.5} />
                                    </ButtonLink>
                                    <ButtonLink href={`/products/${row.slug as string}/edit`} variant="secondary" size="icon" aria-label={`Edit ${row.name as string}`}>
                                        <Pencil size={14} strokeWidth={1.5} />
                                    </ButtonLink>
                                    <Button variant="outline" size="icon" onClick={() => setConfirmSlug(row.slug as string)} aria-label={`Hapus ${row.name as string}`} className="text-[#888] hover:border-red-400 hover:text-red-500">
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={products.data as unknown as (ProductRow & Record<string, unknown>)[]}
                    rowKey={(row) => row.slug as string}
                    emptyText="Tidak ada produk."
                    pagination={{ links: products.links, current_page: products.current_page, last_page: products.last_page }}
                    paginationMetaText={products.last_page > 1 ? `Hal ${products.current_page} dari ${products.last_page} · ${products.data.length} produk` : `${products.data.length} produk · Hal 1 dari 1`}
                    paginationLabel="produk"
                />

                {confirmSlug && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="bg-white rounded-2xl border border-[#e6e6e6] p-6 w-full max-w-sm shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                            <h3 className="font-sans text-[14px] font-semibold text-[#1a1a1a]">
                                Hapus produk?
                            </h3>
                            <p className="font-sans text-[12.5px] text-[#666] leading-[1.7] mt-2">
                                Tindakan ini tidak dapat dibatalkan. Foto dan
                                varian akan ikut terhapus.
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmSlug(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        router.delete(
                                            `/products/${confirmSlug}`,
                                            {
                                                onSuccess: () =>
                                                    setConfirmSlug(null),
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
