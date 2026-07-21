<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketCode;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    $this->ticket = Ticket::create([
        'event_id' => $this->event->id,
        'name' => 'VIP Ticket',
        'price' => 150000,
        'quantity' => 100,
    ]);

    $this->transaction = Transaction::create([
        'event_id' => $this->event->id,
        'name' => 'Buyer',
        'email' => 'buyer@example.com',
        'status' => Transaction::STATUS_PAID,
        'paid_at' => now(),
    ]);

    $this->transactionItem = TransactionItem::create([
        'transaction_id' => $this->transaction->id,
        'ticket_id' => $this->ticket->id,
        'quantity' => 2,
        'price_at_purchase' => 150000,
        'subtotal' => 300000,
    ]);
});

describe('TicketCode Model', function () {
    it('can create a ticket code', function () {
        $ticketCode = TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
            'code' => 'TIX123456',
        ]);

        expect($ticketCode->id)->toBeTruthy();
        expect($ticketCode->code)->toBe('TIX123456');
    });

    it('auto-generates code on create', function () {
        $ticketCode = TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
        ]);

        expect($ticketCode->code)->toBeTruthy();
        expect(str_starts_with($ticketCode->code, 'TIX'))->toBeTrue();
    });

    it('belongs to transaction item', function () {
        $ticketCode = TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
            'code' => 'TIXTEST01',
        ]);

        expect($ticketCode->transactionItem)->toBeInstanceOf(TransactionItem::class);
    });

    it('has default is_redeemed as false', function () {
        $ticketCode = TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
        ]);

        expect($ticketCode->fresh()->is_redeemed)->toBeFalse();
    });

    it('can redeem ticket', function () {
        $redeemer = User::create([
            'name' => 'Redeemer',
            'email' => 'redeemer_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);

        $ticketCode = TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
        ]);

        $ticketCode->redeem($redeemer);

        expect($ticketCode->fresh()->is_redeemed)->toBeTrue();
        expect($ticketCode->fresh()->redeemed_at)->toBeTruthy();
        expect($ticketCode->fresh()->redeemed_by)->toBe($redeemer->id);
    });

    it('isRedeemed returns correct status', function () {
        $ticketCode = TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
            'is_redeemed' => true,
            'redeemed_at' => now(),
        ]);

        expect($ticketCode->isRedeemed())->toBeTrue();
    });

    it('has unique codes', function () {
        TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
            'code' => 'TIXUNIQUE1',
        ]);

        expect(fn () => TicketCode::create([
            'transaction_item_id' => $this->transactionItem->id,
            'code' => 'TIXUNIQUE1',
        ]))->toThrow(\Illuminate\Database\QueryException::class);
    });
});
