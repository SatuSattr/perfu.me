<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

// Guest admin
Route::middleware('guest:admin')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Authenticated admin
Route::middleware('auth:admin')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/products/{product}/reviews', [ProductController::class, 'reviewsPage'])->name('products.reviews');
    Route::get('/products/{product}/reviews.json', [ProductController::class, 'reviews'])->name('products.reviews.json');
    Route::post('/products/{product}/reviews', [ProductController::class, 'storeReview'])->name('products.reviews.store');
    Route::put('/products/{product}/reviews/{review}', [ProductController::class, 'updateReview'])->name('products.reviews.update');
    Route::delete('/products/{product}/reviews', [ProductController::class, 'destroyReviews'])->name('products.reviews.destroy');

    Route::resource('products', ProductController::class)->parameters([
        'products' => 'product:slug',
    ])->except(['show']);
});
