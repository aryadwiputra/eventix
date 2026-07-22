<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\JoinWaitlistRequest;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\Waitlist;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WaitlistController extends Controller
{
    use ApiResponse;

    public function store(JoinWaitlistRequest $request): JsonResponse
    {
        $ticket = Ticket::findOrFail($request->ticket_id);

        abort_unless($ticket->isSoldOut(), 400, 'Ticket still available');

        $existing = Waitlist::where('ticket_id', $ticket->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing && !$existing->isExpired()) {
            return $this->error('Already on waitlist', 409);
        }

        $waitlist = Waitlist::create([
            'event_id' => $ticket->event_id,
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'status' => Waitlist::STATUS_WAITING,
        ]);

        return $this->created($waitlist, 'Joined waitlist');
    }

    public function index(Request $request): JsonResponse
    {
        $waitlists = Waitlist::where('user_id', $request->user()->id)
            ->with('ticket', 'event')
            ->latest()
            ->get();

        return $this->success($waitlists);
    }

    public function destroy(Request $request, Waitlist $waitlist): JsonResponse
    {
        abort_unless($waitlist->user_id === $request->user()->id, 403);

        $waitlist->delete();

        return $this->noContent();
    }

    public function claim(Request $request, Waitlist $waitlist): JsonResponse
    {
        abort_unless($waitlist->user_id === $request->user()->id, 403);
        abort_unless($waitlist->isNotified(), 400, 'Waitlist not notified yet');
        abort_unless(!$waitlist->hasExpired(), 400, 'Claim period expired');

        $ticket = $waitlist->ticket;
        abort_unless($ticket->hasEnoughStock(1), 400, 'Ticket sold out');

        $transaction = DB::transaction(function () use ($request, $ticket, $waitlist) {
            $waitlist->claim();

            $tx = Transaction::create([
                'event_id' => $waitlist->event_id,
                'buyer_user_id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'status' => Transaction::STATUS_PENDING,
                'total_amount' => $ticket->price,
                'payment_deadline' => now()->addHours(24),
            ]);

            $tx->items()->create([
                'ticket_id' => $ticket->id,
                'quantity' => 1,
                'price_at_purchase' => $ticket->price,
                'subtotal' => $ticket->price,
            ]);

            return $tx;
        });

        return $this->created([
            'transaction_code' => $transaction->code,
            'total_amount' => $transaction->total_amount,
            'payment_deadline' => $transaction->payment_deadline,
        ], 'Claimed. Proceed to payment.');
    }
}
