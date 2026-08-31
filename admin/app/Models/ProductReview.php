<?php

namespace App\Models;

use Database\Factories\ProductReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Mirrors `reviews[]` in store/src/data/products.js:23
 *
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property int $rating
 * @property string|null $reviewed_at unix timestamp stored as string
 * @property string $message
 * @property bool $is_visible
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 */
#[Fillable(['product_id', 'name', 'rating', 'reviewed_at', 'message', 'is_visible'])]
class ProductReview extends Model
{
    /** @use HasFactory<ProductReviewFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'reviewed_at' => 'string',
            'is_visible' => 'boolean',
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
     * Carbon instance from unix timestamp string (UTC), or null.
     */
    public function reviewedAtCarbon(): ?Carbon
    {
        if ($this->reviewed_at === null || $this->reviewed_at === '') {
            return null;
        }

        return Carbon::createFromTimestamp((int) $this->reviewed_at, 'UTC');
    }

    /**
     * Format reviewed_at to "18 Aug 2026" — same as store display.
     */
    public function formattedDate(): ?string
    {
        return $this->reviewedAtCarbon()?->format('d M Y');
    }

    /**
     * Unix timestamp as int, or null.
     */
    public function reviewedAtTimestamp(): ?int
    {
        return $this->reviewed_at !== null && $this->reviewed_at !== '' ? (int) $this->reviewed_at : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorePayload(): array
    {
        return [
            'name' => $this->name,
            'rating' => $this->rating,
            'date' => $this->formattedDate() ?? $this->created_at?->format('d M Y'),
            'message' => $this->message,
        ];
    }
}
