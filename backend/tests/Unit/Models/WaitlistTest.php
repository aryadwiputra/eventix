<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Waitlist;
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
        'name' => 'Sold Out Ticket',
        'price' => 50000,
        'quantity' => 0,
    ]);

    $this->attendee = User::create([
        'name' => 'Attendee',
        'email' => 'attendee_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

describe('Waitlist Model', function () {
    it('can create a waitlist entry', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        expect($waitlist->id)->toBeTruthy();
        expect($waitlist->status)->toBe(Waitlist::STATUS_WAITING);
    });

    it('belongs to event', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        expect($waitlist->event)->toBeInstanceOf(Event::class);
    });

    it('belongs to ticket', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        expect($waitlist->ticket)->toBeInstanceOf(Ticket::class);
    });

    it('belongs to user', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        expect($waitlist->user)->toBeInstanceOf(User::class);
    });

    it('has unique combination of ticket and user', function () {
        Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        expect(fn () => Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]))->toThrow(\Illuminate\Database\QueryException::class);
    });

    it('isWaiting returns correct status', function () {
        $waiting = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        expect($waiting->isWaiting())->toBeTrue();
        expect($waiting->isNotified())->toBeFalse();
    });

    it('notify changes status and sets expiry', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $waitlist->notify();

        expect($waitlist->fresh()->status)->toBe(Waitlist::STATUS_NOTIFIED);
        expect($waitlist->fresh()->notified_at)->toBeTruthy();
        expect($waitlist->fresh()->expires_at)->toBeTruthy();
    });

    it('isNotified returns true after notify', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $waitlist->notify();

        expect($waitlist->fresh()->isNotified())->toBeTrue();
    });

    it('claim changes status and records time', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_NOTIFIED,
            'notified_at' => now(),
        ]);

        $waitlist->claim();

        expect($waitlist->fresh()->status)->toBe(Waitlist::STATUS_CLAIMED);
        expect($waitlist->fresh()->claimed_at)->toBeTruthy();
    });

    it('markExpired changes status', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_NOTIFIED,
            'notified_at' => now(),
            'expires_at' => now()->subHour(),
        ]);

        $waitlist->markExpired();

        expect($waitlist->fresh()->status)->toBe(Waitlist::STATUS_EXPIRED);
    });

    it('hasExpired returns true when past expires_at', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_NOTIFIED,
            'notified_at' => now()->subDays(2),
            'expires_at' => now()->subDay(),
        ]);

        expect($waitlist->hasExpired())->toBeTrue();
    });

    it('scopeWaiting returns only waiting entries', function () {
        Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $waiting = Waitlist::waiting()->get();

        expect($waiting->every(fn ($w) => $w->status === Waitlist::STATUS_WAITING))->toBeTrue();
    });

    it('uses soft deletes', function () {
        $waitlist = Waitlist::create([
            'event_id' => $this->event->id,
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->attendee->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        $waitlistId = $waitlist->id;
        $waitlist->delete();

        expect(Waitlist::find($waitlistId))->toBeNull();
        expect(Waitlist::withTrashed()->find($waitlistId))->toBeTruthy();
    });
});
