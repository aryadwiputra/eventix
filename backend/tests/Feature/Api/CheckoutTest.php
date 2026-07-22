<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\User;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
        \Database\Seeders\CategorySeeder::class,
    ]);

    $this->attendee = User::factory()->create(['email' => 'buyer@test.com']);
    $this->attendee->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
    $this->attendeeToken = auth('api')->login($this->attendee);

    $this->event = Event::factory()->create([
        'category_id' => Category::first()->id,
        'status' => Event::STATUS_PUBLISHED,
    ]);

    $this->ticket = Ticket::factory()->create([
        'event_id' => $this->event->id,
        'price' => 100000,
        'quantity' => 100,
        'sold_count' => 0,
    ]);

    $this->ticket2 = Ticket::factory()->create([
        'event_id' => $this->event->id,
        'name' => 'VVIP',
        'price' => 500000,
        'quantity' => 10,
        'sold_count' => 0,
    ]);
});

describe('Checkout', function () {
    it('creates a transaction', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/checkout', [
                'event_id' => $this->event->id,
                'items' => [
                    ['ticket_id' => $this->ticket->id, 'quantity' => 2],
                    ['ticket_id' => $this->ticket2->id, 'quantity' => 1],
                ],
                'name' => 'Buyer',
                'email' => 'buyer@test.com',
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['code', 'total_amount', 'payment_deadline']]);

        expect(Transaction::count())->toBe(1);
        expect(Transaction::first()->items)->toHaveCount(2);
        expect(Transaction::first()->total_amount)->toBe(700000);
        expect(Transaction::first()->status)->toBe(Transaction::STATUS_PENDING);
    });

    it('validates stock availability', function () {
        $this->ticket->update(['quantity' => 5, 'sold_count' => 5]);

        $response = $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/checkout', [
                'event_id' => $this->event->id,
                'items' => [
                    ['ticket_id' => $this->ticket->id, 'quantity' => 1],
                ],
                'name' => 'Buyer',
                'email' => 'buyer@test.com',
            ]);

        $response->assertStatus(400);
    });

    it('rejects unpublished event', function () {
        $this->event->update(['status' => Event::STATUS_DRAFT]);

        $response = $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/checkout', [
                'event_id' => $this->event->id,
                'items' => [
                    ['ticket_id' => $this->ticket->id, 'quantity' => 1],
                ],
                'name' => 'Buyer',
                'email' => 'buyer@test.com',
            ]);

        $response->assertStatus(400);
    });

    it('rejects inactive ticket', function () {
        $this->ticket->update(['is_active' => false]);

        $response = $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/checkout', [
                'event_id' => $this->event->id,
                'items' => [
                    ['ticket_id' => $this->ticket->id, 'quantity' => 1],
                ],
                'name' => 'Buyer',
                'email' => 'buyer@test.com',
            ]);

        $response->assertStatus(400);
    });

    it('requires authentication', function () {
        $this->postJson('/api/checkout', [
            'event_id' => $this->event->id,
            'items' => [['ticket_id' => $this->ticket->id, 'quantity' => 1]],
            'name' => 'Buyer',
            'email' => 'buyer@test.com',
        ])->assertUnauthorized();
    });

    it('returns 404 for other user transaction', function () {
        $other = User::factory()->create();
        $other->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
        $otherToken = auth('api')->login($other);

        $tx = Transaction::create([
            'event_id' => $this->event->id,
            'buyer_user_id' => $other->id,
            'name' => 'Other',
            'email' => 'other@test.com',
            'status' => Transaction::STATUS_PENDING,
            'total_amount' => 100000,
        ]);

        $response = $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->getJson("/api/checkout/{$tx->code}");

        $response->assertNotFound();
    });
});

describe('Webhook', function () {
    it('handles payment success', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'buyer_user_id' => $this->attendee->id,
            'name' => 'Buyer',
            'email' => 'buyer@test.com',
            'status' => Transaction::STATUS_PENDING,
            'total_amount' => 200000,
            'midtrans_order_id' => Transaction::generateCode(),
            'payment_deadline' => now()->addHours(24),
        ]);

        $transaction->items()->create([
            'ticket_id' => $this->ticket->id,
            'quantity' => 2,
            'price_at_purchase' => $this->ticket->price,
            'subtotal' => 200000,
        ]);

        $response = $this->postJson('/api/webhooks/midtrans', [
            'order_id' => $transaction->midtrans_order_id,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'status_code' => '200',
            'gross_amount' => '200000',
            'payment_type' => 'bank_transfer',
            'signature_key' => '',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Payment success');

        $transaction->refresh();
        expect($transaction->status)->toBe(Transaction::STATUS_PAID);
        expect($transaction->ticketCodes)->toHaveCount(2);
        expect($this->ticket->fresh()->sold_count)->toBe(2);
    });

    it('handles payment failure', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'buyer_user_id' => $this->attendee->id,
            'name' => 'Buyer',
            'email' => 'buyer@test.com',
            'status' => Transaction::STATUS_PENDING,
            'total_amount' => 100000,
            'midtrans_order_id' => Transaction::generateCode(),
            'payment_deadline' => now()->addHours(24),
        ]);

        $response = $this->postJson('/api/webhooks/midtrans', [
            'order_id' => $transaction->midtrans_order_id,
            'transaction_status' => 'expire',
            'fraud_status' => 'accept',
            'status_code' => '200',
            'gross_amount' => '100000',
            'payment_type' => 'bank_transfer',
            'signature_key' => '',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Payment failed');

        expect($transaction->fresh()->status)->toBe(Transaction::STATUS_FAILED);
    });

    it('ignores duplicate notification', function () {
        $transaction = Transaction::create([
            'event_id' => $this->event->id,
            'buyer_user_id' => $this->attendee->id,
            'name' => 'Buyer',
            'email' => 'buyer@test.com',
            'status' => Transaction::STATUS_PAID,
            'total_amount' => 100000,
            'midtrans_order_id' => Transaction::generateCode(),
            'payment_deadline' => now()->addHours(24),
        ]);

        $response = $this->postJson('/api/webhooks/midtrans', [
            'order_id' => $transaction->midtrans_order_id,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'status_code' => '200',
            'gross_amount' => '100000',
            'payment_type' => 'bank_transfer',
            'signature_key' => '',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Already processed');
    });
});
