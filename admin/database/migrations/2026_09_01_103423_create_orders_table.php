<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->unique()->comment('YYYYMMDDXXXX');
            $table->string('email', 150);
            $table->string('whatsapp', 15);
            $table->string('full_name', 100);
            $table->string('province', 10);
            $table->string('province_name')->nullable();
            $table->string('city', 10);
            $table->string('city_name')->nullable();
            $table->string('district', 10);
            $table->string('district_name')->nullable();
            $table->string('village', 10);
            $table->string('village_name')->nullable();
            $table->string('postal_code', 5);
            $table->string('street', 255);
            $table->string('detail', 500)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('tax');
            $table->unsignedInteger('shipping')->default(0);
            $table->unsignedInteger('total');
            $table->string('status', 20)->default('pending')->comment('pending,whatsapp_sent,confirmed,cancelled');
            $table->string('turnstile_token')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('email');
            $table->index('whatsapp');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
