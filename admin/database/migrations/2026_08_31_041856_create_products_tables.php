<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('gender', 20);
            $table->unsignedInteger('price');
            $table->unsignedInteger('stock')->nullable();
            $table->string('category', 30)->default('EDP');
            $table->string('type', 20);
            $table->string('image')->nullable();
            $table->string('detail_image')->nullable();
            $table->string('size_label')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'gender', 'category']);
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('path');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'position']);
        });

        Schema::create('product_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('key', 50);
            $table->string('label');
            $table->string('mode', 20);
            $table->boolean('is_required')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'key']);
            $table->index(['product_id', 'position']);
        });

        Schema::create('product_option_choices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_option_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('key', 100);
            $table->string('name');
            $table->unsignedInteger('price')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['product_option_id', 'key']);
            $table->index(['product_option_id', 'position']);
        });

        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('name');
            $table->unsignedTinyInteger('rating');
            $table->string('reviewed_at', 20)->nullable()->comment('unix timestamp stored as string');
            $table->text('message');
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'rating']);
            $table->index('reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('product_option_choices');
        Schema::dropIfExists('product_options');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
    }
};
