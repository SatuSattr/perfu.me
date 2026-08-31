import { Head, usePage } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import type { SharedProps } from '@/types/auth';

interface Props {
    admin?: { name: string; email: string } | null;
}

export default function Dashboard({ admin: propAdmin }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const admin = propAdmin ?? auth.admin ?? null;

    return (
        <AppLayout>
            <Head title="Dashboard — Perfu.me Admin" />
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#aaa]">Dashboard</span>
            <h1 className="font-sans text-[28px] font-semibold text-[#1a1a1a] tracking-tight mt-2">Selamat datang, {admin?.name ?? 'Admin'}</h1>
            <p className="font-sans text-[12.5px] text-[#666] mt-2">Kelola produk, pesanan, dan stok dari sini.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                <div className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
                    <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">Produk</p>
                    <p className="font-sans text-[22px] font-semibold text-[#1a1a1a] mt-1">—</p>
                </div>
                <div className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
                    <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">Pesanan</p>
                    <p className="font-sans text-[22px] font-semibold text-[#1a1a1a] mt-1">—</p>
                </div>
                <div className="bg-white border border-[#e6e6e6] rounded-2xl p-6">
                    <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">Admin</p>
                    <p className="font-sans text-[22px] font-semibold text-[#1a1a1a] mt-1">{admin?.name ?? '—'}</p>
                </div>
            </div>
        </AppLayout>
    );
}
