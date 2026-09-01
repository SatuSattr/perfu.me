<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\StoreProductTypeRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Requests\UpdateProductTypeRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function indexPage(Request $request, ?Category $category = null, ?ProductType $productType = null): Response
    {
        $initialTable = null;
        $initialEditingId = null;
        $initialEditingSlug = null;
        $initialIsCreate = false;
        $initialType = 'category'; // 'category' | 'type'
        $path = $request->path();

        if (str_ends_with($path, 'categories/create')) {
            $initialIsCreate = true;
            $initialType = 'category';
            $initialTable = 'category';
        } elseif (str_ends_with($path, 'categories/types/create')) {
            $initialIsCreate = true;
            $initialType = 'type';
            $initialTable = 'type';
        } elseif ($category && $category->exists && $request->route('category')) {
            $initialTable = 'category';
            $initialType = 'category';
            $initialEditingId = $category->id;
            $initialEditingSlug = $category->slug;
        } elseif ($productType && $productType->exists && ($request->route('productType') || $request->route('product_type'))) {
            $initialTable = 'type';
            $initialType = 'type';
            $initialEditingId = $productType->id;
            $initialEditingSlug = $productType->slug;
        }

        $categories = Category::query()
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'slug' => $c->slug,
                'name' => $c->name,
                'description' => $c->description,
                'position' => $c->position,
                'is_active' => $c->is_active,
                'products_count' => $c->products_count,
                'created_at' => $c->created_at?->toISOString(),
            ]);

        $types = ProductType::query()
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn (ProductType $t) => [
                'id' => $t->id,
                'slug' => $t->slug,
                'name' => $t->name,
                'description' => $t->description,
                'position' => $t->position,
                'is_active' => $t->is_active,
                'products_count' => $t->products_count,
                'created_at' => $t->created_at?->toISOString(),
            ]);

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'types' => $types,
            'initialTable' => $initialTable,
            'initialEditingId' => $initialEditingId,
            'initialEditingSlug' => $initialEditingSlug,
            'initialIsCreate' => $initialIsCreate,
            'initialType' => $initialType,
        ]);
    }

    // ── Category CRUD ──────────────────────────

    public function storeCategory(StoreCategoryRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $category = Category::create($data);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($category, 201);
        }

        return redirect()->route('categories.index')->with('success', 'Kategori ditambahkan.');
    }

    public function updateCategory(UpdateCategoryRequest $request, Category $category): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        if (array_key_exists('slug', $data) && empty($data['slug']) && ! empty($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $category->update($data);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($category);
        }

        return redirect()->route('categories.index')->with('success', 'Kategori diperbarui.');
    }

    public function destroyCategory(Request $request, Category $category): RedirectResponse|JsonResponse
    {
        if (Product::where('category', $category->slug)->exists()) {
            $message = 'Kategori masih dipakai produk, tidak bisa dihapus.';

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['message' => $message], 422);
            }

            return redirect()->back()->withErrors(['category' => $message]);
        }

        $category->delete();

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect()->route('categories.index')->with('success', 'Kategori dihapus.');
    }

    // ── ProductType CRUD ───────────────────────

    public function storeType(StoreProductTypeRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $type = ProductType::create($data);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($type, 201);
        }

        return redirect()->route('categories.index')->with('success', 'Tipe ditambahkan.');
    }

    public function updateType(UpdateProductTypeRequest $request, ProductType $productType): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        if (array_key_exists('slug', $data) && empty($data['slug']) && ! empty($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $productType->update($data);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($productType);
        }

        return redirect()->route('categories.index')->with('success', 'Tipe diperbarui.');
    }

    public function destroyType(Request $request, ProductType $productType): RedirectResponse|JsonResponse
    {
        if (Product::where('type', $productType->slug)->exists()) {
            $message = 'Tipe masih dipakai produk, tidak bisa dihapus.';

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['message' => $message], 422);
            }

            return redirect()->back()->withErrors(['type' => $message]);
        }

        $productType->delete();

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect()->route('categories.index')->with('success', 'Tipe dihapus.');
    }
}
