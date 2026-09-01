import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { ProductForm } from '@/components/product/product-form';

interface Enums {
    genders: string[];
    types: string[];
    categories: string[];
    optionModes: string[];
}

interface Props {
    enums: Enums;
    featuredCount: number;
}

export default function Create({ enums, featuredCount }: Props) {
    return (
        <AppLayout>
            <Head title="Tambah Produk — Perfu.me Admin" />
            <ProductForm enums={enums} featuredCount={featuredCount} />
        </AppLayout>
    );
}
