<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ProductGender;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductType;
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
            'type' => ['nullable', 'string', 'exists:product_types,slug'],
            'gender' => ['nullable', 'string', 'in:Pria,Wanita,Unisex'],
            'category' => ['nullable', 'string', 'exists:categories,slug'],
            'featured' => ['nullable', 'boolean'],
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
            if (ProductType::where('slug', $type)->exists()) {
                $query->where('type', $type);
            }
        }

        if ($gender = $request->string('gender')->toString()) {
            if (in_array($gender, ProductGender::values(), true)) {
                $query->where('gender', $gender);
            }
        }

        if ($category = $request->string('category')->toString()) {
            if (Category::where('slug', $category)->exists()) {
                $query->where('category', $category);
            }
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $sort = $request->string('sort')->toString() ?: 'latest';
        if ($sort === 'price_asc' || $sort === 'price_desc') {
            $query->withMin('baseChoices as base_min_price', 'price');
            $query->orderBy('base_min_price', $sort === 'price_asc' ? 'asc' : 'desc');
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
            ->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400')
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('Vary', 'Origin, Accept');
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
            ->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400')
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('Vary', 'Origin, Accept');
    }
}
