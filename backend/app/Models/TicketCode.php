<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TicketCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_item_id',
        'code',
        'is_redeemed',
        'redeemed_at',
        'redeemed_by',
    ];

    protected function casts(): array
    {
        return [
            'is_redeemed' => 'boolean',
            'redeemed_at' => 'datetime',
        ];
    }

    public static function generateCode(): string
    {
        return 'TIX' . strtoupper(Str::random(6));
    }

    public function transactionItem(): BelongsTo
    {
        return $this->belongsTo(TransactionItem::class);
    }

    public function redeemer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'redeemed_by');
    }

    public function isRedeemed(): bool
    {
        return $this->is_redeemed;
    }

    public function redeem(User $user): void
    {
        $this->update([
            'is_redeemed' => true,
            'redeemed_at' => now(),
            'redeemed_by' => $user->id,
        ]);
    }

    protected static function booted(): void
    {
        static::creating(function (TicketCode $ticketCode) {
            if (empty($ticketCode->code)) {
                $ticketCode->code = self::generateCode();
            }
        });
    }
}
