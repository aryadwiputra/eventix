<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
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

    // Seed events
    $this->publishedEvent = Event::factory()->create([
        'organizer_id' => $this->orgProfile->id,
        'category_id' => $category->id,
        'name' => 'Published Event',
        'status' => Event::STATUS_PUBLISHED,
    ]);
    $this->draftEvent = Event::factory()->create([
        'organizer_id' => $this->orgProfile->id,
        'category_id' => $category->id,
        'name' => 'Draft Event',
        'status' => Event::STATUS_DRAFT,
    ]);
    $this->otherEvent = Event::factory()->create([
        'organizer_id' => $this->otherOrgProfile->id,
        'category_id' => $category->id,
        'name' => 'Other Org Event',
        'status' => Event::STATUS_PUBLISHED,
    ]);
});

describe('Public - Events', function () {
    it('lists published events', function () {
        $this->getJson('/api/events')
            ->assertOk()
            ->assertJsonCount(2, 'data.data');
    });

    it('shows published event detail', function () {
        $this->getJson('/api/events/' . $this->publishedEvent->id)
            ->assertOk()
            ->assertJsonPath('data.name', 'Published Event');
    });

    it('returns 404 for draft event', function () {
        $this->getJson('/api/events/' . $this->draftEvent->id)
            ->assertNotFound();
    });

    it('filters by category', function () {
        $category = Category::first();
        $this->getJson('/api/events?category_id=' . $category->id)
            ->assertOk();
    });

    it('filters by type', function () {
        $this->getJson('/api/events?type=offline')
            ->assertOk();
    });

    it('searches by name', function () {
        $this->getJson('/api/events?search=Published')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');
    });
});

describe('Organizer - Events', function () {
    it('lists own events including drafts', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->getJson('/api/admin/events')
            ->assertOk()
            ->assertJsonCount(2, 'data.data');
    });

    it('creates an event', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->postJson('/api/admin/events', [
                'name' => 'New Event',
                'start_time' => now()->addMonth()->format('Y-m-d H:i:s'),
                'type' => 'offline',
                'location' => 'Jakarta',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'New Event')
            ->assertJsonPath('data.organizer_id', $this->orgProfile->id);
    });

    it('updates own event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->putJson('/api/admin/events/' . $this->publishedEvent->id, [
                'name' => 'Updated Name',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    });

    it('deletes own event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->deleteJson('/api/admin/events/' . $this->draftEvent->id)
            ->assertNoContent();

        $this->assertSoftDeleted($this->draftEvent);
    });

    it('cannot update other organizer event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->putJson('/api/admin/events/' . $this->otherEvent->id, ['name' => 'Hack'])
            ->assertForbidden();
    });

    it('cannot delete other organizer event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->deleteJson('/api/admin/events/' . $this->otherEvent->id)
            ->assertForbidden();
    });
});

describe('Admin - Events', function () {
    it('lists all events', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson('/api/admin/events')
            ->assertOk()
            ->assertJsonCount(3, 'data.data');
    });

    it('creates event with custom organizer', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/admin/events', [
                'name' => 'Admin Event',
                'start_time' => now()->addMonth()->format('Y-m-d H:i:s'),
                'type' => 'online',
                'meeting_link' => 'https://zoom.us/test',
                'organizer_id' => $this->otherOrgProfile->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.organizer_id', $this->otherOrgProfile->id);
    });

    it('updates any event', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->putJson('/api/admin/events/' . $this->otherEvent->id, [
                'is_popular' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_popular', true);
    });

    it('deletes any event', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->deleteJson('/api/admin/events/' . $this->otherEvent->id)
            ->assertNoContent();

        $this->assertSoftDeleted($this->otherEvent);
    });

    it('shows any event including draft', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson('/api/admin/events/' . $this->draftEvent->id)
            ->assertOk()
            ->assertJsonPath('data.status', Event::STATUS_DRAFT);
    });
});

describe('Auth - Events', function () {
    it('rejects unauthenticated POST', function () {
        $this->postJson('/api/admin/events', ['name' => 'Test'])
            ->assertUnauthorized();
    });

    it('forbids attendee from creating events', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/admin/events', ['name' => 'Test'])
            ->assertForbidden();
    });
});
