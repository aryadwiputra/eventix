# Event Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Event CRUD with three access levels — public (view published), organizer (manage own), admin (manage all).

**Architecture:** Single `EventController` with query scoping based on user role (guest/organizer/admin). Follows existing Admin CRUD patterns: `ApiResponse` trait, `PermissionMiddleware`, dedicated FormRequests.

**Tech Stack:** Laravel 13, tymon/jwt-auth, Pest (testing)

## Global Constraints

- Maintain strict permission separation (events.create/read/update/delete per action)
- Public endpoints are read-only (index/show published events only)
- Organizer is auto-scoped to own events via `organizer_id`
- Admin can CRUD any event
- Soft deletes for destroy operations
- Pagination defaults to 15 per page
- All JSON responses use `ApiResponse` trait format

---

### Task 1: FormRequests (StoreEventRequest + UpdateEventRequest)

**Files:**
- Create: `app/Http/Requests/Api/StoreEventRequest.php`
- Create: `app/Http/Requests/Api/UpdateEventRequest.php`

**Interfaces:**
- Consumes: `Base FormRequest`, existing validation patterns from `StoreCategoryRequest`
- Produces: `StoreEventRequest` (validated rules), `UpdateEventRequest` (validated rules)

- [ ] **Step 1: Create StoreEventRequest**

```php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'headline' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'location' => ['required_if:type,offline', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:offline,online'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'meeting_link' => ['required_if:type,online', 'url'],
            'photos' => ['sometimes', 'array'],
            'photos.*' => ['url'],
            'is_popular' => ['sometimes', 'boolean'],
        ];
    }
}
```

- [ ] **Step 2: Verify file structure**

- [ ] **Step 3: Create UpdateEventRequest**

```php
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:3', 'max:255'],
            'headline' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'start_time' => ['sometimes', 'date', 'after:now'],
            'end_time' => ['sometimes', 'date', 'after:start_time'],
            'location' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:offline,online'],
            'category_id' => ['sometimes', 'exists:categories,id'],
            'meeting_link' => ['sometimes', 'url'],
            'photos' => ['sometimes', 'array'],
            'photos.*' => ['url'],
            'is_popular' => ['sometimes', 'boolean'],
        ];
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Requests/Api/StoreEventRequest.php app/Http/Requests/Api/UpdateEventRequest.php
git commit -m "feat: add event form requests"
```

---

### Task 2: EventController

**Files:**
- Create: `app/Http/Controllers/Api/EventController.php`

**Interfaces:**
- Consumes: `ApiResponse` trait, `StoreEventRequest`, `UpdateEventRequest`, `Event` model, `Illuminate\Http\Request`
- Produces: `EventController` with index/show/store/update/destroy methods

- [ ] **Step 1: Create EventController**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreEventRequest;
use App\Http\Requests\Api\UpdateEventRequest;
use App\Models\Event;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ApiResponse;

    private function getOrganizerId(Request $request): ?int
    {
        return $request->user()?->organizer?->id;
    }

    private function isAdmin(Request $request): bool
    {
        return $request->user()?->isSuperAdmin() ?? false;
    }

    private function baseQuery(Request $request)
    {
        $user = $request->user();

        if ($this->isAdmin($request)) {
            return Event::query();
        }

        $organizerId = $this->getOrganizerId($request);

        if ($organizerId) {
            return Event::where('organizer_id', $organizerId);
        }

        return Event::published();
    }

    public function index(Request $request): JsonResponse
    {
        $events = $this->baseQuery($request)
            ->with('category:id,name,slug', 'organizer.user:id,name')
            ->when($request->category_id, fn ($q, $v) => $q->where('category_id', $v))
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->when($request->search, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->when($request->status && ($this->isAdmin($request) || $this->getOrganizerId($request)),
                fn ($q, $v) => $q->where('status', $v))
            ->paginate($request->per_page ?? 15);

        return $this->success($events);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        if ($this->isAdmin($request)) {
            return $this->success($event->load('category', 'organizer.user', 'tickets'));
        }

        $organizerId = $this->getOrganizerId($request);

        if ($organizerId && $event->organizer_id === $organizerId) {
            return $this->success($event->load('category', 'organizer.user', 'tickets'));
        }

        if (!$event->isPublished()) {
            return $this->error('Event not found', 404);
        }

        return $this->success($event->load('category', 'organizer.user', 'tickets'));
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (!$this->isAdmin($request)) {
            $data['organizer_id'] = $this->getOrganizerId($request);
            unset($data['is_popular']);
        }

        $event = Event::create($data);

        return $this->created($event->load('category', 'organizer.user'), 'Event created successfully');
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            $organizerId = $this->getOrganizerId($request);
            if (!$organizerId || $event->organizer_id !== $organizerId) {
                return $this->error('Forbidden', 403);
            }
            unset($data['is_popular']);
        }

        $event->update($request->validated());

        return $this->success($event->fresh()->load('category', 'organizer.user'), 'Event updated successfully');
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            $organizerId = $this->getOrganizerId($request);
            if (!$organizerId || $event->organizer_id !== $organizerId) {
                return $this->error('Forbidden', 403);
            }
        }

        $event->delete();

        return $this->noContent();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/Api/EventController.php
