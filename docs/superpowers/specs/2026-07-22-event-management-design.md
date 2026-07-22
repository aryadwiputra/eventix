# Event Management — Phase 2 Design

## Overview
Event CRUD with three access levels: public (view published events), organizer (manage own events), admin (manage all events).

## Actors & Permissions

| Actor | Permissions | Scope |
|-------|-----------|-------|
| Guest | — | Read published events only |
| Attendee | — | Read published events only (same as guest) |
| Organizer | `events.*` | Own events only (organizer_id = user->organizer->id) |
| Admin | `events.*` | All events |

## Routes

```php
// Public (no auth)
Route::get('events', [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);

// Admin & Organizer
Route::middleware(['jwt.auth', 'permission:events.create,events.read,events.update,events.delete'])
    ->apiResource('admin/events', EventController::class);
```

## Controller: EventController

Single controller at `app/Http/Controllers/Api/EventController.php`.

### Scoping Logic

| Method | Guest | Organizer | Admin |
|--------|-------|-----------|-------|
| index | published() + filters | own events, all statuses | all events |
| show | published only | owned only | any |
| store | 401 | auto-set organizer_id | any organizer_id |
| update | 401 | owned only | any |
| destroy | 401 | owned only (soft) | any (soft) |

### Filters (index)
- `?category_id=...` — filter by category
- `?type=offline|online` — filter by event type
- `?search=...` — search by name
- `?status=...` — admin/organizer only
- Pagination: `?per_page=...` (default 15)

### Eager Loading
- `index` → `with('category:id,name,slug', 'organizer.user:id,name')`
- `show` → `with('category', 'organizer.user', 'tickets')`

## FormRequests

Two files:
- `app/Http/Requests/Api/StoreEventRequest.php`
- `app/Http/Requests/Api/UpdateEventRequest.php`

### StoreEventRequest Rules
| Field | Rules |
|-------|-------|
| name | required, string, min:3, max:255 |
| headline | sometimes, string, max:255 |
| description | sometimes, string |
| start_time | required, date, after:now |
| end_time | sometimes, date, after:start_time |
| location | required_if:type,offline, string, max:255 |
| type | required, in:offline,online |
| category_id | sometimes, exists:categories,id |
| meeting_link | required_if:type,online, url |
| photos | sometimes, array |
| photos.* | url |
| is_popular | sometimes, boolean (admin only — validated in controller) |

### UpdateEventRequest Rules
Same as Store, but all `sometimes`. Slug unique exclusion via route binding.

## Response Format

Standard `ApiResponse` trait responses:
- `index` → `$this->success($events)` (paginated)
- `show` → `$this->success($event->load(...))`
- `store` → `$this->created($event, 'Event created successfully')`
- `update` → `$this->success($event->fresh(), 'Event updated successfully')`
- `destroy` → `$this->noContent()`

## Testing

**File**: `tests/Feature/Api/EventTest.php`

**Setup** (beforeEach):
- Seed roles, permissions, RBAC matrix
- Create super_admin + organizer + attendee users with tokens
- Create Organizer profile for the organizer user

**Test Cases (12-14)**:

| # | Test | Actor |
|---|------|-------|
| 1 | lists published events | Guest |
| 2 | shows published event detail | Guest |
| 3 | returns 404 for draft event | Guest |
| 4 | lists own events (including drafts) | Organizer |
| 5 | creates an event | Organizer |
| 6 | updates own event | Organizer |
| 7 | deletes own event | Organizer |
| 8 | cannot update other's event | Organizer |
| 9 | lists all events | Admin |
| 10 | creates event with arbitrary organizer_id | Admin |
| 11 | updates any event | Admin |
| 12 | deletes any event | Admin |
| 13 | rejects unauthenticated POST/PUT/DELETE | Guest |
| 14 | forbids attendee from creating events | Attendee |

## Non-Goals
- Ticket management (separate phase)
- Public checkout / payment (separate phase)
- Event image upload (photos as URL array for now)
- Waitlist management
- Report/analytics

## Files to Create
1. `app/Http/Controllers/Api/EventController.php`
2. `app/Http/Requests/Api/StoreEventRequest.php`
3. `app/Http/Requests/Api/UpdateEventRequest.php`
4. `tests/Feature/Api/EventTest.php`

## Files to Modify
1. `routes/api.php` — add event routes
