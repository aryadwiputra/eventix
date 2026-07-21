<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $roles = [
            ['name' => Role::SUPER_ADMIN, 'guard_name' => 'api'],
            ['name' => Role::ORGANIZER, 'guard_name' => 'api'],
            ['name' => Role::ATTENDEE, 'guard_name' => 'api'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
