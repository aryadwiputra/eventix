<?php

namespace Tests\Unit\Models;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
    ]);
});

describe('Role Model', function () {
    it('can create a role', function () {
        $role = Role::create([
            'name' => 'test_role',
            'guard_name' => 'api',
        ]);

        expect($role->id)->toBeTruthy();
        expect($role->name)->toBe('test_role');
    });

    it('has SUPER_ADMIN role by default', function () {
        $superAdmin = Role::where('name', Role::SUPER_ADMIN)->first();

        expect($superAdmin)->toBeTruthy();
        expect($superAdmin->name)->toBe('super_admin');
    });

    it('has ORGANIZER role by default', function () {
        $organizer = Role::where('name', Role::ORGANIZER)->first();

        expect($organizer)->toBeTruthy();
        expect($organizer->name)->toBe('organizer');
    });

    it('has ATTENDEE role by default', function () {
        $attendee = Role::where('name', Role::ATTENDEE)->first();

        expect($attendee)->toBeTruthy();
        expect($attendee->name)->toBe('attendee');
    });

    it('can have permissions', function () {
        $role = Role::create(['name' => 'custom_role', 'guard_name' => 'api']);
        $permission = Permission::first();

        $role->permissions()->attach($permission->id);

        expect($role->fresh()->permissions)->toHaveCount(1);
        expect($role->fresh()->permissions->first()->id)->toBe($permission->id);
    });

    it('can check if has permission', function () {
        $superAdmin = Role::where('name', Role::SUPER_ADMIN)->first();

        expect($superAdmin->hasPermission(Permission::EVENTS_CREATE))->toBeTrue();
    });

    it('can have users', function () {
        $role = Role::where('name', Role::ATTENDEE)->first();

        expect($role->users)->toBeInstanceOf(\Illuminate\Database\Eloquent\Collection::class);
    });

    it('uses soft deletes', function () {
        $role = Role::create([
            'name' => 'temp_role',
            'guard_name' => 'api',
        ]);
        $roleId = $role->id;
        $role->delete();

        expect(Role::find($roleId))->toBeNull();
        expect(Role::withTrashed()->find($roleId))->toBeTruthy();
    });
});
