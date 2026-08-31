<?php

namespace App\Http\Controllers;

use App\Enums\ProductCategory;
use App\Enums\ProductGender;
use App\Enums\ProductOptionMode;
use App\Enums\ProductType;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->with(['images', 'options.choices', 'reviews']);

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

        $products = $query->orderByDesc('updated_at')->paginate(12)->withQueryString();

        $products->through(fn (Product $p) => [
            'id' => $p->id,
            'slug' => $p->slug,
            'name' => $p->name,
            'tagline' => $p->tagline,
            'gender' => $p->gender->value,
            'type' => $p->type->value,
            'category' => $p->category->value,
            'price' => $p->price,
            'stock' => $p->stock,
            'is_active' => $p->is_active,
            'image' => $p->image,
            'totalStock' => $p->totalStock(),
            'priceRange' => $p->priceRange(),
            'updated_at' => $p->updated_at?->toISOString(),
        ]);

        $typeCounts = Product::query()->selectRaw('type, COUNT(*) as c')->groupBy('type')->pluck('c', 'type')->toArray();
        $genderCounts = Product::query()->selectRaw('gender, COUNT(*) as c')->groupBy('gender')->pluck('c', 'gender')->toArray();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'type' => $request->string('type')->toString(),
                'gender' => $request->string('gender')->toString(),
            ],
            'filterCounts' => [
                'type' => $typeCounts,
                'gender' => $genderCounts,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/create', [
            'enums' => $this->enums(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request) {
            $product = $this->createProduct($data, $request);
            $this->syncImages($product, $data['images'] ?? [], $request);
            $this->syncOptions($product, $data['options'] ?? []);
            if (array_key_exists('reviews', $data)) {
                $this->syncReviews($product, $data['reviews'] ?? []);
            }
        });

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['images', 'options.choices', 'reviews']);

        return Inertia::render('products/edit', [
            'product' => $product->toStorePayload() + [
                'is_active' => $product->is_active,
                'created_at' => $product->created_at?->toISOString(),
                'updated_at' => $product->updated_at?->toISOString(),
            ],
            'enums' => $this->enums(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($product, $data, $request) {
            $this->updateProduct($product, $data);
            $this->syncImages($product, $data['images'] ?? [], $request);
            $this->syncOptions($product, $data['options'] ?? []);
            if (array_key_exists('reviews', $data)) {
                $this->syncReviews($product, $data['reviews'] ?? []);
            }
        });

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk dihapus.');
    }

    public function reviewsPage(Request $request, Product $product, ?ProductReview $review = null): Response
    {
        // Resolve deep-link sidebar state from URL: /reviews/create or /reviews/{id}/edit
        $initialReviewId = null;
        $initialIsCreate = false;
        $path = $request->path();
        if (str_ends_with($path, '/reviews/create')) {
            $initialIsCreate = true;
        } elseif ($review && $review->exists && $review->product_id === $product->id) {
            $initialReviewId = $review->id;
        }

        $query = $product->reviews();

        if ($q = $request->string('q')->toString()) {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")->orWhere('message', 'like', "%{$q}%");
            });
        }

        $starsParam = $request->string('stars')->toString();
        if ($starsParam !== '') {
            $starList = collect(explode(',', $starsParam))
                ->map(fn ($s) => (int) trim($s))
                ->filter(fn ($n) => $n >= 1 && $n <= 5)
                ->unique()
                ->values();
            if ($starList->isNotEmpty()) {
                if ($starList->count() === 1) {
                    $query->where('rating', $starList->first());
                } else {
                    $query->whereIn('rating', $starList->all());
                }
            }
        }

        $sort = $request->string('sort')->toString();
        $query->reorder();
        if ($sort === 'oldest') {
            $query->orderBy('reviewed_at', 'asc')->orderBy('created_at', 'asc');
        } else {
            $query->orderByDesc('reviewed_at')->orderByDesc('created_at');
        }

        $perPage = (int) $request->integer('per_page', 5);
        $perPage = max(1, min($perPage, 20));

        $paginated = $query->paginate($perPage)->withQueryString();
        $paginated->through(fn (ProductReview $r) => [
            'id' => $r->id,
            'name' => $r->name,
            'rating' => $r->rating,
            'date' => $r->formattedDate() ?? $r->created_at?->format('d M Y'),
            'timestamp' => $r->reviewed_at,
            'message' => $r->message,
            'is_visible' => $r->is_visible,
        ]);

        $counts = $product->reviews()->selectRaw('rating, COUNT(*) as c')->groupBy('rating')->pluck('c', 'rating')->toArray();

        return Inertia::render('products/reviews', [
            'product' => [
                'id' => $product->id,
                'slug' => $product->slug,
                'name' => $product->name,
                'image' => $product->image,
            ],
            'reviews' => $paginated,
            'counts' => $counts,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'stars' => $request->string('stars')->toString(),
                'sort' => $sort ?: 'latest',
                'per_page' => $perPage,
            ],
            'initialEditingReviewId' => $initialReviewId,
            'initialIsCreate' => $initialIsCreate,
        ]);
    }

    public function reviews(Request $request, Product $product): JsonResponse
    {
        $query = $product->reviews();

        if ($q = $request->string('q')->toString()) {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")->orWhere('message', 'like', "%{$q}%");
            });
        }

        $starsParam = $request->string('stars')->toString();
        if ($starsParam !== '') {
            $starList = collect(explode(',', $starsParam))
                ->map(fn ($s) => (int) trim($s))
                ->filter(fn ($n) => $n >= 1 && $n <= 5)
                ->unique()
                ->values();
            if ($starList->isNotEmpty()) {
                if ($starList->count() === 1) {
                    $query->where('rating', $starList->first());
                } else {
                    $query->whereIn('rating', $starList->all());
                }
            }
        }

        $sort = $request->string('sort')->toString();
        $query->reorder();
        if ($sort === 'oldest') {
            $query->orderBy('reviewed_at', 'asc')->orderBy('created_at', 'asc');
        } else {
            $query->orderByDesc('reviewed_at')->orderByDesc('created_at');
        }

        $perPage = (int) $request->integer('per_page', 5);
        $perPage = max(1, min($perPage, 20));

        $paginated = $query->paginate($perPage)->withQueryString();
        $paginated->through(fn ($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'rating' => $r->rating,
            'date' => $r->formattedDate() ?? $r->created_at?->format('d M Y'),
            'timestamp' => $r->reviewed_at,
            'message' => $r->message,
            'is_visible' => $r->is_visible,
        ]);

        $counts = $product->reviews()->selectRaw('rating, COUNT(*) as c')->groupBy('rating')->pluck('c', 'rating')->toArray();
        $payload = $paginated->toArray();
        $payload['counts'] = $counts;

        return response()->json($payload);
    }

    public function updateReview(Request $request, Product $product, ProductReview $review): JsonResponse|RedirectResponse
    {
        if ($review->product_id !== $product->id) {
            abort(404);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'date' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string'],
            'is_visible' => ['sometimes', 'boolean'],
        ]);

        $timestamp = $this->parseReviewDate($data['date'] ?? null);

        $review->update([
            'name' => $data['name'],
            'rating' => (int) $data['rating'],
            'reviewed_at' => $timestamp,
            'message' => $data['message'],
            'is_visible' => (bool) ($data['is_visible'] ?? $review->is_visible),
        ]);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'id' => $review->id,
                'name' => $review->name,
                'rating' => $review->rating,
                'date' => $review->formattedDate() ?? $review->created_at?->format('d M Y'),
                'timestamp' => $review->reviewed_at,
                'message' => $review->message,
                'is_visible' => $review->is_visible,
            ]);
        }

        return redirect()->back()->with('success', 'Ulasan diperbarui.');
    }

    public function storeReview(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'date' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string'],
            'is_visible' => ['sometimes', 'boolean'],
        ]);

        $timestamp = $this->parseReviewDate($data['date'] ?? null);

        $review = $product->reviews()->create([
            'name' => $data['name'],
            'rating' => (int) $data['rating'],
            'reviewed_at' => $timestamp,
            'message' => $data['message'],
            'is_visible' => (bool) ($data['is_visible'] ?? true),
        ]);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'id' => $review->id,
                'name' => $review->name,
                'rating' => $review->rating,
                'date' => $review->formattedDate() ?? $review->created_at?->format('d M Y'),
                'timestamp' => $review->reviewed_at,
                'message' => $review->message,
                'is_visible' => $review->is_visible,
            ], 201);
        }

        return redirect()->back()->with('success', 'Ulasan baru ditambahkan.');
    }

    public function destroyReviews(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:50'],
            'ids.*' => ['integer', 'exists:product_reviews,id'],
        ]);

        $ids = $data['ids'];

        // Scope to product to prevent cross-product deletion
        ProductReview::whereIn('id', $ids)->where('product_id', $product->id)->delete();

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['deleted' => $ids]);
        }

        return redirect()->back()->with('success', count($ids).' ulasan dihapus.');
    }

    private function parseReviewDate(mixed $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        if (ctype_digit((string) $date)) {
            return (string) $date;
        }

        $parsed = Carbon::createFromFormat('!d M Y', (string) $date, 'UTC');
        if ($parsed) {
            return (string) $parsed->timestamp;
        }

        try {
            $parsed = Carbon::parse((string) $date, 'UTC');

            return (string) $parsed->timestamp;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function enums(): array
    {
        return [
            'genders' => ProductGender::values(),
            'types' => ProductType::values(),
            'categories' => ProductCategory::values(),
            'optionModes' => ProductOptionMode::values(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createProduct(array $data, Request $request): Product
    {
        $slug = $data['slug'] ?? null;
        if (empty($slug)) {
            $slug = Str::slug($data['name']);
            $original = $slug;
            $i = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $original.'-'.$i++;
            }
        }

        return Product::create([
            'slug' => $slug,
            'name' => $data['name'],
            'tagline' => $data['tagline'] ?? null,
            'description' => $data['description'] ?? null,
            'gender' => $data['gender'],
            'price' => $data['price'],
            'stock' => $data['stock'] ?? null,
            'category' => $data['category'],
            'type' => $data['type'],
            'size_label' => $data['size_label'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function updateProduct(Product $product, array $data): void
    {
        $slug = $data['slug'] ?? $product->slug;
        if (empty($slug)) {
            $slug = Str::slug($data['name']);
        }

        $product->update([
            'slug' => $slug,
            'name' => $data['name'],
            'tagline' => $data['tagline'] ?? null,
            'description' => $data['description'] ?? null,
            'gender' => $data['gender'],
            'price' => $data['price'],
            'stock' => $data['stock'] ?? null,
            'category' => $data['category'],
            'type' => $data['type'],
            'size_label' => $data['size_label'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $images
     */
    private function syncImages(Product $product, array $images, Request $request): void
    {
        $product->images()->delete();

        $paths = [];
        foreach ($images as $index => $img) {
            $position = isset($img['position']) ? (int) $img['position'] : $index;
            $path = $img['path'] ?? null;

            $fileKey = "images.{$index}.file";
            if ($request->hasFile($fileKey)) {
                $file = $request->file($fileKey);
                $stored = $file->store('products', 'public');
                $path = '/storage/'.$stored;
            }

            if (empty($path)) {
                continue;
            }

            $paths[] = $path;
            $product->images()->create([
                'path' => $path,
                'position' => $position,
            ]);
        }

        $product->update([
            'image' => $paths[0] ?? null,
            'detail_image' => $paths[1] ?? null,
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $options
     */
    private function syncOptions(Product $product, array $options): void
    {
        $product->options()->delete();

        foreach ($options as $optIndex => $opt) {
            $position = isset($opt['position']) ? (int) $opt['position'] : $optIndex;
            $isRequired = $opt['is_required'] ?? $opt['required'] ?? true;

            $option = $product->options()->create([
                'key' => $opt['key'],
                'label' => $opt['label'],
                'mode' => $opt['mode'],
                'is_required' => (bool) $isRequired,
                'position' => $position,
            ]);

            foreach ($opt['choices'] ?? [] as $choiceIndex => $choice) {
                $option->choices()->create([
                    'key' => $choice['key'],
                    'name' => $choice['name'],
                    'price' => $choice['price'] ?? null,
                    'stock' => (int) $choice['stock'],
                    'position' => isset($choice['position']) ? (int) $choice['position'] : $choiceIndex,
                    'is_active' => true,
                ]);
            }
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $reviews
     */
    private function syncReviews(Product $product, array $reviews): void
    {
        $product->reviews()->delete();

        foreach ($reviews as $rev) {
            $timestamp = $this->parseReviewDate($rev['date'] ?? null);

            $product->reviews()->create([
                'name' => $rev['name'],
                'rating' => (int) $rev['rating'],
                'reviewed_at' => $timestamp,
                'message' => $rev['message'],
                'is_visible' => (bool) ($rev['is_visible'] ?? true),
            ]);
        }
    }
}
