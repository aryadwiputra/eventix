<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $permissions = [
            // Events
            Permission::EVENTS_CREATE,
            Permission::EVENTS_READ,
            Permission::EVENTS_UPDATE,
            Permission::EVENTS_DELETE,

            // Tickets
            Permission::TICKETS_CREATE,
            Permission::TICKETS_READ,
            Permission::TICKETS_UPDATE,
            Permission::TICKETS_DELETE,

            // Transactions
            Permission::TRANSACTIONS_READ,
            Permission::TRANSACTIONS_UPDATE,

            // Reports
            Permission::REPORTS_VIEW,
            Permission::REPORTS_EXPORT,

            // Admin
            Permission::USERS_MANAGE,
            Permission::ROLES_MANAGE,
            Permission::SETTINGS_MANAGE,

            // Operations
            Permission::CHECKIN_PERFORM,
            Permission::CHECKOUT_PERFORM,
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'api']
            );
        }
    }
}
