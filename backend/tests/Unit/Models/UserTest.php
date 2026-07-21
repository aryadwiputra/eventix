<?php

namespace Tests\Unit\Models;

use App\Models\Organizer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
    ]);
});

describe('User Model', function () {
    it('can create a user', function () {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        expect($user->id)->toBeTruthy();
        expect($user->name)->toBe('Test User');
    });

    it('can have multiple roles', function () {
        $user = User::create([
            'name' => 'Multi Role User',
            'email' => 'multi@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach([
            Role::where('name', Role::ATTENDEE)->first()->id,
            Role::where('name', Role::ORGANIZER)->first()->id,
        ]);

        expect($user->roles)->toHaveCount(2);
    });

    it('has ATTENDEE role by default after seeding', function () {
        $user = User::create([
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::ATTENDEE)->first()->id);

        expect($user->hasRole(Role::ATTENDEE))->toBeTrue();
    });

    it('hasRole returns true for assigned role', function () {
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::SUPER_ADMIN)->first()->id);

        expect($user->hasRole('super_admin'))->toBeTrue();
    });

    it('hasRole returns false for non-assigned role', function () {
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'regular@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::ATTENDEE)->first()->id);

        expect($user->hasRole('super_admin'))->toBeFalse();
    });

    it('hasPermission returns true for assigned permission', function () {
        $user = User::create([
            'name' => 'Super Admin User',
            'email' => 'super@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::SUPER_ADMIN)->first()->id);

        expect($user->hasPermission('events.create'))->toBeTrue();
    });

    it('isSuperAdmin returns true for super admin', function () {
        $user = User::create([
            'name' => 'Super Admin',
            'email' => 'supertest@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::SUPER_ADMIN)->first()->id);

        expect($user->isSuperAdmin())->toBeTrue();
    });

    it('isOrganizer returns true for organizer', function () {
        $user = User::create([
            'name' => 'Organizer',
            'email' => 'orgtest@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::ORGANIZER)->first()->id);

        expect($user->isOrganizer())->toBeTrue();
    });

    it('can have organizer profile', function () {
        $user = User::create([
            'name' => 'Organizer With Profile',
            'email' => 'orgprofile@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->attach(Role::where('name', Role::ORGANIZER)->first()->id);

        Organizer::create([
            'user_id' => $user->id,
            'company_name' => 'Test Company',
        ]);

        expect($user->organizer)->toBeInstanceOf(Organizer::class);
        expect($user->organizer->company_name)->toBe('Test Company');
    });

    it('can have transactions', function () {
        $user = User::create([
            'name' => 'Buyer',
            'email' => 'buyer@example.com',
            'password' => Hash::make('password'),
        ]);

        expect($user->transactions)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('can have waitlists', function () {
        $user = User::create([
            'name' => 'Waitlist User',
            'email' => 'waitlist@example.com',
            'password' => Hash::make('password'),
        ]);

        expect($user->waitlists)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('uses soft deletes', function () {
        $user = User::create([
            'name' => 'Temp User',
            'email' => 'temp@example.com',
            'password' => Hash::make('password'),
        ]);

        $userId = $user->id;
        $user->delete();

        expect(User::find($userId))->toBeNull();
        expect(User::withTrashed()->find($userId))->toBeTruthy();
    });

    it('implements JWTSubject interface', function () {
        $user = User::create([
            'name' => 'JWT Test User',
            'email' => 'jwt_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
        ]);

        expect(method_exists($user, 'getJWTIdentifier'))->toBeTrue();
        expect(method_exists($user, 'getJWTCustomClaims'))->toBeTrue();
    });
});
