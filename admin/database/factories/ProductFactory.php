<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(),
            'name' => fake()->words(2, true),
            'tagline' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'gender' => fake()->randomElement(['Pria', 'Wanita', 'Unisex']),
            'price' => fake()->randomElement([20000, 35000, 45000]),
            'stock' => fake()->numberBetween(5, 30),
            'category' => 'EDP',
            'type' => fake()->randomElement(['signature', 'inspired']),
            'image' => '/assets/products/dynamyst-transparent.png',
            'detail_image' => null,
            'size_label' => null,
            'is_active' => true,
        ];
    }
}
