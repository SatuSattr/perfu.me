<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'images.*.type' => ['nullable', 'string', Rule::in(['image', 'video'])],
            'images.*.file' => ['nullable', 'file', 'max:102400', 'mimes:jpeg,jpg,png,webp,mp4,webm,mov,quicktime'],
            'images.*.position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $images = $this->input('images', []);
            if (! is_array($images)) {
                return;
            }
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
