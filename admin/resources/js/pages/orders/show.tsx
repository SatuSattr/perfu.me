import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, MessageCircle, Trash2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLayout } from "@/layouts/app-layout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { TextArea } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { formatPrice } from "@/lib/format";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";

interface OrderItem {
    id: number;
    product_slug: string;
    product_name: string;
    image_path: string | null;
    price: number;
    qty: number;
    selected_options: Record<string, string> | null;
    subtotal: number;
}

interface Order {
    id: number;
    code: string;
    email: string;
    whatsapp: string;
    full_name: string;
    province: string;
    province_name: string | null;
    city: string;
    city_name: string | null;
    district: string;
    district_name: string | null;
    village: string;
    village_name: string | null;
    postal_code: string;
    street: string;
    detail: string | null;
    lat: string | null;
    lng: string | null;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    status: string;
    notes: string | null;
    full_address: string;
    created_at: string | null;
    updated_at: string | null;
    items: OrderItem[];
}

interface PageProps {
    order: Order;
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case "pending":
            return "bg-[#fff8e1] text-[#f57f17] border-[#ffe082]";
        case "whatsapp_sent":
            return "bg-[#e3f2fd] text-[#1565c0] border-[#90caf9]";
        case "confirmed":
            return "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]";
        case "cancelled":
            return "bg-[#fce4ec] text-[#c62828] border-[#f8bbd0]";
        default:
            return "bg-[#f5f5f5] text-[#888] border-[#e6e6e6]";
    }
}

