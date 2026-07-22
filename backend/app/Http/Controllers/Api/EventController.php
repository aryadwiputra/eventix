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

    private function organizerId(Request $request): ?int
    {
        return $request->user()?->organizer?->id;
    }

    private function isAdmin(Request $request): bool
    {
        return $request->user()?->isSuperAdmin() ?? false;
    }

    private function baseQuery(Request $request)
    {
        if ($this->isAdmin($request)) {
            return Event::query();
        }

        $orgId = $this->organizerId($request);

        if ($orgId) {
            return Event::where('organizer_id', $orgId);
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
            ->when(
                $request->status && ($this->isAdmin($request) || $this->organizerId($request)),
                fn ($q, $v) => $q->where('status', $v)
            )
            ->paginate($request->per_page ?? 15);

        return $this->success($events);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        if ($this->isAdmin($request)) {
            return $this->success($event->load('category', 'organizer.user', 'tickets'));
        }

        $orgId = $this->organizerId($request);

        if ($orgId && $event->organizer_id === $orgId) {
            return $this->success($event->load('category', 'organizer.user', 'tickets'));
        }

        abort_unless($event->isPublished(), 404);

        return $this->success($event->load('category', 'organizer.user', 'tickets'));
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (!$this->isAdmin($request)) {
            $data['organizer_id'] = $this->organizerId($request);
            unset($data['is_popular']);
        }

        $event = Event::create($data);

        return $this->created($event->load('category', 'organizer.user'), 'Event created successfully');
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            $orgId = $this->organizerId($request);
            abort_unless($orgId && $event->organizer_id === $orgId, 403);

            $data = $request->safe()->except('is_popular');
        } else {
            $data = $request->validated();
        }

        $event->update($data);

        return $this->success($event->fresh()->load('category', 'organizer.user'), 'Event updated successfully');
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            $orgId = $this->organizerId($request);
            abort_unless($orgId && $event->organizer_id === $orgId, 403);
        }

        $event->delete();

        return $this->noContent();
    }
}
