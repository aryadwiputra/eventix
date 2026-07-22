<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreTicketRequest;
use App\Http\Requests\Api\UpdateTicketRequest;
use App\Models\Event;
use App\Models\Ticket;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
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

    private function checkOwnership(Request $request, Event $event): void
    {
        if (!$this->isAdmin($request)) {
            $orgId = $this->organizerId($request);
            abort_unless($orgId && $event->organizer_id === $orgId, 403);
        }
    }

    public function index(Request $request, Event $event): JsonResponse
    {
        $this->checkOwnership($request, $event);

        $tickets = $event->tickets()->paginate($request->per_page ?? 15);

        return $this->success($tickets);
    }

    public function show(Request $request, Event $event, Ticket $ticket): JsonResponse
    {
        $this->checkOwnership($request, $event);

        abort_unless($ticket->event_id === $event->id, 404);

        return $this->success($ticket);
    }

    public function store(StoreTicketRequest $request, Event $event): JsonResponse
    {
        $this->checkOwnership($request, $event);

        $ticket = $event->tickets()->create($request->validated());

        return $this->created($ticket, 'Ticket created successfully');
    }

    public function update(UpdateTicketRequest $request, Event $event, Ticket $ticket): JsonResponse
    {
        $this->checkOwnership($request, $event);

        abort_unless($ticket->event_id === $event->id, 404);

        $ticket->update($request->validated());

        return $this->success($ticket->fresh(), 'Ticket updated successfully');
    }

    public function destroy(Request $request, Event $event, Ticket $ticket): JsonResponse
    {
        $this->checkOwnership($request, $event);

        abort_unless($ticket->event_id === $event->id, 404);

        $ticket->delete();

        return $this->noContent();
    }
}
