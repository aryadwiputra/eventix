<?php

use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
    ]);
});

describe('Auth', function () {
    describe('Register', function () {
        it('registers a new user and returns token', function () {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => ['id', 'name', 'email', 'roles'],
                    'access_token',
                    'token_type',
                    'expires_in',
                ]);

            $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        });

        it('assigns attendee role on registration', function () {
            $this->postJson('/api/auth/register', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $user = User::where('email', 'test@example.com')->first();
            $this->assertDatabaseHas('user_roles', [
                'user_id' => $user->id,
                'role_id' => Role::where('name', Role::ATTENDEE)->first()->id,
            ]);
        });

        it('fails with validation errors', function () {
            $response = $this->postJson('/api/auth/register', []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
        });

        it('fails when email is already taken', function () {
            User::factory()->create(['email' => 'test@example.com']);

            $response = $this->postJson('/api/auth/register', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });
    });

    describe('Login', function () {
        beforeEach(function () {
            User::factory()->create([
                'email' => 'test@example.com',
                'password' => bcrypt('password123'),
            ]);
        });

        it('logs in with valid credentials', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'password123',
            ]);

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'expires_in',
                ]);
        });

        it('fails with invalid credentials', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);

            $response->assertStatus(401)
                ->assertJson(['message' => 'Invalid credentials']);
        });

        it('fails with validation errors', function () {
            $response = $this->postJson('/api/auth/login', []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
        });
    });

    describe('Authenticated', function () {
        beforeEach(function () {
            $user = User::factory()->create([
                'email' => 'test@example.com',
                'password' => bcrypt('password123'),
            ]);
            $user->roles()->attach(Role::where('name', Role::ATTENDEE)->first()->id);
            $this->token = auth('api')->login($user);
        });

        it('returns current user on /me', function () {
            $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                ->getJson('/api/auth/me');

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => ['id', 'name', 'email', 'roles'],
                ]);
        });

        it('logs out successfully', function () {
            $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                ->postJson('/api/auth/logout');

            $response->assertStatus(200)
                ->assertJson(['message' => 'Successfully logged out']);
        });

        it('refreshes token', function () {
            $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                ->postJson('/api/auth/refresh');

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'expires_in',
                ]);
        });

        it('rejects unauthenticated requests', function () {
            $this->getJson('/api/auth/me')->assertStatus(401);
            $this->postJson('/api/auth/logout')->assertStatus(401);
            $this->postJson('/api/auth/refresh')->assertStatus(401);
        });
    });
});
