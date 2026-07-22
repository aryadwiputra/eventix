<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Collection;

class MidtransService
{
    public function __construct()
    {
        if ($key = config('midtrans.server_key')) {
            \Midtrans\Config::$serverKey = $key;
            \Midtrans\Config::$clientKey = config('midtrans.client_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
            \Midtrans\Config::$is3ds = config('midtrans.is_3ds');
        }
    }

    public function createTransaction(Transaction $transaction, Collection $items): array
    {
        if (empty(config('midtrans.server_key'))) {
            return [
                'token' => 'mock-' . \Illuminate\Support\Str::random(16),
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/mock-' . \Illuminate\Support\Str::random(10),
            ];
        }

        $params = [
            'transaction_details' => [
                'order_id' => $transaction->code,
                'gross_amount' => $transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $transaction->name,
                'email' => $transaction->email,
            ],
            'item_details' => $items->map(fn ($item) => [
                'id' => (string) $item->ticket_id,
                'price' => $item->price_at_purchase,
                'quantity' => $item->quantity,
                'name' => $item->ticket->name,
            ])->toArray(),
        ];

        $snap = \Midtrans\Snap::createTransaction($params);

        return [
            'token' => $snap->token,
            'redirect_url' => $snap->redirect_url,
        ];
    }

    public function verifyNotification(array $notification): bool
    {
        if (empty(config('midtrans.server_key'))) {
            return true;
        }

        $orderId = $notification['order_id'] ?? '';
        $statusCode = $notification['status_code'] ?? '';
        $grossAmount = $notification['gross_amount'] ?? '';
        $serverKey = config('midtrans.server_key');
        $inputSignature = $notification['signature_key'] ?? '';
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expectedSignature, $inputSignature);
    }

    public function isAvailable(): bool
    {
        return !empty(config('midtrans.server_key'));
    }
}
