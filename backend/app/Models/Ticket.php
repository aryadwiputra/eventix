<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'quantity',
        'sold_count',
        'max_per_transaction',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'quantity' => 'integer',
            'sold_count' => 'integer',
            'max_per_transaction' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function waitlists(): HasMany
    {
        return $this->hasMany(Waitlist::class);
    }

    public function getAvailableQuantityAttribute(): int
    {
        return max(0, $this->quantity - $this->sold_count);
    }

    public function isSoldOut(): bool
    {
        return $this->available_quantity <= 0;
    }

    public function hasEnoughStock(int $quantity): bool
    {
        return $this->available_quantity >= $quantity;
    }

    public function incrementSoldCount(int $quantity): void
    {
        $this->increment('sold_count', $quantity);
    }

    public function decrementSoldCount(int $quantity): void
    {
        $this->decrement('sold_count', $quantity);
    }
}
