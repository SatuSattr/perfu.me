<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9-]+$/', Rule::unique('products', 'slug')],
            'tagline' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'gender' => ['required', Rule::in(['Pria', 'Wanita', 'Unisex'])],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'category' => ['required', Rule::in(['EDP'])],
            'type' => ['required', Rule::in(['signature', 'inspired'])],
            'size_label' => ['nullable', 'string', 'max:120'],
            'is_active' => ['sometimes', 'boolean'],

            'images' => ['nullable', 'array', 'max:6'],
            'images.*.path' => ['nullable', 'string', 'max:255'],
            'images.*.file' => ['nullable', 'image', 'max:2048'],
            'images.*.position' => ['nullable', 'integer', 'min:0'],

            'options' => ['nullable', 'array', 'max:10'],
            'options.*.key' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9_-]+$/'],
            'options.*.label' => ['required', 'string', 'max:120'],
            'options.*.mode' => ['required', Rule::in(['dropdown', 'normal'])],
            'options.*.is_required' => ['sometimes', 'boolean'],
            'options.*.required' => ['sometimes', 'boolean'],
            'options.*.position' => ['nullable', 'integer', 'min:0'],
            'options.*.choices' => ['nullable', 'array', 'max:30'],
            'options.*.choices.*.key' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_-]+$/'],
            'options.*.choices.*.name' => ['required', 'string', 'max:120'],
            'options.*.choices.*.price' => ['nullable', 'integer', 'min:0'],
            'options.*.choices.*.stock' => ['required', 'integer', 'min:0'],
            'options.*.choices.*.position' => ['nullable', 'integer', 'min:0'],

            'reviews' => ['nullable', 'array', 'max:50'],
            'reviews.*.name' => ['required_with:reviews', 'string', 'max:80'],
            'reviews.*.rating' => ['required_with:reviews', 'integer', 'min:1', 'max:5'],
            'reviews.*.date' => ['nullable', 'string', 'max:30'],
            'reviews.*.message' => ['required_with:reviews', 'string'],
            'reviews.*.is_visible' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk wajib diisi.',
            'price.required' => 'Harga wajib diisi.',
            'images.max' => 'Maksimal 6 foto.',
            'images.*.file.max' => 'Maksimal 2MB per foto.',
        ];
    }
}