function Barcode({
    value,
    width = 128,
    height = 36,
}: {
    value: string;
    width?: number;
    height?: number;
}) {
    const bars: { w: number; black: boolean }[] = [];
    for (let i = 0; i < value.length; i++) {
        const c = value.charCodeAt(i);
        for (let j = 0; j < 4; j++) {
            const w = 1 + ((c >> j) & 1) + ((c >> ((j + 2) % 8)) & 1);
            bars.push({ w, black: j % 2 === 0 });
        }
        if (i < value.length - 1) bars.push({ w: 1, black: false });
    }
    const totalW = bars.reduce((s, b) => s + b.w, 0);
    const scale = width / totalW;
    let x = 0;
    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Barcode ${value}`}
            className="bg-white"
        >
            {bars.map((b, idx) => {
                const w = b.w * scale;
                const el = b.black ? (
                    <rect
                        key={idx}
                        x={x}
                        y={0}
                        width={w}
                        height={height}
                        fill="#1a1a1a"
                    />
                ) : null;
                x += w;
                return el;
            })}
        </svg>
    );
}

export default function OrderShow() {
    const { order } = usePage<PageProps>().props;
    const [status, setStatus] = useState(order.status);
    const [notes, setNotes] = useState(order.notes ?? "");

    useEffect(() => {
        setStatus(order.status);
        setNotes(order.notes ?? "");
    }, [order.status, order.notes]);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [sendingWa, setSendingWa] = useState(false);

    function handleStatusSave() {
        setSaving(true);
        router.patch(
            `/orders/${order.code}/status`,
            { status, notes: notes || null } as never,
            {
                preserveScroll: true,
                headers: { Accept: "application/json" },
                onFinish: () => setSaving(false),
            } as never,
        );
    }

    function handleSendWa() {
        setSendingWa(true);
        router.post(
            `/orders/${order.code}/whatsapp`,
            {} as never,
            {
                preserveScroll: true,
                headers: { Accept: "application/json" },
                onFinish: () => setSendingWa(false),
            } as never,
        );
    }

    return (
        <AppLayout>
            <Head title={`Pesanan ${order.code} — Perfu.me Admin`} />
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <ButtonLink
                        href="/orders"
                        variant="secondary"
                        size="icon"
                        aria-label="Kembali"
                    >
                        <ArrowLeft size={14} strokeWidth={1.8} />
                    </ButtonLink>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="font-sans text-[18px] font-semibold text-[#1a1a1a] tracking-tight leading-none">
                                {order.code}
                            </h1>
                            <Badge
                                className={`text-[9px] uppercase tracking-[0.12em] ${statusBadgeClass(order.status)}`}
                            >
                                {order.status}
                            </Badge>
                        </div>
                        <p className="font-sans text-[11px] text-[#888] mt-1">
                            {order.created_at
                                ? new Date(order.created_at).toLocaleString(
                                      "id-ID",
                                      {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      },
                                  )
                                : "—"}{" "}
                            · {order.items.length} item
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {order.status === "pending" && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleSendWa}
                                disabled={sendingWa}
                                className="rounded-full"
                            >
                                <MessageCircle size={14} strokeWidth={1.8} />
                                {sendingWa ? "Mengirim..." : "Kirim WA"}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setConfirmDelete(true)}
                            className="rounded-full text-[#888] hover:border-red-400 hover:text-red-500"
                        >
                            <Trash2 size={14} strokeWidth={1.5} />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left column: Informasi Pelanggan + Status & Catatan */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6">
                            <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                                Informasi Pelanggan
                            </h3>
                            <div className="mt-5 flex flex-col gap-5">
                                <div className="flex gap-4 justify-between items-start">
                                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                                        <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                            Kontak
                                        </p>
                                        <p className="font-sans text-[13px] font-medium text-[#1a1a1a]">
                                            {order.full_name}
                                        </p>
                                        <p className="font-sans text-[12px] text-[#666] truncate">
                                            {order.whatsapp} · {order.email}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex flex-col items-center gap-1">
                                        <Barcode value={order.code} />
                                        <span className="font-mono text-[9px] tracking-[0.14em] text-[#888]">
                                            {order.code}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-[#f5f5f5] pt-4 flex flex-col gap-3">
                                    <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                        Alamat Pengiriman
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                                Provinsi
                                            </p>
                                            <p className="font-sans text-[11px] text-[#1a1a1a] mt-1 truncate">
                                                {order.province_name ||
                                                    order.province}{" "}
                                                ({order.province})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                                Kota
                                            </p>
                                            <p className="font-sans text-[11px] text-[#1a1a1a] mt-1 truncate">
                                                {order.city_name || order.city}{" "}
                                                ({order.city})
                                            </p>
                                        </div>
                                        <div className="row-span-2 flex flex-col">
                                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                                Alamat Lengkap
                                            </p>
                                            <p className="font-sans text-[11px] text-[#1a1a1a] mt-1 leading-relaxed break-words">
                                                {order.street}
                                                {order.detail
                                                    ? ` — ${order.detail}`
                                                    : ""}
                                            </p>
                                            {(order.lat || order.lng) && (
                                                <p className="font-sans text-[11px] text-[#1a1a1a] mt-1">
                                                    Pin: {order.lat},{" "}
                                                    {order.lng}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                                Kecamatan
                                            </p>
                                            <p className="font-sans text-[11px] text-[#1a1a1a] mt-1 truncate">
                                                {order.district_name ||
                                                    order.district}{" "}
                                                ({order.district})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                                Desa
                                            </p>
                                            <p className="font-sans text-[11px] text-[#1a1a1a] mt-1 truncate">
                                                {order.village_name ||
                                                    order.village}{" "}
                                                ({order.village})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-sans text-[11px] text-[#888]">
                                            {order.village_name ||
                                                order.village}
                                            ,{" "}
                                            {order.district_name ||
                                                order.district}
                                        </p>
                                        <p className="font-sans text-[11px] text-[#888]">
                                            {order.city_name || order.city},{" "}
                                            {order.province_name ||
                                                order.province}{" "}
                                            · {order.postal_code}
                                        </p>
                                    </div>
                                    <p className="font-sans text-[11px] text-[#aaa] leading-relaxed">
                                        {order.full_address}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6 flex flex-col flex-1">
                            <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                                Status & Catatan
                            </h3>
                            <div className="mt-5 flex flex-col gap-4 flex-1">
                                <Combobox
                                    label="Status"
                                    placeholder="Pilih status"
                                    value={
                                        status
                                            ? {
                                                  code: status,
                                                  name:
                                                      (
                                                          {
                                                              pending:
                                                                  "Pending",
                                                              whatsapp_sent:
                                                                  "Whatsapp Sent",
                                                              confirmed:
                                                                  "Confirmed",
                                                              cancelled:
                                                                  "Cancelled",
                                                          } as Record<
                                                              string,
                                                              string
                                                          >
                                                      )[status] ?? status,
                                              }
                                            : null
                                    }
                                    onSelect={(opt) => setStatus(opt.code)}
                                    options={[
                                        { code: "pending", name: "Pending" },
                                        {
                                            code: "whatsapp_sent",
                                            name: "Whatsapp Sent",
                                        },
                                        {
                                            code: "confirmed",
                                            name: "Confirmed",
                                        },
                                        {
                                            code: "cancelled",
                                            name: "Cancelled",
                                        },
                                    ]}
                                    typeable={false}
                                />
                                <TextArea
                                    label="Catatan (opsional)"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Catatan internal admin..."
                                    rows={3}
                                />
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleStatusSave}
                                    disabled={saving}
                                    className="rounded-full mt-auto"
                                >
                                    <Check size={12} strokeWidth={1.8} />
                                    {saving ? "Menyimpan..." : "Simpan Status"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Produk + Rincian Biaya (single panel, height fit) */}
                    <div className="bg-white border border-[#e6e6e6] rounded-2xl p-5 sm:p-6 flex flex-col h-fit">
                        <h3 className="font-sans text-[12px] font-semibold tracking-[0.12em] uppercase text-[#1a1a1a]">
                            Produk
                        </h3>
                        <div className="mt-5">
                            <Table<OrderItem & Record<string, unknown>>
                                columns={[
                                    {
                                        key: "product_name",
                                        header: "Produk",
                                        render: (_v, row) => (
                                            <span className="font-sans text-[12px] font-medium text-[#1a1a1a]">
                                                {
                                                    (row as OrderItem)
                                                        .product_name
                                                }
                                            </span>
                                        ),
                                    },
                                    {
                                        key: "selected_options",
                                        header: "Varian",
                                        render: (_v, row) => {
                                            const opts = (row as OrderItem)
                                                .selected_options;
                                            if (
                                                !opts ||
                                                Object.keys(opts).length === 0
                                            )
                                                return (
                                                    <span className="text-[#aaa]">
                                                        —
                                                    </span>
                                                );
                                            return (
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(opts).map(
                                                        ([k, v]) => (
                                                            <span
                                                                key={k}
                                                                className="inline-flex items-center font-sans text-[9px] tracking-[0.04em] text-[#666] bg-[#f2f2f2] rounded-full px-2 py-0.5"
                                                            >
                                                                {k}:{" "}
                                                                {v as string}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        key: "price",
                                        header: "Harga",
                                        render: (_v, row) => (
                                            <span className="font-sans text-[11px] text-[#555]">
                                                {formatPrice(
                                                    (row as OrderItem).price,
                                                )}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: "qty",
                                        header: "Qty",
                                        cellClassName:
                                            "font-sans text-[11px] text-[#1a1a1a]",
                                        render: (v) => String(v),
                                    },
                                    {
                                        key: "subtotal",
                                        header: "Subtotal",
                                        render: (_v, row) => (
                                            <span className="font-sans text-[11px] font-medium text-[#1a1a1a]">
                                                {formatPrice(
                                                    (row as OrderItem).subtotal,
                                                )}
                                            </span>
                                        ),
                                    },
                                ]}
                                data={
                                    order.items as unknown as (OrderItem &
                                        Record<string, unknown>)[]
                                }
                                rowKey={(row) => String((row as OrderItem).id)}
                                emptyText="Tidak ada item."
                                hidePagination
                                wrapperClassName="rounded-xl"
                            />
                        </div>
                        <div className="border-t border-[#f5f5f5] pt-6">
                            <div className="flex flex-col gap-3 mt-5 font-sans text-[12px]">
                                <div className="flex items-center justify-between text-[#666]">
                                    <span>
                                        Subtotal (
                                        {order.items.reduce(
                                            (s, i) => s + i.qty,
                                            0,
                                        )}{" "}
                                        item)
                                    </span>
                                    <span className="font-medium text-[#111]">
                                        {formatPrice(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[#666]">
                                    <span>Ongkos Kirim</span>
                                    <span className="font-medium text-green-600">
                                        Gratis
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[#666]">
                                    <span>Pajak (PPN 11%)</span>
                                    <span className="font-medium text-[#111]">
                                        {formatPrice(order.tax)}
                                    </span>
                                </div>
                                <div className="border-t border-black/5 pt-3 flex items-center justify-between">
                                    <span className="font-sans text-[13px] font-semibold text-[#111]">
                                        Total
                                    </span>
                                    <span className="font-sans text-[18px] font-semibold text-[#111]">
                                        {formatPrice(order.total)}
                                    </span>
                                </div>
                                <p className="font-sans text-[10px] leading-relaxed text-[#aaa]">
                                    Harga sudah termasuk pajak. Ongkos kirim
                                    gratis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDelete}
                title="Hapus pesanan?"
                message={`Pesanan ${order.code} akan dihapus permanen beserta itemnya.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() =>
                    router.delete(`/orders/${order.code}`, {
                        onSuccess: () => setConfirmDelete(false),
                    })
                }
            />
        </AppLayout>
    );
}
