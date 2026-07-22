<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketCode;
use App\Traits\ApiResponse;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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

    public function download(string $code): Response
    {
        $ticketCode = TicketCode::where('code', $code)
            ->whereHas('transactionItem.transaction', function ($q) {
                $q->where('buyer_user_id', auth()->id());
            })
            ->with('transactionItem.transaction.event', 'transactionItem.ticket')
            ->firstOrFail();

        $renderer = new ImageRenderer(
            new RendererStyle(180),
            new SvgImageBackEnd
        );
        $writer = new Writer($renderer);
        $qrCode = $writer->writeString("TICKETY:{$ticketCode->code}");

        $event = $ticketCode->transactionItem->transaction->event;
        $ticket = $ticketCode->transactionItem->ticket;

        $pdf = Pdf::loadView('tickets.pdf', [
            'qrCode' => $qrCode,
            'ticketCode' => $ticketCode->code,
            'ticket' => ['name' => $ticket->name],
            'event' => [
                'name' => $event->name,
                'start_time' => $event->start_time,
                'location' => $event->location,
            ],
            'buyerName' => $ticketCode->transactionItem->transaction->name,
        ]);

        return $pdf->download("ticket-{$ticketCode->code}.pdf");
    }
}
