<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductTypeRequest extends FormRequest
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
        $routeModel = $this->route('productType') ?? $this->route('product_type');
        $id = $routeModel ? $routeModel->id : null;

        return [
            'name' => ['required', 'string', 'max:40'],
            'slug' => ['nullable', 'string', 'max:40', 'regex:/^[a-z0-9-]+$/', Rule::unique('product_types', 'slug')->ignore($id)],
            'description' => ['nullable', 'string', 'max:500'],
            'position' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
