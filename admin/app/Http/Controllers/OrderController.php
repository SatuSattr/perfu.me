<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::query()->with(['items'])->withCount('items');

        if ($q = $request->string('q')->toString()) {
            $query->where(function ($w) use ($q) {
                $w->where('code', 'like', "%{$q}%")
                    ->orWhere('full_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('whatsapp', 'like', "%{$q}%");
            });
        }

        if ($status = $request->string('status')->toString()) {
            if (in_array($status, ['pending', 'whatsapp_sent', 'confirmed', 'cancelled'], true)) {
                $query->where('status', $status);
            }
        }

        $orders = $query->orderByDesc('created_at')->paginate(12)->withQueryString();

        $orders->through(fn (Order $o) => [
            'id' => $o->id,
            'code' => $o->code,
            'full_name' => $o->full_name,
            'email' => $o->email,
            'whatsapp' => $o->whatsapp,
            'total' => $o->total,
            'subtotal' => $o->subtotal,
            'tax' => $o->tax,
            'shipping' => $o->shipping,
            'status' => $o->status,
            'items_count' => $o->items_count,
            'created_at' => $o->created_at?->toISOString(),
        ]);

        $statusCounts = Order::query()->selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status')->toArray();

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items']);

        return Inertia::render('orders/show', [
            'order' => [
                'id' => $order->id,
                'code' => $order->code,
                'email' => $order->email,
                'whatsapp' => $order->whatsapp,
                'full_name' => $order->full_name,
                'province' => $order->province,
                'province_name' => $order->province_name,
                'city' => $order->city,
                'city_name' => $order->city_name,
                'district' => $order->district,
                'district_name' => $order->district_name,
                'village' => $order->village,
                'village_name' => $order->village_name,
                'postal_code' => $order->postal_code,
                'street' => $order->street,
                'detail' => $order->detail,
                'lat' => $order->lat,
                'lng' => $order->lng,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'status' => $order->status,
                'notes' => $order->notes,
                'full_address' => $order->fullAddress(),
                'created_at' => $order->created_at?->toISOString(),
                'updated_at' => $order->updated_at?->toISOString(),
                'items' => $order->items->map(fn ($it) => [
                    'id' => $it->id,
                    'product_slug' => $it->product_slug,
                    'product_name' => $it->product_name,
                    'image_path' => $it->image_path,
                    'price' => $it->price,
                    'qty' => $it->qty,
                    'selected_options' => $it->selected_options,
                    'subtotal' => $it->subtotal,
                ])->all(),
            ],
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,whatsapp_sent,confirmed,cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? $order->notes,
        ]);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['status' => $order->status, 'notes' => $order->notes]);
        }

        return redirect()->back()->with('success', 'Status pesanan diperbarui.');
    }

    public function sendWhatsapp(Request $request, Order $order): JsonResponse|RedirectResponse
    {
        if (! $order->isPending()) {
            $msg = 'Hanya pesanan pending yang bisa dikirim WA.';

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['message' => $msg], 422);
            }

            return redirect()->back()->withErrors(['status' => $msg]);
        }

        // Stub: log instead of real WA API
        Log::info('Order WA sent (stub)', [
            'code' => $order->code,
            'whatsapp' => $order->whatsapp,
            'total' => $order->total,
        ]);

        $order->update(['status' => 'whatsapp_sent']);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['status' => $order->status]);
        }

        return redirect()->back()->with('success', 'Pesan WhatsApp terkirim (stub) — status jadi whatsapp_sent.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Pesanan dihapus.');
    }
}
