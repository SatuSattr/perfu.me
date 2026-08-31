<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductOptionsRequest extends FormRequest
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
        ];
    }
}
