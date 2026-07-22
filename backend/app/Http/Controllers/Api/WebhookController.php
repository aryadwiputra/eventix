<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\MidtransService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    use ApiResponse;

    public function __construct(
        private MidtransService $midtrans
    ) {}

    public function midtrans(Request $request): JsonResponse
    {
        $notification = $request->all();

        if (!$this->midtrans->verifyNotification($notification)) {
            return $this->error('Invalid signature', 400);
        }

        $transaction = Transaction::where('midtrans_order_id', $notification['order_id'])
            ->firstOrFail();

        if ($transaction->isPaid()) {
            return $this->success(null, 'Already processed');
        }

        $transactionStatus = $notification['transaction_status'];
        $fraudStatus = $notification['fraud_status'] ?? 'accept';

        if (in_array($transactionStatus, ['capture', 'settlement'])
            && in_array($fraudStatus, ['accept', 'success'])
        ) {
            DB::transaction(function () use ($transaction, $notification, $transactionStatus) {
                $transaction->update([
                    'status' => Transaction::STATUS_PAID,
                    'midtrans_status' => $transactionStatus,
                    'payment_method' => $notification['payment_type'] ?? null,
                    'paid_at' => now(),
                ]);

                foreach ($transaction->items as $item) {
                    for ($i = 0; $i < $item->quantity; $i++) {
                        $item->ticketCodes()->create([]);
                    }
                    $item->ticket->incrementSoldCount($item->quantity);
                }
            });

            return $this->success(null, 'Payment success');
        }

        if (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'])) {
            $transaction->update([
                'status' => Transaction::STATUS_FAILED,
                'midtrans_status' => $transactionStatus,
            ]);

            return $this->success(null, 'Payment failed');
        }

        return $this->success(null, 'Pending');
    }
}

