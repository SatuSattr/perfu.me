<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ProductType;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function categories(): JsonResponse
    {
        $data = Category::where('is_active', true)->orderBy('name')->get(['id', 'slug', 'name', 'description']);

        return response()->json(['data' => $data])
            ->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400')
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('Vary', 'Origin, Accept');
    }

    public function types(): JsonResponse
    {
        $data = ProductType::where('is_active', true)->orderBy('name')->get(['id', 'slug', 'name', 'description']);

        return response()->json(['data' => $data])
            ->header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400')
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('Vary', 'Origin, Accept');
    }
}
