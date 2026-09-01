import { Head, router, usePage, Link } from '@inertiajs/react';
import { Trash2, Eye, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/layouts/app-layout';
import { Button, ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/ui/search-bar';
import { CheckedCombobox } from '@/components/ui/checked-combobox';
import { Table } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import { formatPrice } from '@/lib/format';

interface OrderRow {
    id: number;
    code: string;
    full_name: string;
    email: string;
    whatsapp: string;
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    status: string;
    items_count: number;
    created_at: string | null;
}

interface PageProps {
    orders: {
        data: OrderRow[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: { q: string; status: string };
    statusCounts: Record<string, number>;
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'pending':
            return 'bg-[#fff8e1] text-[#f57f17] border-[#ffe082]';
        case 'whatsapp_sent':
            return 'bg-[#e3f2fd] text-[#1565c0] border-[#90caf9]';
        case 'confirmed':
            return 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]';
        case 'cancelled':
            return 'bg-[#fce4ec] text-[#c62828] border-[#f8bbd0]';
        default:
            return 'bg-[#f5f5f5] text-[#888] border-[#e6e6e6]';
    }
}

export default function OrdersIndex() {
    const { orders, filters, statusCounts } = usePage<PageProps>().props;
    const [q, setQ] = useState(filters.q ?? '');
    const [confirmCode, setConfirmCode] = useState<string | null>(null);

    function applyFilters(next: Partial<PageProps['filters']>) {
        router.get('/orders', { ...filters, ...next, q }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Pesanan — Perfu.me Admin" />
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="font-sans text-[22px] font-semibold text-[#1a1a1a] tracking-tight mt-1">Pesanan</h1>
                    <p className="font-sans text-[12.5px] text-[#888] mt-1">Kelola {orders.data.length} pesanan</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 min-w-0">
                        <SearchBar value={q} onChange={setQ} onSearch={() => applyFilters({ q })} placeholder="Cari kode, nama, email, WA..." className="w-full" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <CheckedCombobox
                            label="Filter Status"
                            buttonLabel="Status"
                            value={filters.status ? [filters.status] : []}
                            onChange={(next) => {
                                const status = next[0] ?? '';
                                applyFilters({ status });
                            }}
                            groups={[
                                {
                                    label: 'Status',
                                    maxSelected: 1,
                                    options: [
                                        { code: 'pending', name: 'Pending', count: statusCounts?.pending ?? 0 },
                                        { code: 'whatsapp_sent', name: 'Whatsapp Sent', count: statusCounts?.whatsapp_sent ?? 0 },
                                        { code: 'confirmed', name: 'Confirmed', count: statusCounts?.confirmed ?? 0 },
                                        { code: 'cancelled', name: 'Cancelled', count: statusCounts?.cancelled ?? 0 },
                                    ],
                                },
                            ]}
                            placeholder="Cari status..."
                            className="shrink-0"
                        />
                    </div>
                </div>

                <Table<OrderRow & Record<string, unknown>>
                    columns={[
                        {
                            key: 'code',
                            header: 'Kode',
                            render: (_v, row) => (
                                <Link href={`/orders/${row.code as string}`} className="font-mono text-[12px] font-medium text-[#1a1a1a] hover:text-[#111] underline-offset-4 hover:underline">
                                    {row.code as string}
                                </Link>
                            ),
                        },
                        {
                            key: 'full_name',
                            header: 'Pelanggan',
                            render: (_v, row) => (
                                <div className="min-w-0">
                                    <p className="font-sans text-[13px] font-medium text-[#1a1a1a] truncate">{row.full_name as string}</p>
                                    <p className="font-sans text-[11px] text-[#888] truncate">{row.whatsapp as string} · {row.email as string}</p>
                                </div>
                            ),
                        },
                        {
                            key: 'total',
                            header: 'Total',
                            render: (_v, row) => <span className="font-sans text-[12px] font-medium text-[#1a1a1a]">{formatPrice(row.total as number)}</span>,
                        },
                        {
                            key: 'status',
                            header: 'Status',
                            render: (v) => <Badge className={`text-[9px] uppercase tracking-[0.12em] ${statusBadgeClass(v as string)}`}>{v as string}</Badge>,
                        },
                        { key: 'items_count', header: 'Item', cellClassName: 'font-sans text-[12px] text-[#555]', render: (v) => String(v) },
                        {
                            key: 'created_at',
                            header: 'Tanggal',
                            cellClassName: 'font-sans text-[11px] text-[#888] whitespace-nowrap',
                            render: (v) => (v ? new Date(v as string).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'),
                        },
                        {
                            key: 'actions',
                            header: 'Aksi',
                            headerClassName: 'text-right',
                            cellClassName: 'text-right',
                            render: (_v, row) => (
                                <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => row.status === 'pending' && router.post(`/orders/${row.code as string}/whatsapp`, {}, { preserveScroll: true, headers: { Accept: 'application/json' } })}
                                        disabled={row.status !== 'pending'}
                                        title={row.status === 'pending' ? 'Kirim WA' : 'Sudah dikirim'}
                                        aria-label={`Kirim WA ${row.code as string}`}
                                        className={row.status === 'pending' ? 'text-[#25D366] hover:border-[#25D366]' : 'opacity-40'}
                                    >
                                        <MessageCircle size={14} strokeWidth={1.5} />
                                    </Button>
                                    <ButtonLink href={`/orders/${row.code as string}`} variant="secondary" size="icon" aria-label={`Lihat ${row.code as string}`}>
                                        <Eye size={14} strokeWidth={1.5} />
                                    </ButtonLink>
                                    <Button variant="outline" size="icon" onClick={() => setConfirmCode(row.code as string)} aria-label={`Hapus ${row.code as string}`} className="text-[#888] hover:border-red-400 hover:text-red-500">
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={orders.data as unknown as (OrderRow & Record<string, unknown>)[]}
                    rowKey={(row) => row.code as string}
                    emptyText="Tidak ada pesanan."
                    pagination={{ links: orders.links, current_page: orders.current_page, last_page: orders.last_page }}
                    paginationMetaText={orders.last_page > 1 ? `Hal ${orders.current_page} dari ${orders.last_page} · ${orders.data.length} pesanan` : `${orders.data.length} pesanan · Hal 1 dari 1`}
                    paginationLabel="pesanan"
                />

                <ConfirmDialog
                    open={!!confirmCode}
                    title="Hapus pesanan?"
                    message="Tindakan ini tidak dapat dibatalkan. Item pesanan akan ikut terhapus."
                    confirmText="Hapus"
                    cancelText="Batal"
                    variant="danger"
                    onCancel={() => setConfirmCode(null)}
                    onConfirm={() => confirmCode && router.delete(`/orders/${confirmCode}`, { onSuccess: () => setConfirmCode(null) })}
                />
            </div>
        </AppLayout>
    );
}
