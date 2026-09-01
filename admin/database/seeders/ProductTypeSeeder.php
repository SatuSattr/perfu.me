<?php

namespace Database\Seeders;

use App\Models\ProductType;
use Illuminate\Database\Seeder;

class ProductTypeSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['slug' => 'signature', 'name' => 'Signature', 'description' => 'Parfum signature house', 'position' => 0, 'is_active' => true],
            ['slug' => 'inspired', 'name' => 'Inspired', 'description' => 'Terinspirasi parfum dunia', 'position' => 1, 'is_active' => true],
        ];
        foreach ($items as $data) {
            ProductType::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
