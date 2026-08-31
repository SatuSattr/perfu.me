<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductMediaRequest extends FormRequest
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
            'images' => ['nullable', 'array', 'max:6'],
            'images.*.path' => ['nullable', 'string', 'max:255'],
            'images.*.file' => ['nullable', 'image', 'max:2048'],
            'images.*.position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.max' => 'Maksimal 6 foto.',
            'images.*.file.max' => 'Maksimal 2MB per foto.',
        ];
    }
}
