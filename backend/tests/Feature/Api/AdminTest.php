<?php

use App\Models\Category;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
    ]);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->roles()->sync(Role::where('name', Role::SUPER_ADMIN)->first()->id);
    $this->adminToken = auth('api')->login($this->superAdmin);

    $this->attendee = User::factory()->create();
    $this->attendee->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
    $this->attendeeToken = auth('api')->login($this->attendee);
});

describe('Admin - Users', function () {
    it('lists users', function () {
        User::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson('/api/admin/users');

        $response->assertOk()
            ->assertJsonStructure(['success', 'data']);
    });

    it('creates a user', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/admin/users', [
                'name' => 'New User',
                'email' => 'new@example.com',
                'password' => 'password123',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'new@example.com');
    });

    it('updates a user', function () {
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->putJson("/api/admin/users/{$user->id}", [
                'name' => 'Updated Name',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    });

    it('deletes a user', function () {
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->deleteJson("/api/admin/users/{$user->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted($user);
    });

    it('forbids attendee from managing users', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->getJson('/api/admin/users');

        $response->assertForbidden();
    });
});

describe('Admin - Roles', function () {
    it('lists roles', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson('/api/admin/roles');

        $response->assertOk();
    });

    it('creates a role', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/admin/roles', [
                'name' => 'custom_role',
                'guard_name' => 'api',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'custom_role');
    });

    it('updates a role', function () {
        $role = Role::create(['name' => 'temp_role', 'guard_name' => 'api']);

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->putJson("/api/admin/roles/{$role->id}", [
                'name' => 'updated_role',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'updated_role');
    });

    it('deletes a role', function () {
        $role = Role::create(['name' => 'temp_role', 'guard_name' => 'api']);

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->deleteJson("/api/admin/roles/{$role->id}");

        $response->assertNoContent();
    });
});

describe('Admin - Categories', function () {
    it('lists categories', function () {
        Category::factory()->count(3)->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson('/api/admin/categories');

        $response->assertOk();
    });

    it('creates a category', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/admin/categories', [
                'name' => 'Music',
                'icon' => 'music',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Music');
    });

    it('updates a category', function () {
        $category = Category::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->putJson("/api/admin/categories/{$category->id}", [
                'name' => 'Updated',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated');
    });

    it('deletes a category', function () {
        $category = Category::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->deleteJson("/api/admin/categories/{$category->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted($category);
    });
});

describe('Admin - Auth', function () {
    it('rejects unauthenticated requests', function () {
        $this->getJson('/api/admin/users')->assertUnauthorized();
        $this->getJson('/api/admin/roles')->assertUnauthorized();
        $this->getJson('/api/admin/categories')->assertUnauthorized();
    });
});
