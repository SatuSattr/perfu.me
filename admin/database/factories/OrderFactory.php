<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $code = now()->format('Ymd').str_pad((string) fake()->unique()->numberBetween(0, 9999), 4, '0', STR_PAD_LEFT);

        return [
            'code' => $code,
            'email' => fake()->safeEmail(),
            'whatsapp' => '08'.fake()->numerify('##########'),
            'full_name' => fake()->name(),
            'province' => '31',
            'province_name' => 'DKI Jakarta',
            'city' => '3171',
            'city_name' => 'Jakarta Selatan',
            'district' => '3171010',
            'district_name' => 'Kebayoran Baru',
            'village' => '3171010001',
            'village_name' => 'Selong',
            'postal_code' => fake()->numerify('#####'),
            'street' => fake()->streetAddress(),
            'detail' => fake()->optional()->sentence(),
            'lat' => fake()->optional()->latitude(),
            'lng' => fake()->optional()->longitude(),
            'subtotal' => 90000,
            'tax' => 9900,
            'shipping' => 0,
            'total' => 99900,
            'status' => 'pending',
            'turnstile_token' => 'dummy-'.fake()->uuid(),
            'notes' => null,
        ];
    }
}
