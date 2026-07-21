<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('code')->unique();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('buyer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedInteger('fee_amount')->default(0);
            $table->unsignedInteger('unique_amount')->default(0);
            $table->unsignedInteger('total_amount')->default(0);
            $table->string('midtrans_order_id')->nullable();
            $table->string('midtrans_status')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_type')->nullable();
            $table->dateTime('payment_deadline')->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('payment_deadline');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
