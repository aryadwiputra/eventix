<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_item_id')->constrained()->cascadeOnDelete();
            $table->uuid('code')->unique();
            $table->boolean('is_redeemed')->default(false);
            $table->dateTime('redeemed_at')->nullable();
            $table->foreignId('redeemed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_codes');
    }
};
