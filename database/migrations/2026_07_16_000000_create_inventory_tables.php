<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('stock_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('name');
            $table->string('type');
            $table->integer('stock')->default(0);
            $table->unsignedBigInteger('purchase_price')->default(0);
            $table->unsignedBigInteger('selling_price')->default(0);
            $table->timestamps();

            $table->index(['name', 'type']);
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_item_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('receipt_number')->nullable();
            $table->enum('type', ['in', 'out', 'sale']);
            $table->integer('quantity');
            $table->unsignedBigInteger('purchase_price')->nullable();
            $table->unsignedBigInteger('selling_price')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('happened_at');
            $table->timestamps();

            $table->index(['type', 'happened_at']);
        });

        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_item_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->string('receipt_number');
            $table->date('sold_at');
            $table->integer('quantity');
            $table->unsignedBigInteger('purchase_price');
            $table->unsignedBigInteger('selling_price');
            $table->bigInteger('profit');
            $table->timestamps();

            $table->index(['receipt_number', 'sold_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('stock_items');
        Schema::dropIfExists('brands');
    }
};
