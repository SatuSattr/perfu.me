<?php

namespace App\Models;

use App\Enums\ProductCategory;
use App\Enums\ProductGender;
use App\Enums\ProductType;
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
 * @property int $price
 * @property int|null $stock
 * @property ProductCategory $category
 * @property ProductType $type
 * @property string|null $image
 * @property string|null $detail_image
 * @property string|null $size_label
 * @property bool $is_active
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
    'price',
    'stock',
    'category',
    'type',
    'image',
    'detail_image',
    'size_label',
    'is_active',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'gender' => ProductGender::class,
            'category' => ProductCategory::class,
            'type' => ProductType::class,
            'price' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
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
        return $query->where('type', ProductType::Signature);
    }

    /**
     * @param  Builder<self>  $query
     */
    public function scopeInspired(Builder $query): Builder
    {
        return $query->where('type', ProductType::Inspired);
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
        return $this->type === ProductType::Signature;
    }

    public function isInspired(): bool
    {
        return $this->type === ProductType::Inspired;
    }

    /**
     * Whether product (or any variant) is in stock.
     * Mirrors frontend `availableStock` logic.
     */
    public function isInStock(): bool
    {
        if ($this->stock !== null) {
            return $this->stock > 0;
        }

        return $this->optionChoices()->where('stock', '>', 0)->exists();
    }

    /**
     * Total available stock across product + variants.
     */
    public function totalStock(): int
    {
        if ($this->stock !== null) {
            return $this->stock;
        }

        return (int) $this->optionChoices()->sum('stock');
    }

    /**
     * Lowest effective price (base or cheapest variant).
     */
    public function lowestPrice(): int
    {
        $choicePrice = $this->optionChoices()
            ->whereNotNull('price')
            ->min('price');

        if ($choicePrice !== null) {
            return (int) min($this->price, $choicePrice);
        }

        return $this->price;
    }

    /**
     * Price range for display, e.g. [20000, 50000].
     *
     * @return array{int, int}
     */
    public function priceRange(): array
    {
        $prices = $this->optionChoices()->whereNotNull('price')->pluck('price')->all();
        $prices[] = $this->price;

        /** @var array<int> $prices */
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

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'gender' => $this->gender->value,
            'price' => $this->price,
            'stock' => $this->stock,
            'category' => $this->category->value,
            'type' => $this->type->value,
            'image' => $this->image,
            'detailImage' => $this->detail_image,
            'images' => $this->images->pluck('path')->all(),
            'sizeLabel' => $this->size_label,
            'options' => $this->options->map(fn (ProductOption $opt) => $opt->toStorePayload())->all(),
            'reviews' => $this->visibleReviews->map(fn (ProductReview $r) => $r->toStorePayload())->all(),
        ];
    }
}
