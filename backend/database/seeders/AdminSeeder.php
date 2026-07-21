<?php

namespace Database\Seeders;

use App\Models\Organizer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Create Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@tickety.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Attach Super Admin role
        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->first();
        if (!$admin->hasRole(Role::SUPER_ADMIN)) {
            $admin->roles()->attach($superAdminRole);
        }

        // Create Organizer
        $organizer = User::firstOrCreate(
            ['email' => 'organizer@tickety.test'],
            [
                'name' => 'Demo Organizer',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Attach Organizer role and create organizer profile
        $organizerRole = Role::where('name', Role::ORGANIZER)->first();
        if (!$organizer->hasRole(Role::ORGANIZER)) {
            $organizer->roles()->attach($organizerRole);
        }

        Organizer::firstOrCreate(
            ['user_id' => $organizer->id],
            [
                'company_name' => 'Demo Event Organizer',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        // Create Attendee
        $attendee = User::firstOrCreate(
            ['email' => 'attendee@tickety.test'],
            [
                'name' => 'Demo Attendee',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Attach Attendee role
        $attendeeRole = Role::where('name', Role::ATTENDEE)->first();
        if (!$attendee->hasRole(Role::ATTENDEE)) {
            $attendee->roles()->attach($attendeeRole);
        }
    }
}
