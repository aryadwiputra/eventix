<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::with('buyer', 'event')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->event_id, fn ($q, $id) => $q->where('event_id', $id))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return $this->success($transactions);
    }

    public function show(Transaction $transaction): JsonResponse
    {
        return $this->success($transaction->load('buyer', 'event', 'items.ticket', 'ticketCodes'));
    }

    public function updateStatus(Request $request, Transaction $transaction): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:paid,cancelled,failed,expired'],
        ]);

        $transaction->update(['status' => $validated['status']]);

        return $this->success($transaction->fresh(), 'Transaction status updated');
    }
}
