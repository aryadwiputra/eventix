<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'guard_name',
    ];

    public const EVENTS_CREATE = 'events.create';
    public const EVENTS_READ = 'events.read';
    public const EVENTS_UPDATE = 'events.update';
    public const EVENTS_DELETE = 'events.delete';

    public const TICKETS_CREATE = 'tickets.create';
    public const TICKETS_READ = 'tickets.read';
    public const TICKETS_UPDATE = 'tickets.update';
    public const TICKETS_DELETE = 'tickets.delete';

    public const TRANSACTIONS_READ = 'transactions.read';
    public const TRANSACTIONS_UPDATE = 'transactions.update';

    public const REPORTS_VIEW = 'reports.view';
    public const REPORTS_EXPORT = 'reports.export';

    public const USERS_MANAGE = 'users.manage';
    public const ROLES_MANAGE = 'roles.manage';
    public const SETTINGS_MANAGE = 'settings.manage';

    public const CHECKIN_PERFORM = 'checkin.perform';
    public const CHECKOUT_PERFORM = 'checkout.perform';

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->withTimestamps();
    }
}
