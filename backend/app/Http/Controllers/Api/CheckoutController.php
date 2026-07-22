<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutRequest;
use App\Models\Event;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Services\MidtransService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    use ApiResponse;

    public function __construct(
        private MidtransService $midtrans
    ) {}

    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $event = Event::findOrFail($validated['event_id']);

        abort_unless($event->isPublished(), 400, 'Event is not available for purchase');

        $transaction = DB::transaction(function () use ($validated, $event, $request) {
            $totalAmount = 0;
            $transactionItems = [];

            foreach ($validated['items'] as $item) {
                $ticket = Ticket::where('id', $item['ticket_id'])
                    ->where('event_id', $event->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                abort_unless($ticket->is_active, 400, "Ticket {$ticket->name} is not active");
                abort_unless($ticket->hasEnoughStock($item['quantity']), 400, "Insufficient stock for {$ticket->name}");

                $subtotal = $ticket->price * $item['quantity'];
                $totalAmount += $subtotal;

                $transactionItems[] = [
                    'ticket' => $ticket,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            $transaction = Transaction::create([
                'event_id' => $event->id,
                'buyer_user_id' => $request->user()->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'status' => Transaction::STATUS_PENDING,
                'total_amount' => $totalAmount,
                'payment_deadline' => now()->addHours(24),
            ]);

            foreach ($transactionItems as $item) {
                $transaction->items()->create([
                    'ticket_id' => $item['ticket']->id,
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $item['ticket']->price,
                    'subtotal' => $item['subtotal'],
                ]);
            }

            $payment = $this->midtrans->createTransaction($transaction, $transaction->items);

            $transaction->update([
                'midtrans_order_id' => $transaction->code,
                'payment_deadline' => $payment['payment_deadline'] ?? $transaction->payment_deadline,
            ]);

            return $transaction->fresh();
        });

        return $this->created([
            'code' => $transaction->code,
            'total_amount' => $transaction->total_amount,
            'payment_deadline' => $transaction->payment_deadline,
        ], 'Checkout created successfully');
    }

    public function status(Request $request, string $code): JsonResponse
    {
        $transaction = Transaction::where('code', $code)
            ->where('buyer_user_id', $request->user()->id)
            ->with('items.ticket')
            ->firstOrFail();

        return $this->success($transaction);
    }
}
