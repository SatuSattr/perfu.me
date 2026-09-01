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
            'options' => ['required', 'array', 'min:1', 'max:10'],
            'options.*.key' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9_-]+$/'],
            'options.*.label' => ['required', 'string', 'max:120'],
            'options.*.mode' => ['required', Rule::in(['dropdown', 'normal'])],
            'options.*.is_required' => ['sometimes', 'boolean'],
            'options.*.required' => ['sometimes', 'boolean'],
            'options.*.is_base' => ['sometimes', 'boolean'],
            'options.*.position' => ['nullable', 'integer', 'min:0'],
            'options.*.choices' => ['required', 'array', 'min:1', 'max:30'],
            'options.*.choices.*.key' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_-]+$/'],
            'options.*.choices.*.name' => ['required', 'string', 'max:120'],
            'options.*.choices.*.price' => ['required', 'integer', 'min:0'],
            'options.*.choices.*.stock' => ['required', 'integer', 'min:0'],
            'options.*.choices.*.position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $options = $this->input('options', []);
            if (! is_array($options) || empty($options)) {
                return;
            }
            $baseCount = collect($options)->filter(fn ($o) => ! empty($o['is_base']))->count();
            if ($baseCount !== 1) {
                $validator->errors()->add('options', 'Harus ada tepat 1 varian dasar (is_base).');
            }
        });
    }
}
