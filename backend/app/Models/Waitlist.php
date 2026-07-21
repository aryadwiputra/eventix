<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Waitlist extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'ticket_id',
        'user_id',
        'status',
        'notified_at',
        'claimed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
            'claimed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public const STATUS_WAITING = 'waiting';
    public const STATUS_NOTIFIED = 'notified';
    public const STATUS_CLAIMED = 'claimed';
    public const STATUS_EXPIRED = 'expired';

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isWaiting(): bool
    {
        return $this->status === self::STATUS_WAITING;
    }

    public function isNotified(): bool
    {
        return $this->status === self::STATUS_NOTIFIED;
    }

    public function isClaimed(): bool
    {
        return $this->status === self::STATUS_CLAIMED;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED;
    }

    public function hasExpired(): bool
    {
        return $this->isNotified() && $this->expires_at && $this->expires_at->isPast();
    }

    public function notify(): void
    {
        $this->update([
            'status' => self::STATUS_NOTIFIED,
            'notified_at' => now(),
            'expires_at' => now()->addHours(24),
        ]);
    }

    public function claim(): void
    {
        $this->update([
            'status' => self::STATUS_CLAIMED,
            'claimed_at' => now(),
        ]);
    }

    public function markExpired(): void
    {
        $this->update([
            'status' => self::STATUS_EXPIRED,
        ]);
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', self::STATUS_WAITING);
    }

    public function scopeNotified($query)
    {
        return $query->where('status', self::STATUS_NOTIFIED);
    }
}
