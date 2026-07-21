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
    ]);
});

describe('Permission Model', function () {
    it('can create a permission', function () {
        $permission = Permission::create([
            'name' => 'custom.permission',
            'guard_name' => 'api',
        ]);

        expect($permission->id)->toBeTruthy();
        expect($permission->name)->toBe('custom.permission');
    });

    it('has all required permissions', function () {
        $requiredPermissions = [
            Permission::EVENTS_CREATE,
            Permission::EVENTS_READ,
            Permission::EVENTS_UPDATE,
            Permission::EVENTS_DELETE,
            Permission::TICKETS_CREATE,
            Permission::TICKETS_READ,
            Permission::TICKETS_UPDATE,
            Permission::TICKETS_DELETE,
            Permission::TRANSACTIONS_READ,
            Permission::TRANSACTIONS_UPDATE,
            Permission::REPORTS_VIEW,
            Permission::REPORTS_EXPORT,
            Permission::USERS_MANAGE,
            Permission::ROLES_MANAGE,
            Permission::SETTINGS_MANAGE,
            Permission::CHECKIN_PERFORM,
            Permission::CHECKOUT_PERFORM,
        ];

        foreach ($requiredPermissions as $name) {
            expect(Permission::where('name', $name)->exists())->toBeTrue("Permission {$name} should exist");
        }
    });

    it('has unique name', function () {
        Permission::create([
            'name' => 'unique.permission',
            'guard_name' => 'api',
        ]);

        expect(fn () => Permission::create([
            'name' => 'unique.permission',
            'guard_name' => 'api',
        ]))->toThrow(\Illuminate\Database\QueryException::class);
    });

    it('can belong to roles', function () {
        $permission = Permission::first();
        $role = Role::create(['name' => 'new_role', 'guard_name' => 'api']);

        $permission->roles()->attach($role->id);

        expect($permission->fresh()->roles)->toHaveCount(1);
        expect($permission->fresh()->roles->first()->id)->toBe($role->id);
    });

    it('uses soft deletes', function () {
        $permission = Permission::create([
            'name' => 'temp.permission',
            'guard_name' => 'api',
        ]);
        $permissionId = $permission->id;
        $permission->delete();

        expect(Permission::find($permissionId))->toBeNull();
        expect(Permission::withTrashed()->find($permissionId))->toBeTruthy();
    });
});
