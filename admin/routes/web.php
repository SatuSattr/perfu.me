<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
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
    Route::get('/products/{product}/reviews/create', [ProductController::class, 'reviewsPage'])->name('products.reviews.create');
    Route::get('/products/{product}/reviews/{review}/edit', [ProductController::class, 'reviewsPage'])->name('products.reviews.edit');
    Route::get('/products/{product}/reviews.json', [ProductController::class, 'reviews'])->name('products.reviews.json');
    Route::post('/products/{product}/reviews', [ProductController::class, 'storeReview'])->name('products.reviews.store');
    Route::put('/products/{product}/reviews/{review}', [ProductController::class, 'updateReview'])->name('products.reviews.update');
    Route::delete('/products/{product}/reviews', [ProductController::class, 'destroyReviews'])->name('products.reviews.destroy');

    Route::patch('/products/{product:slug}/basic', [ProductController::class, 'updateBasic'])->name('products.basic.update');
    Route::patch('/products/{product:slug}/media', [ProductController::class, 'updateMedia'])->name('products.media.update');
    Route::post('/products/{product:slug}/media/upload', [ProductController::class, 'uploadMedia'])->name('products.media.upload');
    Route::patch('/products/{product:slug}/options', [ProductController::class, 'updateOptions'])->name('products.options.update');

    Route::resource('products', ProductController::class)->parameters([
        'products' => 'product:slug',
    ])->except(['show']);

    // Categories & Types (2 models on one page)
    Route::get('/categories', [CategoryController::class, 'indexPage'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'indexPage'])->name('categories.create');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'indexPage'])->name('categories.edit');
    Route::get('/categories/types/create', [CategoryController::class, 'indexPage'])->name('categories.types.create');
    Route::get('/categories/types/{productType}/edit', [CategoryController::class, 'indexPage'])->name('categories.types.edit');

    Route::post('/categories', [CategoryController::class, 'storeCategory'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'updateCategory'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroyCategory'])->name('categories.destroy');

    Route::post('/categories/types', [CategoryController::class, 'storeType'])->name('categories.types.store');
    Route::put('/categories/types/{productType}', [CategoryController::class, 'updateType'])->name('categories.types.update');
    Route::delete('/categories/types/{productType}', [CategoryController::class, 'destroyType'])->name('categories.types.destroy');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order:code}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order:code}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/{order:code}/whatsapp', [OrderController::class, 'sendWhatsapp'])->name('orders.whatsapp');
    Route::delete('/orders/{order:code}', [OrderController::class, 'destroy'])->name('orders.destroy');
});
