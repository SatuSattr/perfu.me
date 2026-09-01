<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9-]+$/', Rule::unique('products', 'slug')->ignore($productId)],
            'tagline' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'gender' => ['required', Rule::in(['Pria', 'Wanita', 'Unisex'])],
            'category' => ['required', 'string', Rule::exists('categories', 'slug')->where('is_active', true)],
            'type' => ['required', 'string', Rule::exists('product_types', 'slug')->where('is_active', true)],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],

            'images' => ['nullable', 'array', 'max:6'],
            'images.*.path' => ['nullable', 'string', 'max:255'],
            'images.*.type' => ['nullable', 'string', Rule::in(['image', 'video'])],
            'images.*.file' => ['nullable', 'file', 'max:102400', 'mimes:jpeg,jpg,png,webp,mp4,webm,mov,quicktime'],
            'images.*.position' => ['nullable', 'integer', 'min:0'],

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

            'reviews' => ['nullable', 'array', 'max:50'],
            'reviews.*.name' => ['required_with:reviews', 'string', 'max:80'],
            'reviews.*.rating' => ['required_with:reviews', 'integer', 'min:1', 'max:5'],
            'reviews.*.date' => ['nullable', 'string', 'max:30'],
            'reviews.*.message' => ['required_with:reviews', 'string'],
            'reviews.*.is_visible' => ['sometimes', 'boolean'],
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

            if (! empty($this->input('is_featured'))) {
                $product = $this->route('product');
                $isAlreadyFeatured = $product instanceof Product ? (bool) $product->is_featured : false;
                if (! $isAlreadyFeatured) {
                    $count = Product::where('is_featured', true)->where('id', '!=', $product->id ?? 0)->count();
                    if ($count >= 6) {
                        $validator->errors()->add('is_featured', 'Maksimal 6 produk featured sudah tercapai.');
                    }
                }
            }

            $images = $this->input('images', []);
            if (is_array($images)) {
                foreach ($images as $idx => $img) {
                    $fileKey = "images.{$idx}.file";
                    if ($this->hasFile($fileKey)) {
                        $file = $this->file($fileKey);
                        $isVideo = str_starts_with($file->getMimeType() ?? '', 'video/');
                        $max = $isVideo ? 100 * 1024 : 2 * 1024;
                        if ($file->getSize() > $max * 1024) {
                            $validator->errors()->add("images.{$idx}.file", $isVideo ? 'Maksimal 100MB per video.' : 'Maksimal 2MB per foto.');
                        }
                    }
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.max' => 'Maksimal 6 media (foto + video).',
            'images.*.file.max' => 'Maksimal 100MB per file.',
            'images.*.file.mimes' => 'Format harus jpg, png, webp, mp4, webm, mov.',
        ];
    }
}
