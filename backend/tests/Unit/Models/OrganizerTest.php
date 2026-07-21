<?php

namespace Tests\Unit\Models;

use App\Models\Organizer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

beforeEach(function () {
    $this->seed([\Database\Seeders\RoleSeeder::class]);

    $this->user = User::create([
        'name' => 'Organizer User',
        'email' => 'orguser_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
    $this->user->roles()->attach(Role::where('name', Role::ORGANIZER)->first()->id);
});

describe('Organizer Model', function () {
    it('can create an organizer', function () {
        $organizer = Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Event Corp',
        ]);

        expect($organizer->id)->toBeTruthy();
        expect($organizer->company_name)->toBe('Event Corp');
    });

    it('belongs to user', function () {
        $organizer = Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Event Corp',
        ]);

        expect($organizer->user)->toBeInstanceOf(User::class);
    });

    it('has many events', function () {
        $organizer = Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Event Corp',
        ]);

        expect($organizer->events)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('has unique user_id', function () {
        Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Org 1',
        ]);

        expect(fn () => Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Org 2',
        ]))->toThrow(\Illuminate\Database\QueryException::class);
    });

    it('has default is_active true', function () {
        $organizer = Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Active Org',
        ]);

        expect($organizer->fresh()->is_active)->toBeTrue();
    });

    it('uses soft deletes', function () {
        $organizer = Organizer::create([
            'user_id' => $this->user->id,
            'company_name' => 'Temp Org',
        ]);

        $id = $organizer->id;
        $organizer->delete();

        expect(Organizer::find($id))->toBeNull();
        expect(Organizer::withTrashed()->find($id))->toBeTruthy();
    });
});
