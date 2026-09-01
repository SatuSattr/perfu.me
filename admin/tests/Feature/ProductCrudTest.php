<?php

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('admin can list products', function () {
    $admin = Admin::factory()->create();
    $this->actingAs($admin, 'admin')->get(route('products.index'))->assertOk()->assertInertia(fn ($p) => $p->component('products/index'));
});

test('admin can create product with images and options ordered', function () {
    Storage::fake('public');
    Category::firstOrCreate(['slug' => 'edp'], ['name' => 'EDP', 'position' => 0, 'is_active' => true]);
    ProductType::firstOrCreate(['slug' => 'inspired'], ['name' => 'Inspired', 'position' => 0, 'is_active' => true]);
    $admin = Admin::factory()->create();

    $response = $this->actingAs($admin, 'admin')->post(route('products.store'), [
        'name' => 'Test Parfum',
        'slug' => 'test-parfum',
        'tagline' => 'Tagline',
        'description' => 'Desc',
        'gender' => 'Unisex',
        'category' => 'edp',
        'type' => 'inspired',
        'is_active' => true,
        'images' => [
            ['path' => '/assets/products/dynamyst-transparent.png', 'position' => 0],
            ['path' => '/storage/products/test.jpg', 'position' => 1],
        ],
        'options' => [
            [
                'key' => 'aroma',
                'label' => 'Pilih Aroma',
                'mode' => 'dropdown',
                'required' => true,
                'is_base' => false,
                'position' => 1,
                'choices' => [
                    ['key' => 'creed-aventus', 'name' => 'Creed Aventus', 'price' => 0, 'stock' => 10, 'position' => 0],
                    ['key' => 'dior-sauvage', 'name' => 'Dior Sauvage', 'price' => 5000, 'stock' => 5, 'position' => 1],
                ],
            ],
            [
                'key' => 'ukuran',
                'label' => 'Pilih Ukuran',
                'mode' => 'normal',
                'required' => true,
                'is_base' => true,
                'position' => 0,
                'choices' => [
                    ['key' => '15ml', 'name' => '15ml', 'price' => 20000, 'stock' => 20, 'position' => 0],
                    ['key' => '35ml', 'name' => '35ml', 'price' => 35000, 'stock' => 10, 'position' => 1],
                ],
            ],
        ],
        'reviews' => [
            ['name' => 'Budi', 'rating' => 5, 'date' => '18 Aug 2026', 'message' => 'Mantap'],
        ],
    ]);

    $response->assertRedirect(route('products.index'));
    $product = Product::where('slug', 'test-parfum')->first();
    expect($product)->not->toBeNull();
    expect($product->options()->count())->toBe(2);
    // ordering: ukuran position 0 should be first
    expect($product->options()->orderBy('position')->first()->key)->toBe('ukuran');
    expect($product->options()->orderBy('position')->first()->choices()->orderBy('position')->first()->key)->toBe('15ml');
    expect($product->reviews()->count())->toBe(1);
    expect($product->images()->count())->toBe(2);
});

test('validates required fields', function () {
    $admin = Admin::factory()->create();
    $this->actingAs($admin, 'admin')->post(route('products.store'), [])->assertSessionHasErrors(['name', 'options']);
});

test('admin can update and reorder options', function () {
    Category::firstOrCreate(['slug' => 'edp'], ['name' => 'EDP', 'position' => 0, 'is_active' => true]);
    ProductType::firstOrCreate(['slug' => 'signature'], ['name' => 'Signature', 'position' => 0, 'is_active' => true]);
    $admin = Admin::factory()->create();
    $product = Product::factory()->create(['slug' => 'edit-me', 'name' => 'Edit Me']);
    $this->actingAs($admin, 'admin')
        ->put(route('products.update', $product), [
            'name' => 'Edited Name',
            'slug' => 'edit-me',
            'gender' => 'Pria',
            'category' => 'edp',
            'type' => 'signature',
            'options' => [
                [
                    'key' => 'ukuran',
                    'label' => 'Ukuran',
                    'mode' => 'normal',
                    'required' => true,
                    'is_base' => true,
                    'position' => 0,
                    'choices' => [
                        ['key' => '50ml', 'name' => '50ml', 'price' => 50000, 'stock' => 10, 'position' => 0],
                    ],
                ],
            ],
        ])
        ->assertRedirect(route('products.index'));
    expect(Product::where('slug', 'edit-me')->first()->name)->toBe('Edited Name');
});

test('admin can delete product', function () {
    $admin = Admin::factory()->create();
    $product = Product::factory()->create();
    $this->actingAs($admin, 'admin')->delete(route('products.destroy', $product))->assertRedirect(route('products.index'));
    expect(Product::find($product->id))->toBeNull();
});