git commit -m "feat: add event controller with role-based scoping"
```

---

### Task 3: Routes

**Files:**
- Modify: `routes/api.php`

- [ ] **Step 1: Add event routes**

```php
// Public
Route::get('events', [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);

// — inside the admin prefix group —
Route::get('admin/events', [EventController::class, 'index'])->middleware('permission:events.read');
Route::get('admin/events/{event}', [EventController::class, 'show'])->middleware('permission:events.read');
Route::post('admin/events', [EventController::class, 'store'])->middleware('permission:events.create');
Route::put('admin/events/{event}', [EventController::class, 'update'])->middleware('permission:events.update');
Route::delete('admin/events/{event}', [EventController::class, 'destroy'])->middleware('permission:events.delete');
```

Full file after changes:

```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\TransactionController;
use App\Http\Controllers\Api\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('jwt.auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('events', [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);

Route::prefix('admin')->middleware(['jwt.auth'])->group(function () {
    Route::apiResource('users', UserController::class)->middleware('permission:users.manage');
    Route::apiResource('roles', RoleController::class)->middleware('permission:roles.manage');
    Route::apiResource('categories', CategoryController::class)->middleware('permission:settings.manage');

    Route::get('transactions', [TransactionController::class, 'index'])->middleware('permission:transactions.read');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->middleware('permission:transactions.read');
    Route::put('transactions/{transaction}/status', [TransactionController::class, 'updateStatus'])->middleware('permission:transactions.update');

    Route::get('events', [EventController::class, 'index'])->middleware('permission:events.read');
    Route::get('events/{event}', [EventController::class, 'show'])->middleware('permission:events.read');
    Route::post('events', [EventController::class, 'store'])->middleware('permission:events.create');
    Route::put('events/{event}', [EventController::class, 'update'])->middleware('permission:events.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->middleware('permission:events.delete');
});
```

- [ ] **Step 2: Commit**

```bash
git add routes/api.php
git commit -m "feat: add event routes (public + admin)"
```

---

### Task 4: Tests

**Files:**
- Create: `tests/Feature/Api/EventTest.php`

- [ ] **Step 1: Write EventTest**

```php
<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Organizer;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->seed([
        \Database\Seeders\RoleSeeder::class,
        \Database\Seeders\PermissionSeeder::class,
        \Database\Seeders\RolePermissionSeeder::class,
        \Database\Seeders\CategorySeeder::class,
    ]);

    // Admin
    $this->admin = User::factory()->create(['email' => 'admin@test.com']);
    $this->admin->roles()->sync(Role::where('name', Role::SUPER_ADMIN)->first()->id);
    $this->adminToken = auth('api')->login($this->admin);
    $this->adminOrganizer = Organizer::factory()->create(['user_id' => $this->admin->id]);

    // Organizer
    $this->organizer = User::factory()->create(['email' => 'org@test.com']);
    $this->organizer->roles()->sync(Role::where('name', Role::ORGANIZER)->first()->id);
    $this->organizerToken = auth('api')->login($this->organizer);
    $this->orgProfile = Organizer::factory()->create(['user_id' => $this->organizer->id,
        'company_name' => 'Org Co']);

    // Other organizer (for "not mine" tests)
    $this->otherOrg = User::factory()->create();
    $this->otherOrg->roles()->sync(Role::where('name', Role::ORGANIZER)->first()->id);
    $this->otherOrgToken = auth('api')->login($this->otherOrg);
    $this->otherOrgProfile = Organizer::factory()->create(['user_id' => $this->otherOrg->id,
        'company_name' => 'Other Org']);

    // Attendee
    $this->attendee = User::factory()->create(['email' => 'att@test.com']);
    $this->attendee->roles()->sync(Role::where('name', Role::ATTENDEE)->first()->id);
    $this->attendeeToken = auth('api')->login($this->attendee);

    // Events
    $category = Category::first();
    $this->publishedEvent = Event::factory()->create([
        'organizer_id' => $this->orgProfile->id,
        'category_id' => $category->id,
        'name' => 'Published Event',
        'status' => Event::STATUS_PUBLISHED,
    ]);
    $this->draftEvent = Event::factory()->create([
        'organizer_id' => $this->orgProfile->id,
        'category_id' => $category->id,
        'name' => 'Draft Event',
        'status' => Event::STATUS_DRAFT,
    ]);
    $this->otherEvent = Event::factory()->create([
        'organizer_id' => $this->otherOrgProfile->id,
        'category_id' => $category->id,
        'name' => 'Other Org Event',
    ]);
});

describe('Public - Events', function () {
    it('lists published events', function () {
        $this->getJson('/api/events')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');
    });

    it('shows published event detail', function () {
        $this->getJson('/api/events/' . $this->publishedEvent->id)
            ->assertOk()
            ->assertJsonPath('data.name', 'Published Event');
    });

    it('returns 404 for draft event', function () {
        $this->getJson('/api/events/' . $this->draftEvent->id)
            ->assertNotFound();
    });

    it('filters by category', function () {
        $category = Category::first();
        $this->getJson('/api/events?category_id=' . $category->id)
            ->assertOk();
    });

    it('filters by type', function () {
        $this->getJson('/api/events?type=offline')
            ->assertOk();
    });

    it('searches by name', function () {
        $this->getJson('/api/events?search=Published')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');
    });
});

describe('Organizer - Events', function () {
    it('lists own events (including drafts)', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->getJson('/api/admin/events')
            ->assertOk()
            ->assertJsonCount(2, 'data.data');
    });

    it('creates an event', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->postJson('/api/admin/events', [
                'name' => 'New Event',
                'start_time' => now()->addMonth()->format('Y-m-d H:i:s'),
                'type' => 'offline',
                'location' => 'Jakarta',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'New Event')
            ->assertJsonPath('data.organizer_id', $this->orgProfile->id);
    });

    it('updates own event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->putJson('/api/admin/events/' . $this->publishedEvent->id, [
                'name' => 'Updated Name',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    });

    it('deletes own event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->deleteJson('/api/admin/events/' . $this->draftEvent->id)
            ->assertNoContent();

        $this->assertSoftDeleted($this->draftEvent);
    });

    it('cannot update other organizer event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->putJson('/api/admin/events/' . $this->otherEvent->id, ['name' => 'Hack'])
            ->assertForbidden();
    });

    it('cannot delete other organizer event', function () {
        $this->withHeader('Authorization', "Bearer $this->organizerToken")
            ->deleteJson('/api/admin/events/' . $this->otherEvent->id)
            ->assertForbidden();
    });
});

