<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\CategorySeeder::class,
    ]);

    // Create organizer
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

    $this->category = Category::first();
});

describe('Event Model', function () {
    it('can create an event', function () {
        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Test Event',
            'slug' => 'test-event',
            'start_time' => now()->addDays(7),
            'location' => 'Jakarta',
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        expect($event->id)->toBeTruthy();
        expect($event->name)->toBe('Test Event');
    });

    it('auto-generates slug if empty', function () {
        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Auto Slug Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        expect($event->slug)->toBeTruthy();
        expect(str_contains($event->slug, 'auto-slug-event'))->toBeTrue();
    });

    it('belongs to organizer', function () {
        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Event with Organizer',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        expect($event->organizer)->toBeInstanceOf(Organizer::class);
        expect($event->organizer->id)->toBe($this->organizer->id);
    });

    it('belongs to category', function () {
        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Event with Category',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        expect($event->category)->toBeInstanceOf(Category::class);
        expect($event->category->id)->toBe($this->category->id);
    });

    it('has many tickets', function () {
        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Event with Tickets',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        expect($event->tickets)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('isPublished returns correct status', function () {
        $draftEvent = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Draft Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        $publishedEvent = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Published Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_PUBLISHED,
        ]);

        expect($draftEvent->isPublished())->toBeFalse();
        expect($publishedEvent->isPublished())->toBeTrue();
    });

    it('scopePublished returns only published events', function () {
        Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Draft Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Published Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_PUBLISHED,
        ]);

        $publishedEvents = Event::published()->get();

        expect($publishedEvents)->toHaveCount(1);
        expect($publishedEvents->first()->name)->toBe('Published Event');
    });

    it('scopePopular returns only popular events', function () {
        Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Popular Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_PUBLISHED,
            'is_popular' => true,
        ]);

        Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Regular Event',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_PUBLISHED,
            'is_popular' => false,
        ]);

        $popularEvents = Event::popular()->get();

        expect($popularEvents)->toHaveCount(1);
        expect($popularEvents->first()->name)->toBe('Popular Event');
    });

    it('uses soft deletes', function () {
        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Event to Delete',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
        ]);

        $eventId = $event->id;
        $event->delete();

        expect(Event::find($eventId))->toBeNull();
        expect(Event::withTrashed()->find($eventId))->toBeTruthy();
    });

    it('casts photos as array', function () {
        $photos = ['photo1.jpg', 'photo2.jpg'];

        $event = Event::create([
            'organizer_id' => $this->organizer->id,
            'category_id' => $this->category->id,
            'name' => 'Event with Photos',
            'start_time' => now()->addDays(7),
            'type' => Event::TYPE_OFFLINE,
            'status' => Event::STATUS_DRAFT,
            'photos' => $photos,
        ]);

        expect($event->photos)->toBeArray();
        expect($event->photos)->toBe($photos);
    });
});
