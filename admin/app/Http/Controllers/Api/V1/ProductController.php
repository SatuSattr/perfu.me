<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductCategory;
use App\Enums\ProductGender;
use App\Enums\ProductType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     *
     * Public, throttled, CORS-enabled. No auth.
     * Returns only is_active = true products in store shape.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string', 'in:signature,inspired'],
            'gender' => ['nullable', 'string', 'in:Pria,Wanita,Unisex'],
            'category' => ['nullable', 'string', 'in:EDP'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'sort' => ['nullable', 'string', 'in:latest,price_asc,price_desc,name_asc'],
        ]);

        $query = Product::query()
            ->active()
            ->with(['images', 'options.choices', 'visibleReviews']);

        if ($q = $request->string('q')->toString()) {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhere('tagline', 'like', "%{$q}%");
            });
        }

        if ($type = $request->string('type')->toString()) {
            if (in_array($type, ProductType::values(), true)) {
                $query->where('type', $type);
            }
        }

        if ($gender = $request->string('gender')->toString()) {
            if (in_array($gender, ProductGender::values(), true)) {
                $query->where('gender', $gender);
            }
        }

        if ($category = $request->string('category')->toString()) {
            if (in_array($category, ProductCategory::values(), true)) {
                $query->where('category', $category);
            }
        }

        $sort = $request->string('sort')->toString() ?: 'latest';
        if ($sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('name', 'asc');
        } else {
            $query->orderByDesc('updated_at')->orderByDesc('created_at');
        }

        $perPage = (int) ($request->integer('per_page') ?: 12);
        $perPage = max(1, min($perPage, 50));

        $paginated = $query->paginate($perPage)->withQueryString();

        // Transform to store payload (id, slug, name, tagline, description, gender, price, stock, category, type, image, detailImage, images, sizeLabel, options, reviews)
        $paginated->getCollection()->transform(fn (Product $p) => $p->toStorePayload());

        return response()->json($paginated)
            ->header('Cache-Control', 'public, max-age=60, s-maxage=60')
            ->header('X-Content-Type-Options', 'nosniff');
    }

    /**
     * GET /api/v1/products/{slug}
     *
     * Public, throttled. Returns single active product or 404.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->active()
            ->with(['images', 'options.choices', 'visibleReviews'])
            ->first();

        if (! $product) {
            return response()->json([
                'message' => 'Produk tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'data' => $product->toStorePayload(),
        ])
            ->header('Cache-Control', 'public, max-age=60, s-maxage=60')
            ->header('X-Content-Type-Options', 'nosniff');
    }
}
