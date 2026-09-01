<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Dummy turnstile: accept any token (auto true per spec)
        // Future: verify via Cloudflare siteverify

        $cart = $data['cart'];
        $itemsData = [];
        $subtotal = 0;

        foreach ($cart as $entry) {
            $slug = $entry['product_slug'];
            $qty = (int) $entry['qty'];
            $selectedOptions = $entry['selectedOptions'] ?? null;

            $product = Product::where('slug', $slug)->where('is_active', true)->with(['options.choices'])->first();
            if (! $product) {
                return response()->json(['message' => "Produk {$slug} tidak ditemukan atau tidak aktif."], 422);
            }

            // Resolve price: use lowestPrice() as base, but if request wants snapshot trust? We recompute server-side.
            // For pure base-driven pricing, lowest price is authoritative for single-choice base; for multi-choice we still use cheapest.
            // Better: find exact choice if selectedOptions contains base variant choice name, otherwise lowest.
            // For sekarang: gunakan lowestPrice() sebagai harga satuan (alamat & items read-only, best-effort).
            // Jika selectedOptions menentukan harga modifier, kita hitung additive (base + modifiers) jika non-base exists.
            $price = $this->resolvePrice($product, $selectedOptions);

            $lineSubtotal = $price * $qty;
            $subtotal += $lineSubtotal;

            $itemsData[] = [
                'product_id' => $product->id,
                'product_slug' => $product->slug,
                'product_name' => $product->name,
                'image_path' => $product->image,
                'price' => $price,
                'qty' => $qty,
                'selected_options' => $selectedOptions,
                'subtotal' => $lineSubtotal,
            ];
        }

        $tax = (int) round($subtotal * 0.11);
        $shipping = 0;
        $total = $subtotal + $tax + $shipping;

        $order = null;
        DB::transaction(function () use (&$order, $data, $itemsData, $subtotal, $tax, $shipping, $total) {
            $code = Order::generateCode();
            $order = Order::create([
                'code' => $code,
                'email' => $data['email'],
                'whatsapp' => $data['phone'],
                'full_name' => $data['fullName'],
                'province' => $data['province'],
                'province_name' => $data['province_name'] ?? null,
                'city' => $data['city'],
                'city_name' => $data['city_name'] ?? null,
                'district' => $data['district'],
                'district_name' => $data['district_name'] ?? null,
                'village' => $data['village'],
                'village_name' => $data['village_name'] ?? null,
                'postal_code' => $data['postalCode'],
                'street' => $data['street'],
                'detail' => $data['detail'] ?? null,
                'lat' => $data['lat'] ?? null,
                'lng' => $data['lng'] ?? null,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total,
                'status' => 'pending',
                'turnstile_token' => $data['turnstile_token'] ?? null,
            ]);

            foreach ($itemsData as $it) {
                $order->items()->create($it);
            }
        });

        // Stub: auto WA will be handled manually + Send WA button. Log for now.
        Log::info('Order created', ['code' => $order->code, 'whatsapp' => $order->whatsapp, 'total' => $order->total]);

        $order->load('items');

        return response()->json([
            'code' => $order->code,
            'subtotal' => $order->subtotal,
            'tax' => $order->tax,
            'shipping' => $order->shipping,
            'total' => $order->total,
            'status' => $order->status,
        ], 201);
    }

    private function resolvePrice(Product $product, mixed $selectedOptions): int
    {
        // Base price is authoritative
        $basePrice = $product->lowestPrice();
        if (empty($selectedOptions) || ! is_array($selectedOptions)) {
            return $basePrice > 0 ? $basePrice : 0;
        }

        // If product has base + non-base modifiers, sum them.
        // We look for choices where choice name matches selectedOptions values case-insensitive.
        // For simplicity: if any selected option value matches a choice in non-base options, add its price modifier.
        // If not found, return base.
        $modifiers = 0;
        $foundBasePrice = null;

        foreach ($product->options as $opt) {
            if ($opt->is_base) {
                // try to find exact base choice
                foreach ($opt->choices as $choice) {
                    foreach ($selectedOptions as $selVal) {
                        if (strcasecmp(trim((string) $selVal), trim($choice->name)) === 0) {
                            $foundBasePrice = (int) $choice->price;
                            break 2;
                        }
                    }
                }
            } else {
                foreach ($opt->choices as $choice) {
                    foreach ($selectedOptions as $selVal) {
                        if (strcasecmp(trim((string) $selVal), trim($choice->name)) === 0) {
                            $modifiers += (int) $choice->price;
                        }
                    }
                }
            }
        }

        $base = $foundBasePrice ?? $basePrice;

        return $base + $modifiers;
    }
}
