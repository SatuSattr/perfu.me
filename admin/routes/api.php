<?php

use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API for Store
|--------------------------------------------------------------------------
|
| These routes are public (no auth) — consumed by perfu.me/store.
| Security layers:
| - throttle:60,1  → 60 req/min per IP (anti-scrape/bruteforce)
| - CORS via config/cors.php (api/*, GET/HEAD/OPTIONS, * origins)
| - No write methods exposed (GET only)
| - Only is_active products via scopeActive()
| - JSON only, small payload via toStorePayload()
|
*/

// Health / version
Route::get('/v1/health', function () {
    return response()->json([
        'status' => 'ok',
        'version' => 'v1',
        'time' => now()->toIso8601String(),
    ]);
})->middleware('throttle:60,1');

// Products — public read-only
Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
});
