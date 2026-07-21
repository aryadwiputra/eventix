<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('headline')->nullable();
            $table->longText('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->string('location')->nullable();
            $table->string('type')->default('offline');
            $table->string('status')->default('draft');
            $table->string('meeting_link')->nullable();
            $table->json('photos')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_popular']);
            $table->index('start_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
