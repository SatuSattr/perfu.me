<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property string $email
 * @property string $whatsapp
 * @property string $full_name
 * @property string $province
 * @property string|null $province_name
 * @property string $city
 * @property string|null $city_name
 * @property string $district
 * @property string|null $district_name
 * @property string $village
 * @property string|null $village_name
 * @property string $postal_code
 * @property string $street
 * @property string|null $detail
 * @property string|null $lat
 * @property string|null $lng
 * @property int $subtotal
 * @property int $tax
 * @property int $shipping
 * @property int $total
 * @property string $status
 * @property string|null $turnstile_token
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, OrderItem> $items
 */
#[Fillable([
    'code',
    'email',
    'whatsapp',
    'full_name',
    'province',
    'province_name',
    'city',
    'city_name',
    'district',
    'district_name',
    'village',
    'village_name',
    'postal_code',
    'street',
    'detail',
    'lat',
    'lng',
    'subtotal',
    'tax',
    'shipping',
    'total',
    'status',
    'turnstile_token',
    'notes',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'tax' => 'integer',
            'shipping' => 'integer',
            'total' => 'integer',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateCode(): string
    {
        $date = now()->format('Ymd');
        $attempts = 0;

        do {
            $suffix = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $code = $date.$suffix;
            $exists = static::where('code', $code)->exists();
            $attempts++;
        } while ($exists && $attempts < 10);

        if ($exists) {
            // fallback with uniq suffix
            $code = $date.str_pad((string) (Order::where('code', 'like', $date.'%')->count() + 1), 4, '0', STR_PAD_LEFT);
            while (static::where('code', $code)->exists()) {
                $code = $date.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            }
        }

        return $code;
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isWhatsappSent(): bool
    {
        return $this->status === 'whatsapp_sent';
    }

    public function fullAddress(): string
    {
        $parts = [
            $this->street,
            $this->detail,
            $this->village_name ?: $this->village,
            $this->district_name ?: $this->district,
            $this->city_name ?: $this->city,
            $this->province_name ?: $this->province,
            $this->postal_code,
        ];

        return collect($parts)->filter()->implode(', ');
    }
}
