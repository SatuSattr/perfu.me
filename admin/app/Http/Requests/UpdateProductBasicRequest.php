<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductBasicRequest extends FormRequest
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
        $productId = $this->route('product') ? $this->route('product')->id : null;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9-]+$/', Rule::unique('products', 'slug')->ignore($productId)],
            'tagline' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'gender' => ['sometimes', 'required', Rule::in(['Pria', 'Wanita', 'Unisex'])],
            'category' => ['sometimes', 'required', 'string', Rule::exists('categories', 'slug')->where('is_active', true)],
            'type' => ['sometimes', 'required', 'string', Rule::exists('product_types', 'slug')->where('is_active', true)],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! empty($this->input('is_featured'))) {
                $product = $this->route('product');
                $isAlreadyFeatured = $product instanceof Product ? (bool) $product->is_featured : false;
                if (! $isAlreadyFeatured) {
                    $id = $product instanceof Product ? $product->id : ($this->route('product')?->id ?? 0);
                    $count = Product::where('is_featured', true)->where('id', '!=', $id)->count();
                    if ($count >= 6) {
                        $validator->errors()->add('is_featured', 'Maksimal 6 produk featured sudah tercapai.');
                    }
                }
            }
        });
    }
}
