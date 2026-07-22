<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketCode;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckinController extends Controller
{
    use ApiResponse;

    private function extractCode(string $input): string
    {
        return str_starts_with($input, 'TICKETY:')
            ? substr($input, 8)
            : $input;
    }

    private function authorizeCheckin(TicketCode $ticketCode, \App\Models\User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $event = $ticketCode->transactionItem->transaction->event;
        $orgId = $user->organizer?->id;

        abort_unless($orgId && $event->organizer_id === $orgId, 403);
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate(['code' => 'required|string']);

        $code = $this->extractCode($validated['code']);
        $ticketCode = TicketCode::where('code', $code)
            ->with('transactionItem.transaction.event', 'transactionItem.ticket')
            ->firstOrFail();

        $this->authorizeCheckin($ticketCode, $request->user());

        return $this->success([
            'valid' => !$ticketCode->isRedeemed(),
            'ticket' => $ticketCode,
        ]);
    }

    public function redeem(Request $request): JsonResponse
    {
        $validated = $request->validate(['code' => 'required|string']);

        $code = $this->extractCode($validated['code']);
        $ticketCode = TicketCode::where('code', $code)
            ->with('transactionItem.transaction.event', 'transactionItem.ticket')
            ->firstOrFail();

        $this->authorizeCheckin($ticketCode, $request->user());

        if ($ticketCode->isRedeemed()) {
            return $this->error('Ticket already redeemed', 409);
        }

        $ticketCode->redeem($request->user());

        return $this->success($ticketCode->fresh(), 'Ticket redeemed successfully');
    }
}
