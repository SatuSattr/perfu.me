<?php

namespace App\Models;

use App\Enums\ProductOptionMode;
use Database\Factories\ProductOptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Mirrors `options[]` entry in store/src/data/products.js:123
 *
 * @property int $id
 * @property int $product_id
 * @property string $key
 * @property string $label
 * @property ProductOptionMode $mode
 * @property bool $is_required
 * @property bool $is_base
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read Collection<int, ProductOptionChoice> $choices
 */
#[Fillable(['product_id', 'key', 'label', 'mode', 'is_required', 'is_base', 'position'])]
class ProductOption extends Model
{
    /** @use HasFactory<ProductOptionFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'mode' => ProductOptionMode::class,
            'is_required' => 'boolean',
            'is_base' => 'boolean',
            'position' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return HasMany<ProductOptionChoice, $this>
     */
    public function choices(): HasMany
    {
        return $this->hasMany(ProductOptionChoice::class)->orderBy('position');
    }

    /**
     * @return HasMany<ProductOptionChoice, $this>
     */
    public function activeChoices(): HasMany
    {
        return $this->choices()->where('is_active', true);
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorePayload(): array
    {
        $this->loadMissing('choices');

        return [
            'id' => $this->key,
            'name' => $this->key,
            'label' => $this->label,
            'mode' => $this->mode->value,
            'required' => $this->is_required,
            'is_base' => $this->is_base,
            'position' => $this->position,
            'choices' => $this->choices->map(fn (ProductOptionChoice $c) => $c->toStorePayload())->all(),
        ];
    }
}
