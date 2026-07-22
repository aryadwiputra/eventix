<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketCode;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserTicketController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $ticketCodes = TicketCode::whereHas('transactionItem.transaction', function ($q) {
            $q->where('buyer_user_id', auth()->id());
        })->with('transactionItem.transaction.event', 'transactionItem.ticket')
            ->latest()
            ->paginate($request->per_page ?? 15);

        return $this->success($ticketCodes);
    }

    public function show(string $code): JsonResponse
    {
        $ticketCode = TicketCode::where('code', $code)
            ->whereHas('transactionItem.transaction', function ($q) {
                $q->where('buyer_user_id', auth()->id());
            })
            ->with('transactionItem.transaction.event', 'transactionItem.ticket')
            ->firstOrFail();

        return $this->success($ticketCode);
    }
}
