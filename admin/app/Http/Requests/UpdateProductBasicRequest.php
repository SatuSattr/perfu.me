<?php

namespace App\Http\Requests;

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
            'price' => ['sometimes', 'required', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'category' => ['sometimes', 'required', Rule::in(['EDP'])],
            'type' => ['sometimes', 'required', Rule::in(['signature', 'inspired'])],
            'size_label' => ['nullable', 'string', 'max:120'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
