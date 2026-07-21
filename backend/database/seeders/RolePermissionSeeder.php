<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $superAdmin = Role::where('name', Role::SUPER_ADMIN)->firstOrFail();
        $organizer = Role::where('name', Role::ORGANIZER)->firstOrFail();
        $attendee = Role::where('name', Role::ATTENDEE)->firstOrFail();

        // Get all permissions
        $allPermissions = Permission::pluck('id')->toArray();

        // Super Admin: all permissions
        $superAdmin->permissions()->sync($allPermissions);

        // Organizer: events, tickets, transactions.read, reports.view, checkin
        $organizerPermissions = Permission::whereIn('name', [
            Permission::EVENTS_CREATE,
            Permission::EVENTS_READ,
            Permission::EVENTS_UPDATE,
            Permission::EVENTS_DELETE,
            Permission::TICKETS_CREATE,
            Permission::TICKETS_READ,
            Permission::TICKETS_UPDATE,
            Permission::TICKETS_DELETE,
            Permission::TRANSACTIONS_READ,
            Permission::REPORTS_VIEW,
            Permission::CHECKIN_PERFORM,
        ])->pluck('id')->toArray();
        $organizer->permissions()->sync($organizerPermissions);

        // Attendee: transactions.read (own), checkout, checkin (own tickets)
        $attendeePermissions = Permission::whereIn('name', [
            Permission::TRANSACTIONS_READ,
            Permission::CHECKOUT_PERFORM,
        ])->pluck('id')->toArray();
        $attendee->permissions()->sync($attendeePermissions);
    }
}
