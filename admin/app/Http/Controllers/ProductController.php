<?php

namespace App\Http\Controllers;

use App\Enums\ProductGender;
use App\Enums\ProductOptionMode;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductBasicRequest;
use App\Http\Requests\UpdateProductMediaRequest;
use App\Http\Requests\UpdateProductOptionsRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductType;
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

        $products = $query->orderByDesc('updated_at')->paginate(12)->withQueryString();

        $products->through(fn (Product $p) => [
            'id' => $p->id,
            'slug' => $p->slug,
            'name' => $p->name,
            'tagline' => $p->tagline,
            'gender' => $p->gender->value,
            'type' => $p->type,
            'category' => $p->category,
            'price' => $p->lowestPrice(),
            'stock' => null,
            'is_active' => $p->is_active,
            'image' => $p->image,
            'totalStock' => $p->totalStock(),
            'priceRange' => $p->priceRange(),
            'updated_at' => $p->updated_at?->toISOString(),
        ]);

        $typeCounts = Product::query()->selectRaw('type, COUNT(*) as c')->groupBy('type')->pluck('c', 'type')->toArray();
        $genderCounts = Product::query()->selectRaw('gender, COUNT(*) as c')->groupBy('gender')->pluck('c', 'gender')->toArray();
        $categoryCounts = Product::query()->selectRaw('category, COUNT(*) as c')->groupBy('category')->pluck('c', 'category')->toArray();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'type' => $request->string('type')->toString(),
                'gender' => $request->string('gender')->toString(),
                'category' => $request->string('category')->toString(),
            ],
            'filterCounts' => [
                'type' => $typeCounts,
                'gender' => $genderCounts,
                'category' => $categoryCounts,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/create', [
            'enums' => $this->enums(),
            'featuredCount' => Product::where('is_featured', true)->count(),
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
            'featuredCount' => Product::where('is_featured', true)->count(),
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

    public function updateBasic(UpdateProductBasicRequest $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && empty($data['slug']) && ! empty($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (! empty($data)) {
            $product->update($data);
        }

        $product->refresh()->load(['images', 'options.choices']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'slug' => $product->slug,
                'product' => $product->toStorePayload() + [
                    'is_active' => $product->is_active,
                    'created_at' => $product->created_at?->toISOString(),
                    'updated_at' => $product->updated_at?->toISOString(),
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Info dasar disimpan.');
    }

    public function updateMedia(UpdateProductMediaRequest $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($product, $data, $request) {
            $this->syncImages($product, $data['images'] ?? [], $request);
        });

        $product->refresh()->load(['images']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'images' => $product->images->pluck('path')->all(),
                'media' => $product->images->map(fn ($img) => ['path' => $img->path, 'type' => $img->type ?? 'image'])->all(),
                'image' => $product->image,
                'detail_image' => $product->detail_image,
            ]);
        }

        return redirect()->back()->with('success', 'Media disimpan.');
    }

    public function uploadMedia(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400', 'mimes:jpeg,jpg,png,webp,mp4,webm,mov,quicktime'],
            'position' => ['nullable', 'integer', 'min:0', 'max:6'],
        ]);

        if ($product->images()->count() >= 6) {
            return response()->json(['message' => 'Maksimal 6 media sudah tercapai.'], 422);
        }

        $file = $request->file('file');
        $mime = $file->getMimeType();
        $isVideo = str_starts_with($mime ?? '', 'video/');
        $max = $isVideo ? 100 * 1024 * 1024 : 2 * 1024 * 1024;
        if ($file->getSize() > $max) {
            return response()->json(['message' => $isVideo ? 'Maksimal 100MB per video.' : 'Maksimal 2MB per foto.'], 422);
        }

        $stored = $file->store('products', 'public');
        $path = '/storage/'.$stored;
        $type = $isVideo ? 'video' : 'image';

        $position = $request->has('position') ? (int) $request->input('position') : (int) ($product->images()->max('position') + 1);
        // shift existing if position collides
        $product->images()->where('position', '>=', $position)->increment('position');

        $image = $product->images()->create([
            'path' => $path,
            'type' => $type,
            'mime' => $mime,
            'position' => $position,
        ]);

        // recompute card images
        $imageCandidates = $product->images()->where('type', '!=', 'video')->orderBy('position')->pluck('path')->all();
        $paths = $product->images()->orderBy('position')->pluck('path')->all();
        $product->update([
            'image' => $imageCandidates[0] ?? $paths[0] ?? null,
            'detail_image' => $imageCandidates[1] ?? $paths[1] ?? null,
        ]);

        $product->refresh()->load(['images']);

        return response()->json([
            'media' => $product->images->sortBy('position')->map(fn ($img) => ['id' => $img->id, 'path' => $img->path, 'type' => $img->type ?? 'image', 'mime' => $img->mime, 'position' => $img->position])->values()->all(),
            'uploaded' => ['id' => $image->id, 'path' => $path, 'type' => $type, 'mime' => $mime, 'position' => $image->position],
            'image' => $product->image,
            'detail_image' => $product->detail_image,
        ]);
    }

    public function updateOptions(UpdateProductOptionsRequest $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($product, $data) {
            $this->syncOptions($product, $data['options'] ?? []);
        });

        $product->refresh()->load(['options.choices']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'options' => $product->options->map(fn ($o) => $o->toStorePayload())->all(),
            ]);
        }

        return redirect()->back()->with('success', 'Varian disimpan.');
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
            'types' => ProductType::where('is_active', true)->orderBy('name')->pluck('slug')->all(),
            'categories' => Category::where('is_active', true)->orderBy('name')->pluck('slug')->all(),
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
            'category' => $data['category'],
            'type' => $data['type'],
            'is_active' => (bool) ($data['is_active'] ?? true),
            'is_featured' => (bool) ($data['is_featured'] ?? false),
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
            'category' => $data['category'],
            'type' => $data['type'],
            'is_active' => (bool) ($data['is_active'] ?? true),
            'is_featured' => (bool) ($data['is_featured'] ?? $product->is_featured),
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $images
     */
    private function syncImages(Product $product, array $images, Request $request): void
    {
        $product->images()->delete();

        $paths = [];
        $firstImagePath = null;
        foreach ($images as $index => $img) {
            $position = isset($img['position']) ? (int) $img['position'] : $index;
            $path = $img['path'] ?? null;
            $type = $img['type'] ?? 'image';
            $mime = null;

            $fileKey = "images.{$index}.file";
            if ($request->hasFile($fileKey)) {
                $file = $request->file($fileKey);
                $mime = $file->getMimeType();
                $type = str_starts_with($mime ?? '', 'video/') ? 'video' : 'image';
                $stored = $file->store('products', 'public');
                $path = '/storage/'.$stored;
            } else {
                // infer type from path/extension if not provided
                if ($type === 'video' || ($path && preg_match('/\.(mp4|webm|mov)$/i', $path))) {
                    $type = 'video';
                } else {
                    $type = 'image';
                }
                // try to infer mime from extension
                if ($path && $type === 'video' && ! $mime) {
                    $mime = str_ends_with(strtolower($path), '.webm') ? 'video/webm' : 'video/mp4';
                }
            }

            if (empty($path)) {
                continue;
            }

            // skip invalid type fallback
            if (! in_array($type, ['image', 'video'], true)) {
                $type = 'image';
            }

            $paths[] = $path;
            if ($firstImagePath === null && $type === 'image') {
                $firstImagePath = $path;
            }
            $product->images()->create([
                'path' => $path,
                'type' => $type,
                'mime' => $mime,
                'position' => $position,
            ]);
        }

        // image/detail_image should be first image (not video) for card display
        $imageCandidates = [];
        foreach ($product->images()->orderBy('position')->get() as $img) {
            if ($img->type !== 'video') {
                $imageCandidates[] = $img->path;
            }
        }
        $product->update([
            'image' => $imageCandidates[0] ?? $paths[0] ?? null,
            'detail_image' => $imageCandidates[1] ?? $paths[1] ?? null,
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $options
     */
    private function syncOptions(Product $product, array $options): void
    {
        $product->options()->delete();

        usort($options, fn ($a, $b) => (int) (! empty($b['is_base'])) <=> (int) (! empty($a['is_base'])));

        foreach ($options as $optIndex => $opt) {
            $position = isset($opt['position']) ? (int) $opt['position'] : $optIndex;
            $isRequired = $opt['is_required'] ?? $opt['required'] ?? true;
            $isBase = ! empty($opt['is_base']);

            $option = $product->options()->create([
                'key' => $opt['key'],
                'label' => $opt['label'],
                'mode' => $opt['mode'],
                'is_required' => $isBase ? true : (bool) $isRequired,
                'is_base' => $isBase,
                'position' => $position,
            ]);

            foreach ($opt['choices'] ?? [] as $choiceIndex => $choice) {
                $option->choices()->create([
                    'key' => $choice['key'],
                    'name' => $choice['name'],
                    'price' => (int) $choice['price'],
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
