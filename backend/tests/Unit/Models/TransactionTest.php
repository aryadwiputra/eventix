<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
    ]);

    $user = User::create([
        'name' => 'Organizer',
        'email' => 'organizer_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
    $user->roles()->attach(Role::where('name', Role::ORGANIZER)->first()->id);

    $this->organizer = Organizer::create([
        'user_id' => $user->id,
        'company_name' => 'Test Company',
    ]);

    $this->event = Event::create([
        'organizer_id' => $this->organizer->id,
        'name' => 'Test Event',
        'start_time' => now()->addDays(7),
        'type' => Event::TYPE_OFFLINE,
        'status' => Event::STATUS_PUBLISHED,
    ]);
});

describe('Transaction Model', function () {
    it('can create a transaction', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'status' => Transaction::STATUS_PENDING,
            'fee_amount' => 2500,
            'unique_amount' => 123,
            'total_amount' => 152623,
            'payment_deadline' => now()->addHours(24),
        ]);

        expect($transaction->id)->toBeTruthy();
        expect($transaction->name)->toBe('John Doe');
    });

    it('auto-generates code on create', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        expect($transaction->code)->toBeTruthy();
        expect(str_starts_with($transaction->code, 'TRX'))->toBeTrue();
        expect(strlen($transaction->code))->toBe(9);
    });

    it('belongs to event', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Event Buyer',
            'email' => 'buyer@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        expect($transaction->event)->toBeInstanceOf(Event::class);
    });

    it('belongs to buyer user', function () {
        $buyer = User::create([
            'name' => 'Buyer User',
            'email' => 'buyer_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);

        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'buyer_user_id' => $buyer->id,
            'name' => 'Buyer User',
            'email' => 'buyer@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        expect($transaction->buyer)->toBeInstanceOf(User::class);
    });

    it('has many items', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Multi Item Buyer',
            'email' => 'multi@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        expect($transaction->items)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('isPending returns correct status', function () {
        $pendingTransaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Pending Buyer',
            'email' => 'pending@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        $paidTransaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Paid Buyer',
            'email' => 'paid@example.com',
            'status' => Transaction::STATUS_PAID,
            'paid_at' => now(),
        ]);

        expect($pendingTransaction->isPending())->toBeTrue();
        expect($paidTransaction->isPending())->toBeFalse();
    });

    it('isPaid returns correct status', function () {
        $paidTransaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Paid Buyer',
            'email' => 'paid2@example.com',
            'status' => Transaction::STATUS_PAID,
            'paid_at' => now(),
        ]);

        expect($paidTransaction->isPaid())->toBeTrue();
    });

    it('hasPassedDeadline returns true for expired transactions', function () {
        $expiredTransaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Expired Buyer',
            'email' => 'expired@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->subHours(1),
        ]);

        expect($expiredTransaction->hasPassedDeadline())->toBeTrue();
    });

    it('hasPassedDeadline returns false for valid transactions', function () {
        $validTransaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Valid Buyer',
            'email' => 'valid@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        expect($validTransaction->hasPassedDeadline())->toBeFalse();
    });

    it('scopePending returns only pending transactions', function () {
        Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Pending',
            'email' => 'scope1@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'Paid',
            'email' => 'scope2@example.com',
            'status' => Transaction::STATUS_PAID,
            'paid_at' => now(),
        ]);

        $pending = Transaction::pending()->get();

        expect($pending->first()->status)->toBe(Transaction::STATUS_PENDING);
    });

    it('uses soft deletes', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'name' => 'To Delete',
            'email' => 'delete@example.com',
            'status' => Transaction::STATUS_PENDING,
            'payment_deadline' => now()->addHours(24),
        ]);

        $transactionId = $transaction->id;
        $transaction->delete();

        expect(Transaction::find($transactionId))->toBeNull();
        expect(Transaction::withTrashed()->find($transactionId))->toBeTruthy();
    });

    it('generates unique code', function () {
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = Transaction::generateCode();
        }

        $uniqueCodes = array_unique($codes);

        expect(count($codes))->toBe(count($uniqueCodes));
    });
});
