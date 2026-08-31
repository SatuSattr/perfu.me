<?php

namespace Database\Seeders;

use App\Enums\ProductCategory;
use App\Enums\ProductGender;
use App\Enums\ProductOptionMode;
use App\Enums\ProductType;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        // Clean slate — mirrors store/src/data/products.js as source of truth
        \DB::table('product_reviews')->delete();
        \DB::table('product_option_choices')->delete();
        \DB::table('product_options')->delete();
        \DB::table('product_images')->delete();
        \DB::table('products')->delete();

        Schema::enableForeignKeyConstraints();

        $products = $this->productsData();

        foreach ($products as $data) {
            $product = Product::create([
                'id' => $data['id'],
                'slug' => $data['slug'],
                'name' => $data['name'],
                'tagline' => $data['tagline'],
                'description' => $data['description'],
                'gender' => ProductGender::from($data['gender']),
                'price' => $data['price'],
                'stock' => $data['stock'],
                'category' => ProductCategory::from($data['category']),
                'type' => ProductType::from($data['type']),
                'image' => $data['image'],
                'detail_image' => $data['detailImage'] ?? null,
                'size_label' => $data['sizeLabel'],
                'is_active' => true,
            ]);

            foreach ($data['images'] as $index => $path) {
                $product->images()->create([
                    'path' => $path,
                    'position' => $index,
                ]);
            }

            foreach ($data['options'] as $option) {
                $productOption = $product->options()->create([
                    'key' => $option['id'],
                    'label' => $option['label'],
                    'mode' => ProductOptionMode::from($option['mode']),
                    'is_required' => $option['required'],
                    'position' => $option['position'],
                ]);

                foreach ($option['choices'] as $choiceIndex => $choice) {
                    $productOption->choices()->create([
                        'key' => $choice['id'],
                        'name' => $choice['name'],
                        'price' => $choice['price'],
                        'stock' => $choice['stock'],
                        'position' => $choiceIndex,
                        'is_active' => true,
                    ]);
                }
            }

            foreach ($data['reviews'] as $review) {
                $product->reviews()->create([
                    'name' => $review['name'],
                    'rating' => $review['rating'],
                    'reviewed_at' => $this->parseDate($review['date']),
                    'message' => $review['message'],
                    'is_visible' => true,
                ]);
            }
        }
    }

    private function parseDate(string $value): ?string
    {
        // store/src/data/products.js:27 — "18 Aug 2026" → unix timestamp as string (midnight UTC)
        $parsed = Carbon::createFromFormat('!d M Y', $value, 'UTC');

        return $parsed ? (string) $parsed->timestamp : null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function productsData(): array
    {
        // Exact mirror of store/src/data/products.js — do not diverge
        return [
            [
                'id' => 1,
                'slug' => 'dynamyst',
                'name' => 'Dynamyst',
                'tagline' => 'Fresh. Bold. Confident.',
                'description' => 'Aroma fresh, sporty, dan clean dengan sentuhan hangat yang memberikan kesan maskulin, energik, dan percaya diri. Cocok digunakan untuk aktivitas sehari-hari.',
                'gender' => 'Pria',
                'price' => 45000,
                'stock' => 30,
                'category' => 'EDP',
                'type' => 'signature',
                'image' => '/assets/products/dynamyst-transparent.png',
                'detailImage' => '/assets/products/dynamyst-detail.png',
                'images' => [
                    '/assets/products/dynamyst-transparent.png',
                    '/assets/products/dynamyst-detail.png',
                ],
                'sizeLabel' => null,
                'options' => [],
                'reviews' => [
                    ['name' => 'Rafi A.', 'rating' => 5, 'date' => '18 Aug 2026', 'message' => 'Aromanya fresh banget, tahan lama juga. Udah beli 3 kali!'],
                    ['name' => 'Budi S.', 'rating' => 4, 'date' => '10 Aug 2026', 'message' => 'Packaging rapi, aroma sesuai deskripsi. Akan repeat order.'],
                    ['name' => 'Arif W.', 'rating' => 5, 'date' => '08 Aug 2026', 'message' => 'Sudah coba banyak parfum lokal, ini yang paling nempel di kulit. Recommended!'],
                    ['name' => 'Fajar N.', 'rating' => 4, 'date' => '01 Aug 2026', 'message' => 'Fresh tapi ada sentuhan woody yang bikin makin keren. Suka!'],
                    ['name' => 'Bagas P.', 'rating' => 5, 'date' => '31 Jul 2026', 'message' => 'Cocok banget buat sehari-hari. Banyak yang nanya pakai parfum apa.'],
                ],
            ],
            [
                'id' => 2,
                'slug' => 'vannessence',
                'name' => 'Vannessence',
                'tagline' => 'Soft. Warm. Timeless.',
                'description' => 'Aroma vanilla yang lembut, creamy, dan elegan dengan nuansa hangat yang menenangkan. Cocok untuk penggunaan sehari-hari maupun momen spesial.',
                'gender' => 'Wanita',
                'price' => 45000,
                'stock' => 25,
                'category' => 'EDP',
                'type' => 'signature',
                'image' => '/assets/products/vennesence-transparent.png',
                'detailImage' => '/assets/products/vennesence-detail.png',
                'images' => [
                    '/assets/products/vennesence-transparent.png',
                    '/assets/products/vennesence-detail.png',
                ],
                'sizeLabel' => null,
                'options' => [],
                'reviews' => [
                    ['name' => 'Dewi L.', 'rating' => 4, 'date' => '19 Aug 2026', 'message' => 'Soft dan menenangkan, cocok banget dipakai malam hari.'],
                    ['name' => 'Ayu R.', 'rating' => 5, 'date' => '06 Aug 2026', 'message' => 'Tahan lebih dari 8 jam di kulit saya. Luar biasa buat harga segini.'],
                    ['name' => 'Rizka A.', 'rating' => 5, 'date' => '04 Aug 2026', 'message' => 'Creamy vanilla yang bikin nagih. Temen-temen langsung tanya ini parfum apa.'],
                    ['name' => 'Cindy H.', 'rating' => 5, 'date' => '21 Jul 2026', 'message' => 'Beli karena rekomendasi teman, nggak nyesel sama sekali. Wanginya feminin dan elegan.'],
                ],
            ],
            [
                'id' => 3,
                'slug' => 'inspired-scent',
                'name' => 'Inspired Scent',
                'tagline' => 'Wangi kelas dunia, harga terjangkau.',
                'description' => 'Lebih dari 40 pilihan aroma terinspirasi dari parfum-parfum mewah kelas dunia. Karakter yang sama, harga yang jauh lebih bersahabat.',
                'gender' => 'Unisex',
                'price' => 20000,
                'stock' => null,
                'category' => 'EDP',
                'type' => 'inspired',
                'image' => '/assets/products/refill-transparent.png',
                'detailImage' => null,
                'images' => ['/assets/products/refill-transparent.png'],
                'sizeLabel' => '15ml, 35ml, 50ml',
                'options' => [
                    [
                        'id' => 'aroma',
                        'name' => 'aroma',
                        'label' => 'Pilih Aroma',
                        'mode' => 'dropdown',
                        'required' => true,
                        'position' => 0,
                        'choices' => [
                            ['id' => 'creed-aventus', 'name' => 'Creed Aventus', 'price' => null, 'stock' => 18],
                            ['id' => 'baccarat-rouge-540', 'name' => 'Baccarat Rouge 540', 'price' => null, 'stock' => 12],
                            ['id' => 'ysl-black-opium', 'name' => 'YSL Black Opium', 'price' => null, 'stock' => 20],
                            ['id' => 'dior-sauvage', 'name' => 'Dior Sauvage', 'price' => null, 'stock' => 25],
                            ['id' => 'versace-eros', 'name' => 'Versace Eros', 'price' => null, 'stock' => 15],
                            ['id' => 'miss-dior-blooming', 'name' => 'Miss Dior Blooming Bouquet', 'price' => null, 'stock' => 0],
                            ['id' => 'chanel-chance', 'name' => 'Chanel Chance', 'price' => null, 'stock' => 10],
                            ['id' => 'tom-ford-black-orchid', 'name' => 'Tom Ford Black Orchid', 'price' => null, 'stock' => 8],
                            ['id' => 'armani-acqua-di-gio', 'name' => 'Armani Acqua di Gio', 'price' => null, 'stock' => 22],
                            ['id' => 'jo-malone-peony-blush', 'name' => 'Jo Malone Peony & Blush Suede', 'price' => null, 'stock' => 6],
                        ],
                    ],
                    [
                        'id' => 'ukuran',
                        'name' => 'ukuran',
                        'label' => 'Pilih Ukuran',
                        'mode' => 'normal',
                        'required' => true,
                        'position' => 1,
                        'choices' => [
                            ['id' => '15ml', 'name' => '15ml', 'price' => 20000, 'stock' => 50],
                            ['id' => '35ml', 'name' => '35ml', 'price' => 35000, 'stock' => 30],
                            ['id' => '50ml', 'name' => '50ml', 'price' => 50000, 'stock' => 15],
                        ],
                    ],
                ],
                'reviews' => [
                    ['name' => 'Tono P.', 'rating' => 5, 'date' => '26 Aug 2026', 'message' => 'Ambil varian Creed Aventus, persis banget baunya. Highly recommended!'],
                    ['name' => 'Andi S.', 'rating' => 5, 'date' => '12 Aug 2026', 'message' => 'Mirip banget sama yang ori! Harga terjangkau kualitas oke.'],
                    ['name' => 'Fitri D.', 'rating' => 4, 'date' => '26 Jul 2026', 'message' => 'Packaging bagus, aroma akurat. Pengiriman cepat juga.'],
                ],
            ],
        ];
    }
}