describe('Admin - Events', function () {
    it('lists all events', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->getJson('/api/admin/events')
            ->assertOk()
            ->assertJsonCount(3, 'data.data');
    });

    it('creates event with custom organizer', function () {
        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->postJson('/api/admin/events', [
                'name' => 'Admin Event',
                'start_time' => now()->addMonth()->format('Y-m-d H:i:s'),
                'type' => 'online',
                'meeting_link' => 'https://zoom.us/test',
                'organizer_id' => $this->otherOrgProfile->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.organizer_id', $this->otherOrgProfile->id);
    });

    it('updates any event', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->putJson('/api/admin/events/' . $this->otherEvent->id, [
                'is_popular' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_popular', true);
    });

    it('deletes any event', function () {
        $this->withHeader('Authorization', "Bearer $this->adminToken")
            ->deleteJson('/api/admin/events/' . $this->otherEvent->id)
            ->assertNoContent();

        $this->assertSoftDeleted($this->otherEvent);
    });
});

describe('Auth - Events', function () {
    it('rejects unauthenticated POST', function () {
        $this->postJson('/api/admin/events', ['name' => 'Test'])
            ->assertUnauthorized();
    });

    it('forbids attendee from creating events', function () {
        $this->withHeader('Authorization', "Bearer $this->attendeeToken")
            ->postJson('/api/admin/events', ['name' => 'Test'])
            ->assertForbidden();
    });
});
```

- [ ] **Step 2: Run tests**

Run: `php artisan test tests/Feature/Api/EventTest.php`
Expected: All tests PASS

- [ ] **Step 3: Run full test suite**

Run: `php artisan test`
Expected: All ~132 tests pass (93 model + 11 auth + 14 admin + 14 event)

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/Api/EventTest.php
git commit -m "test: event CRUD feature tests"
```

---

### Task 5: Push & PR

- [ ] **Step 1: Check branch, push, create PR**

```bash
git push origin feature/event-management
gh pr create --base develop --head feature/event-management --title "feat: event management CRUD" --body "Closes Phase 2: Event Management"
```
