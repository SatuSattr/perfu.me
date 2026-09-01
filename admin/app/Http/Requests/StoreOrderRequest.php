<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            'fullName' => ['required', 'string', 'min:3', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^0[0-9]{7,14}$/', 'max:15'],
            'email' => ['required', 'email:filter', 'max:150'],
            'province' => ['required', 'string', 'max:10'],
            'province_name' => ['nullable', 'string', 'max:150'],
            'city' => ['required', 'string', 'max:10'],
            'city_name' => ['nullable', 'string', 'max:150'],
            'district' => ['required', 'string', 'max:10'],
            'district_name' => ['nullable', 'string', 'max:150'],
            'village' => ['required', 'string', 'max:10'],
            'village_name' => ['nullable', 'string', 'max:150'],
            'postalCode' => ['required', 'string', 'regex:/^[0-9]{5}$/'],
            'street' => ['required', 'string', 'min:5', 'max:255'],
            'detail' => ['nullable', 'string', 'max:500'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'turnstile_token' => ['nullable', 'string', 'max:500'],
            'cart' => ['required', 'array', 'min:1', 'max:30'],
            'cart.*.product_slug' => ['required', 'string', 'max:120'],
            'cart.*.qty' => ['required', 'integer', 'min:1', 'max:99'],
            'cart.*.selectedOptions' => ['nullable', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor WhatsApp tidak valid (08xxxxxxxxxx, 8-15 digit).',
            'postalCode.regex' => 'Kode pos harus 5 digit angka.',
        ];
    }
}
