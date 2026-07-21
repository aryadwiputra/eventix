<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'event_id',
        'buyer_user_id',
        'name',
        'email',
        'phone',
        'status',
        'fee_amount',
        'unique_amount',
        'total_amount',
        'midtrans_order_id',
        'midtrans_status',
        'payment_method',
        'payment_type',
        'payment_deadline',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'fee_amount' => 'integer',
            'unique_amount' => 'integer',
            'total_amount' => 'integer',
            'payment_deadline' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_FAILED = 'failed';

    public static function generateCode(): string
    {
        return 'TRX' . strtoupper(Str::random(6));
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function ticketCodes(): HasMany
    {
        return $this->hasMany(TicketCode::class);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function hasPassedDeadline(): bool
    {
        return $this->payment_deadline && $this->payment_deadline->isPast();
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeExpired($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('payment_deadline', '<', now());
    }

    protected static function booted(): void
    {
        static::creating(function (Transaction $transaction) {
            if (empty($transaction->code)) {
                $transaction->code = self::generateCode();
            }
        });
    }
}
