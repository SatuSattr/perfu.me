<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 3);
        $price = fake()->randomElement([45000, 20000, 35000]);

        return [
            'product_slug' => 'dynamyst',
            'product_name' => 'Dynamyst',
            'image_path' => '/storage/products/dynamyst-transparent.png',
            'price' => $price,
            'qty' => $qty,
            'selected_options' => ['Ukuran' => '50ml'],
            'subtotal' => $price * $qty,
        ];
    }
}
