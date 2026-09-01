<?php

namespace Database\Factories;

use App\Models\ProductType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductType>
 */
class ProductTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(1, true);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->randomNumber(4),
            'name' => ucfirst($name),
            'description' => fake()->sentence(),
            'position' => fake()->numberBetween(0, 20),
            'is_active' => true,
        ];
    }
}
