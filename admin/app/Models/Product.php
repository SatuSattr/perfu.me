<?php

namespace App\Models;

use App\Enums\ProductGender;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property string|null $tagline
 * @property string|null $description
 * @property ProductGender $gender
 * @property string $category
 * @property string $type
 * @property string|null $image
 * @property string|null $detail_image
 * @property bool $is_active
 * @property bool $is_featured
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, ProductImage> $images
 * @property-read Collection<int, ProductOption> $options
 * @property-read Collection<int, ProductReview> $reviews
 */
#[Fillable([
    'slug',
    'name',
    'tagline',
    'description',
    'gender',
    'category',
    'type',
    'image',
    'detail_image',
    'is_active',
    'is_featured',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'gender' => ProductGender::class,
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::saving(function (self $product) {
            if (empty($product->slug) && ! empty($product->name)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Gallery images ordered by position.
     *
     * @return HasMany<ProductImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    /**
     * Variant options (e.g. aroma, ukuran) ordered by position.
     *
     * Mirrors `options` array in store/src/data/products.js:123
     *
     * @return HasMany<ProductOption, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(ProductOption::class)->orderBy('position');
    }

    /**
     * @return HasMany<ProductReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->orderByDesc('reviewed_at')->orderByDesc('created_at');
    }

    /**
     * Visible reviews only.
     *
     * @return HasMany<ProductReview, $this>
     */
    public function visibleReviews(): HasMany
    {
        return $this->reviews()->where('is_visible', true);
    }

    /**
     * All choices across options (convenience).
     *
     * @return HasManyThrough<ProductOptionChoice, ProductOption, $this>
     */
    public function optionChoices(): HasManyThrough
    {
        return $this->hasManyThrough(ProductOptionChoice::class, ProductOption::class);
    }

    public function baseOption(): ?ProductOption
    {
        if ($this->relationLoaded('options')) {
            return $this->options->firstWhere('is_base', true);
        }

        return $this->options()->where('is_base', true)->first();
    }

    /**
     * @return HasMany<ProductOptionChoice, $this>
     */
    public function baseChoices(): HasManyThrough
    {
        return $this->hasManyThrough(ProductOptionChoice::class, ProductOption::class)
            ->where('product_options.is_base', true);
    }

    // ── Scopes ──────────────────────────────────────────────────────────

    /**
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeSignature(Builder $query): Builder
    {
        return $query->where('type', 'signature');
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeInspired(Builder $query): Builder
    {
        return $query->where('type', 'inspired');
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeByGender(Builder $query, ProductGender $gender): Builder
    {
        return $query->where('gender', $gender);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    public function hasOptions(): bool
    {
        return $this->relationLoaded('options')
            ? $this->options->isNotEmpty()
            : $this->options()->exists();
    }

    public function isSignature(): bool
    {
        return $this->type === 'signature';
    }

    public function isInspired(): bool
    {
        return $this->type === 'inspired';
    }

    /**
     * Whether product (or any variant) is in stock.
     * Pure variant-driven: check base variant stock.
     */
    public function isInStock(): bool
    {
        return $this->baseChoices()->where('stock', '>', 0)->exists();
    }

    /**
     * Total available stock = sum of base variant choices.
     */
    public function totalStock(): int
    {
        return (int) $this->baseChoices()->sum('stock');
    }

    /**
     * Lowest effective price = cheapest choice in base variant.
     * Additive variants: price = basePrice + sum(modifiers)
     */
    public function lowestPrice(): int
    {
        $min = $this->baseChoices()->min('price');

        return $min !== null ? (int) $min : 0;
    }

    /**
     * Price range from base variant only.
     *
     * @return array{int, int}
     */
    public function priceRange(): array
    {
        $prices = $this->baseChoices()->pluck('price')->all();

        if (empty($prices)) {
            return [0, 0];
        }

        return [min($prices), max($prices)];
    }

    public function averageRating(): ?float
    {
        $avg = $this->visibleReviews()->avg('rating');

        return $avg !== null ? round((float) $avg, 1) : null;
    }

    /**
     * Serialize to the exact shape consumed by store/src/data/products.js
     * Useful for the future API that will replace the static file.
     *
     * @return array<string, mixed>
     */
    public function toStorePayload(): array
    {
        $this->loadMissing(['images', 'options.choices', 'visibleReviews']);

        // Media payload: support image + video
        $media = $this->images->map(fn (ProductImage $img) => [
            'path' => $img->path,
            'type' => $img->type ?? 'image',
            'mime' => $img->mime,
        ])->all();

        // Legacy images string[] for backward compat
        $legacyImages = $this->images->pluck('path')->all();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'gender' => $this->gender->value,
            'price' => $this->lowestPrice(),
            'stock' => null,
            'category' => $this->category,
            'type' => $this->type,
            'image' => $this->image,
            'detailImage' => $this->detail_image,
            'images' => $legacyImages,
            'media' => $media,
            'is_featured' => $this->is_featured,
            'sizeLabel' => null,
            'options' => $this->options->map(fn (ProductOption $opt) => $opt->toStorePayload())->all(),
            'reviews' => $this->visibleReviews->map(fn (ProductReview $r) => $r->toStorePayload())->all(),
        ];
    }
}
