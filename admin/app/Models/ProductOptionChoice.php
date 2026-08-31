<?php

namespace App\Models;

use Database\Factories\ProductOptionChoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Mirrors `options[].choices[]` in store/src/data/products.js:131
 *
 * @property int $id
 * @property int $product_option_id
 * @property string $key
 * @property string $name
 * @property int|null $price
 * @property int $stock
 * @property int $position
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ProductOption $option
 */
#[Fillable(['product_option_id', 'key', 'name', 'price', 'stock', 'position', 'is_active'])]
class ProductOptionChoice extends Model
{
    /** @use HasFactory<ProductOptionChoiceFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'stock' => 'integer',
            'position' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<ProductOption, $this>
     */
    public function option(): BelongsTo
    {
        return $this->belongsTo(ProductOption::class, 'product_option_id');
    }

    public function isInStock(): bool
    {
        return $this->stock > 0;
    }

    /**
     * Effective price: null means inherit from parent product.
     */
    public function effectivePrice(Product $product): int
    {
        return $this->price ?? $product->price;
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorePayload(): array
    {
        return [
            'id' => $this->key,
            'name' => $this->name,
            'price' => $this->price,
            'stock' => $this->stock,
        ];
    }
}
