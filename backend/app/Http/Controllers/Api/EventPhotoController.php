<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EventPhotoController extends Controller
{
    use ApiResponse;

    public function upload(Request $request, Event $event): JsonResponse
    {
        $user = $request->user();
        $isOrg = $user->isOrganizer();

        if ($isOrg && $event->organizer_id !== $user->organizer?->id) {
            return $this->error('Forbidden', 403);
        }

        $request->validate([
            'photos' => ['required', 'array', 'max:5'],
            'photos.*' => ['image', 'max:5120'],
        ]);

        $photos = $event->photos ?? [];
        $current = count($photos);
        $incoming = count($request->file('photos'));

        if ($current + $incoming > 5) {
            return $this->error('Maximum 5 photos per event', 422);
        }

        foreach ($request->file('photos') as $photo) {
            $path = $photo->store("events/{$event->id}", 'public');
            $photos[] = $path;
        }

        $event->update(['photos' => $photos]);

        return $this->success(['photos' => $photos], 'Photos uploaded');
    }

    public function destroy(Request $request, Event $event, int $index): JsonResponse
    {
        $user = $request->user();
        $isOrg = $user->isOrganizer();

        if ($isOrg && $event->organizer_id !== $user->organizer?->id) {
            return $this->error('Forbidden', 403);
        }

        $photos = $event->photos ?? [];

        if (!isset($photos[$index])) {
            return $this->error('Photo not found', 404);
        }

        Storage::disk('public')->delete($photos[$index]);
        array_splice($photos, $index, 1);
        $event->update(['photos' => $photos]);

        return $this->success(['photos' => $photos], 'Photo deleted');
    }
}
