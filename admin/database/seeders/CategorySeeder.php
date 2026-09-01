<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['slug' => 'edp', 'name' => 'EDP', 'description' => 'Eau de Parfum', 'position' => 0, 'is_active' => true],
        ];
        foreach ($items as $data) {
            Category::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
