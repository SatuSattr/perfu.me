import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/app-layout';
import { ProductForm } from '@/components/product/product-form';

interface Enums {
    genders: string[];
    types: string[];
    categories: string[];
    optionModes: string[];
}

interface ProductPayload {
    id: number;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    gender: string;
    price: number;
    stock: number | null;
    category: string;
    type: string;
    image: string | null;
    detailImage: string | null;
    images: string[];
    sizeLabel: string | null;
    is_active: boolean;
    options: {
        id: string;
        name: string;
        label: string;
        mode: 'dropdown' | 'normal';
        required: boolean;
        position: number;
        choices: { id: string; name: string; price: number | null; stock: number }[];
    }[];
    reviews: { name: string; rating: number; date: string; message: string }[];
}

interface Props {
    product: ProductPayload;
    enums: Enums;
}

export default function Edit({ product, enums }: Props) {
    return (
        <AppLayout>
            <Head title={`Edit ${product.name} — Perfu.me Admin`} />
            <ProductForm initialData={product} enums={enums} isEdit />
        </AppLayout>
    );
}
