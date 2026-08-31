import { Head, Link, router, usePage } from "@inertiajs/react";
import { Trash2, Pencil, Plus, Star } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { CheckedCombobox } from "@/components/ui/checked-combobox";
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
    filters: { q: string; type: string; gender: string };
    filterCounts: {
        type: Record<string, number>;
        gender: Record<string, number>;
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
                                [filters.type, filters.gender].filter(
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
                                applyFilters({ type, gender });
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

                <div className="border border-[#e6e6e6] rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#fafafa] border-b border-[#e6e6e6]">
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Produk
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Tipe
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Gender
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Harga
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap">
                                        Stok
                                    </th>
                                    <th className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] px-4 py-3 whitespace-nowrap text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center font-sans text-[12px] text-[#aaa]"
                                        >
                                            Tidak ada produk.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((row) => (
                                        <tr
                                            key={row.slug}
                                            className="border-b border-[#f2f2f2] last:border-0 hover:bg-[#fafafa] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="rounded-lg bg-[#f7f7f7] border border-[#e6e6e6] overflow-hidden shrink-0 flex items-center justify-center"
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            minWidth: 40,
                                                            minHeight: 40,
                                                            maxWidth: 40,
                                                            maxHeight: 40,
                                                        }}
                                                    >
                                                        {row.image ? (
                                                            <img
                                                                src={row.image}
                                                                alt={row.name}
                                                                style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    objectFit:
                                                                        "cover",
                                                                    display:
                                                                        "block",
                                                                    maxWidth: 40,
                                                                }}
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <span className="font-sans text-[10px] text-[#bbb]">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-sans text-[13px] font-medium text-[#1a1a1a] leading-none truncate">
                                                            {row.name}
                                                        </p>
                                                        <p className="font-sans text-[11px] text-[#888] leading-none mt-1 truncate max-w-[200px]">
                                                            {row.tagline ??
                                                                row.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className="text-[9px] uppercase tracking-[0.12em]">
                                                    {row.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-sans text-[12px] text-[#555]">
                                                {row.gender}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-sans text-[12px] font-medium text-[#1a1a1a]">
                                                    {formatPrice(row.price)}
                                                </span>
                                                {row.priceRange[0] !==
                                                    row.priceRange[1] && (
                                                    <span className="font-sans text-[11px] text-[#888] ml-1">
                                                        (
                                                        {formatPrice(
                                                            row.priceRange[0],
                                                        )}
                                                        –
                                                        {formatPrice(
                                                            row.priceRange[1],
                                                        )}
                                                        )
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`font-sans text-[12px] ${row.totalStock > 0 ? "text-[#1a1a1a]" : "text-red-500"}`}
                                                >
                                                    {row.totalStock > 0
                                                        ? `${row.totalStock}`
                                                        : "Habis"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <ButtonLink
                                                        href={`/products/${row.slug}/reviews`}
                                                        variant="secondary"
                                                        size="icon"
                                                        aria-label={`Ulasan ${row.name}`}
                                                    >
                                                        <Star size={14} strokeWidth={1.5} />
                                                    </ButtonLink>
                                                    <ButtonLink
                                                        href={`/products/${row.slug}/edit`}
                                                        variant="secondary"
                                                        size="icon"
                                                        aria-label={`Edit ${row.name}`}
                                                    >
                                                        <Pencil size={14} strokeWidth={1.5} />
                                                    </ButtonLink>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setConfirmSlug(row.slug)}
                                                        aria-label={`Hapus ${row.name}`}
                                                        className="text-[#888] hover:border-red-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14} strokeWidth={1.5} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {products.last_page > 1 ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e6e6e6] bg-[#fafafa]/50 px-4 py-3">
                            <span className="font-sans text-[11px] text-[#888]">
                                Hal {products.current_page} dari{" "}
                                {products.last_page} · {products.data.length}{" "}
                                produk
                            </span>
                            <div className="flex items-center gap-1 flex-wrap justify-center">
                                {products.links.map((link, i) => {
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
                                            className={`min-w-[36px] h-8 px-3 inline-flex items-center justify-center rounded-full font-sans text-[12px] border transition-colors duration-200 ${
                                                link.active
                                                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                                                    : "bg-white text-[#666] border-[#e6e6e6] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                                            } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
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
                                {products.data.length} produk · Hal 1 dari 1
                            </span>
                            <span className="font-sans text-[11px] text-[#aaa]">
                                —
                            </span>
                        </div>
                    )}
                </div>

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
