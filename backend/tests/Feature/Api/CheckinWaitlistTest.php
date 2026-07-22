<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketCode;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Waitlist;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
        \Database\Seeders\CategorySeeder::class,
    ]);

    $category = Category::first();

    $this->admin = User::factory()->create(['email' => 'admin@test.com']);
    $this->admin->roles()->sync(Role::where('name', Role::SUPER_ADMIN)->first()->id);
    $this->adminToken = auth('api')->login($this->admin);
    Organizer::factory()->create(['user_id' => $this->admin->id]);

    $this->organizer = User::factory()->create(['email' => 'org@test.com']);
    $this->organizer->roles()->sync(Role::where('name', Role::ORGANIZER)->first()->id);
    $this->organizerToken = auth('api')->login($this->organizer);
    $this->orgProfile = Organizer::factory()->create(['user_id' => $this->organizer->id]);

    $this->otherOrg = User::factory()->create();
    $this->otherOrg->roles()->sync(Role::where('name', Role::ORGANIZER)->first()->id);
    $this->otherOrgToken = auth('api')->login($this->otherOrg);
    $this->otherOrgProfile = Organizer::factory()->create(['user_id' => $this->otherOrg->id]);

    $this->attendee = User::factory()->create(['email' => 'att@test.com']);
    $this->attendee->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
    $this->attendeeToken = auth('api')->login($this->attendee);

    $this->event = Event::factory()->create([
        'organizer_id' => $this->orgProfile->id,
        'category_id' => $category->id,
        'status' => Event::STATUS_PUBLISHED,
    ]);

    $this->otherEvent = Event::factory()->create([
        'organizer_id' => $this->otherOrgProfile->id,
        'category_id' => $category->id,
        'status' => Event::STATUS_PUBLISHED,
    ]);

    $this->ticket = Ticket::factory()->create([
        'event_id' => $this->event->id,
        'price' => 50000,
        'quantity' => 100,
    ]);

    $tx = Transaction::create([
        'event_id' => $this->event->id,
        'buyer_user_id' => $this->attendee->id,
        'name' => 'Attendee',
        'email' => 'att@test.com',
        'status' => Transaction::STATUS_PAID,
        'total_amount' => 50000,
        'paid_at' => now(),
    ]);
    $item = $tx->items()->create([
        'ticket_id' => $this->ticket->id,
        'quantity' => 2,
        'price_at_purchase' => 50000,
        'subtotal' => 100000,
    ]);
    $this->ticketCode1 = $item->ticketCodes()->create([]);
    $this->ticketCode2 = $item->ticketCodes()->create([]);
});

describe('User Tickets', function () {
    it('lists own tickets', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->getJson('/api/tickets')
            ->assertOk()
            ->assertJsonCount(2, 'data.data');
    });

    it('shows own ticket detail', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->getJson('/api/tickets/' . $this->ticketCode1->code)
            ->assertOk()
            ->assertJsonPath('data.code', $this->ticketCode1->code);
    });

    it('returns 404 for other user ticket', function () {
        $other = User::factory()->create();
        $other->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
        $otherToken = auth('api')->login($other);

        $this->withHeader('Authorization', "Bearer $otherToken")
            ->getJson('/api/tickets/' . $this->ticketCode1->code)
            ->assertNotFound();
    });
});

describe('Check-in', function () {
    it('verifies valid ticket', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/checkin/verify', ['code' => $this->ticketCode1->code])
            ->assertOk()
            ->assertJsonPath('data.valid', true);
    });

    it('verifies with QR prefix', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/checkin/verify', ['code' => 'TICKETY:' . $this->ticketCode1->code])
            ->assertOk()
            ->assertJsonPath('data.valid', true);
    });

    it('redeems a ticket', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/checkin/redeem', ['code' => $this->ticketCode1->code])
            ->assertOk()
            ->assertJsonPath('message', 'Ticket redeemed successfully');

        expect($this->ticketCode1->fresh()->is_redeemed)->toBeTrue();
    });

    it('prevents double redeem', function () {
        $this->ticketCode1->redeem($this->admin);

        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/checkin/redeem', ['code' => $this->ticketCode1->code])
            ->assertStatus(409);
    });

    it('allows organizer to checkin own event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->postJson('/api/checkin/redeem', ['code' => $this->ticketCode1->code])
            ->assertOk();
    });

    it('forbids organizer checkin on other event', function () {
        $otherTx = Transaction::create([
            'event_id' => $this->otherEvent->id,
            'buyer_user_id' => $this->attendee->id,
            'name' => 'Attendee',
            'email' => 'att@test.com',
            'status' => Transaction::STATUS_PAID,
            'total_amount' => 50000,
            'paid_at' => now(),
        ]);
        $otherItem = $otherTx->items()->create([
            'ticket_id' => $this->ticket->id,
            'quantity' => 1,
            'price_at_purchase' => 50000,
            'subtotal' => 50000,
        ]);
        $otherCode = $otherItem->ticketCodes()->create([]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->postJson('/api/checkin/redeem', ['code' => $otherCode->code])
            ->assertForbidden();
    });

    it('forbids attendee from checkin', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/checkin/verify', ['code' => $this->ticketCode1->code])
            ->assertForbidden();
    });
});

describe('Waitlist', function () {
    beforeEach(function () {
        $this->soldOutTicket = Ticket::factory()->create([
            'event_id' => $this->event->id,
            'quantity' => 10,
            'sold_count' => 10,
        ]);
    });

    it('joins waitlist when sold out', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/waitlist', ['ticket_id' => $this->soldOutTicket->id])
            ->assertCreated()
            ->assertJsonPath('message', 'Joined waitlist');

        expect(Waitlist::count())->toBe(1);
    });

    it('cannot join when ticket available', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/waitlist', ['ticket_id' => $this->ticket->id])
            ->assertStatus(400);
    });

    it('cannot join waitlist twice', function () {
        Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->soldOutTicket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/waitlist', ['ticket_id' => $this->soldOutTicket->id])
            ->assertStatus(409);
    });

    it('lists own waitlist', function () {
        Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->soldOutTicket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->getJson('/api/waitlist')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('leaves waitlist', function () {
        $wl = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->soldOutTicket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->deleteJson('/api/waitlist/' . $wl->id)
            ->assertNoContent();

        expect($wl->fresh()->trashed())->toBeTrue();
    });

    it('claims ticket when notified', function () {
        $wl = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->soldOutTicket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_NOTIFIED,
            'notified_at' => now(),
            'expires_at' => now()->addHours(24),
        ]);

        // Restore stock so claim can proceed
        $this->soldOutTicket->decrementSoldCount(1);

        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/waitlist/' . $wl->id . '/claim')
            ->assertCreated()
            ->assertJsonStructure(['data' => ['transaction_code', 'total_amount']]);

        expect($wl->fresh()->status)->toBe(Waitlist::STATUS_CLAIMED);
    });

    it('cannot claim when not notified', function () {
        $wl = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->soldOutTicket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/waitlist/' . $wl->id . '/claim')
            ->assertStatus(400);
    });
});
