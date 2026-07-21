<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\Ticket;
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
});

describe('Ticket Model', function () {
    it('can create a ticket', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'VIP Ticket',
            'price' => 150000,
            'quantity' => 100,
            'max_per_transaction' => 5,
        ]);

        expect($ticket->id)->toBeTruthy();
        expect($ticket->name)->toBe('VIP Ticket');
        expect($ticket->price)->toBe(150000);
    });

    it('belongs to event', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Regular Ticket',
            'price' => 50000,
            'quantity' => 200,
        ]);

        expect($ticket->event)->toBeInstanceOf(Event::class);
        expect($ticket->event->id)->toBe($this->event->id);
    });

    it('has default sold_count of 0', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'New Ticket',
            'price' => 75000,
            'quantity' => 50,
        ]);

        expect($ticket->fresh()->sold_count)->toBe(0);
    });

    it('calculates available quantity correctly', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Available Ticket',
            'price' => 100000,
            'quantity' => 100,
            'sold_count' => 30,
        ]);

        expect($ticket->available_quantity)->toBe(70);
    });

    it('isSoldOut returns true when quantity equals sold_count', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Sold Out Ticket',
            'price' => 100000,
            'quantity' => 50,
            'sold_count' => 50,
        ]);

        expect($ticket->isSoldOut())->toBeTrue();
    });

    it('isSoldOut returns false when quantity greater than sold_count', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Available Ticket',
            'price' => 100000,
            'quantity' => 50,
            'sold_count' => 30,
        ]);

        expect($ticket->isSoldOut())->toBeFalse();
    });

    it('hasEnoughStock returns true when stock is sufficient', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Stock Ticket',
            'price' => 100000,
            'quantity' => 100,
            'sold_count' => 50,
        ]);

        expect($ticket->hasEnoughStock(30))->toBeTrue();
        expect($ticket->hasEnoughStock(50))->toBeTrue();
    });

    it('hasEnoughStock returns false when stock is insufficient', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Limited Stock Ticket',
            'price' => 100000,
            'quantity' => 100,
            'sold_count' => 90,
        ]);

        expect($ticket->hasEnoughStock(15))->toBeFalse();
    });

    it('can increment sold_count', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Increment Ticket',
            'price' => 100000,
            'quantity' => 100,
            'sold_count' => 10,
        ]);

        $ticket->incrementSoldCount(5);

        expect($ticket->fresh()->sold_count)->toBe(15);
    });

    it('can decrement sold_count', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Decrement Ticket',
            'price' => 100000,
            'quantity' => 100,
            'sold_count' => 20,
        ]);

        $ticket->decrementSoldCount(5);

        expect($ticket->fresh()->sold_count)->toBe(15);
    });

    it('has transaction items', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Transaction Ticket',
            'price' => 100000,
            'quantity' => 100,
        ]);

        expect($ticket->transactionItems)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('has waitlists', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Waitlist Ticket',
            'price' => 100000,
            'quantity' => 0,
            'sold_count' => 0,
        ]);

        expect($ticket->waitlists)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('uses soft deletes', function () {
        $ticket = Ticket::create([
            'event_id' => $this->event->id,
            'name' => 'Delete Ticket',
            'price' => 100000,
            'quantity' => 100,
        ]);

        $ticketId = $ticket->id;
        $ticket->delete();

        expect(Ticket::find($ticketId))->toBeNull();
        expect(Ticket::withTrashed()->find($ticketId))->toBeTruthy();
    });
});
