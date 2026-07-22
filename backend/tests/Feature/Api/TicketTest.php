<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\User;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
        \Database\Seeders\CategorySeeder::class,
    ]);

    $category = Category::first();

    // Admin
    $this->admin = User::factory()->create(['email' => 'admin@test.com']);
    $this->admin->roles()->sync(Role::where('name', Role::SUPER_ADMIN)->first()->id);
    $this->adminToken = auth('api')->login($this->admin);
    Organizer::factory()->create(['user_id' => $this->admin->id]);

    // Organizer
    $this->organizer = User::factory()->create(['email' => 'org@test.com']);
    $this->organizer->roles()->sync(Role::where('name', Role::ORGANIZER)->first()->id);
    $this->organizerToken = auth('api')->login($this->organizer);
    $this->orgProfile = Organizer::factory()->create([
        'user_id' => $this->organizer->id,
        'company_name' => 'Org Co',
    ]);

    // Other organizer
    $this->otherOrg = User::factory()->create();
    $this->otherOrg->roles()->sync(Role::where('name', Role::ORGANIZER)->first()->id);
    $this->otherOrgToken = auth('api')->login($this->otherOrg);
    $this->otherOrgProfile = Organizer::factory()->create([
        'user_id' => $this->otherOrg->id,
        'company_name' => 'Other Org',
    ]);

    // Attendee
    $this->attendee = User::factory()->create(['email' => 'att@test.com']);
    $this->attendee->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
    $this->attendeeToken = auth('api')->login($this->attendee);

    // Events
    $this->event = Event::factory()->create([
        'organizer_id' => $this->orgProfile->id,
        'category_id' => $category->id,
        'name' => 'Test Event',
        'status' => Event::STATUS_PUBLISHED,
    ]);
    $this->otherEvent = Event::factory()->create([
        'organizer_id' => $this->otherOrgProfile->id,
        'category_id' => $category->id,
        'name' => 'Other Event',
        'status' => Event::STATUS_PUBLISHED,
    ]);
});

describe('Organizer - Tickets', function () {
    it('lists tickets of own event', function () {
        Ticket::factory()->count(3)->create(['event_id' => $this->event->id]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->getJson("/api/admin/events/{$this->event->id}/tickets")
            ->assertOk()
            ->assertJsonCount(3, 'data.data');
    });

    it('creates a ticket', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->postJson("/api/admin/events/{$this->event->id}/tickets", [
                'name' => 'VIP Ticket',
                'price' => 200000,
                'quantity' => 100,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'VIP Ticket')
            ->assertJsonPath('data.price', 200000)
            ->assertJsonPath('data.event_id', $this->event->id);
    });

    it('shows a ticket', function () {
        $ticket = Ticket::factory()->create([
            'event_id' => $this->event->id,
            'name' => 'Gold Ticket',
        ]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->getJson("/api/admin/events/{$this->event->id}/tickets/{$ticket->id}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Gold Ticket');
    });

    it('updates a ticket', function () {
        $ticket = Ticket::factory()->create([
            'event_id' => $this->event->id,
            'price' => 100000,
        ]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->putJson("/api/admin/events/{$this->event->id}/tickets/{$ticket->id}", [
                'price' => 150000,
            ])
            ->assertOk()
            ->assertJsonPath('data.price', 150000);
    });

    it('deletes a ticket', function () {
        $ticket = Ticket::factory()->create(['event_id' => $this->event->id]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->deleteJson("/api/admin/events/{$this->event->id}/tickets/{$ticket->id}")
            ->assertNoContent();

        $this->assertSoftDeleted($ticket);
    });

    it('cannot list tickets of other organizer event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->getJson("/api/admin/events/{$this->otherEvent->id}/tickets")
            ->assertForbidden();
    });

    it('cannot create ticket for other organizer event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->postJson("/api/admin/events/{$this->otherEvent->id}/tickets", [
                'name' => 'Hack Ticket',
                'price' => 0,
                'quantity' => 1,
            ])
            ->assertForbidden();
    });

    it('cannot update ticket of other organizer event', function () {
        $ticket = Ticket::factory()->create(['event_id' => $this->otherEvent->id]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->putJson("/api/admin/events/{$this->otherEvent->id}/tickets/{$ticket->id}", [
                'name' => 'Hacked',
            ])
            ->assertForbidden();
    });

    it('cannot delete ticket of other organizer event', function () {
        $ticket = Ticket::factory()->create(['event_id' => $this->otherEvent->id]);

        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->deleteJson("/api/admin/events/{$this->otherEvent->id}/tickets/{$ticket->id}")
            ->assertForbidden();
    });
});

describe('Admin - Tickets', function () {
    it('lists tickets of any event', function () {
        Ticket::factory()->count(2)->create(['event_id' => $this->event->id]);
        Ticket::factory()->count(3)->create(['event_id' => $this->otherEvent->id]);

        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson("/api/admin/events/{$this->event->id}/tickets")
            ->assertOk()
            ->assertJsonCount(2, 'data.data');
    });

    it('shows any ticket', function () {
        $ticket = Ticket::factory()->create(['event_id' => $this->otherEvent->id]);

        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson("/api/admin/events/{$this->otherEvent->id}/tickets/{$ticket->id}")
            ->assertOk();
    });

    it('creates ticket for any event', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson("/api/admin/events/{$this->otherEvent->id}/tickets", [
                'name' => 'Admin Ticket',
                'price' => 50000,
                'quantity' => 50,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Admin Ticket');
    });

    it('updates any ticket', function () {
        $ticket = Ticket::factory()->create(['event_id' => $this->otherEvent->id]);

        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->putJson("/api/admin/events/{$this->otherEvent->id}/tickets/{$ticket->id}", [
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
    });

    it('deletes any ticket', function () {
        $ticket = Ticket::factory()->create(['event_id' => $this->otherEvent->id]);

        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->deleteJson("/api/admin/events/{$this->otherEvent->id}/tickets/{$ticket->id}")
            ->assertNoContent();

        $this->assertSoftDeleted($ticket);
    });
});

describe('Auth - Tickets', function () {
    it('rejects unauthenticated requests', function () {
        $this->getJson("/api/admin/events/{$this->event->id}/tickets")
            ->assertUnauthorized();
        $this->postJson("/api/admin/events/{$this->event->id}/tickets")
            ->assertUnauthorized();
    });

    it('forbids attendee from managing tickets', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->getJson("/api/admin/events/{$this->event->id}/tickets")
            ->assertForbidden();
    });
});
