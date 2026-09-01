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
            'category' => 'edp',
            'type' => fake()->randomElement(['signature', 'inspired']),
            'image' => '/assets/products/dynamyst-transparent.png',
            'detail_image' => null,
            'is_active' => true,
            'is_featured' => fake()->boolean(30),
        ];
    }
}
