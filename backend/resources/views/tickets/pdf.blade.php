<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket - {{ $ticketCode }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 40px; color: #1a1a2e; }
        .ticket { border: 3px dashed #6c63ff; border-radius: 16px; padding: 32px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 28px; margin: 0 0 4px; color: #6c63ff; }
        .header p { color: #666; font-size: 14px; margin: 0; }
        .qr { text-align: center; margin: 24px 0; }
        .qr img { width: 180px; height: 180px; }
        .info { border-top: 1px solid #e0e0e0; padding-top: 16px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .footer { text-align: center; margin-top: 24px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>{{ $event['name'] }}</h1>
            <p>{{ \Carbon\Carbon::parse($event['start_time'])->translatedFormat('l, d F Y H:i') }}</p>
        </div>

        <div class="qr">
            <img src="data:image/svg+xml;base64,{{ base64_encode($qrCode) }}" alt="QR Code">
        </div>

        <div class="info">
            <div class="row">
                <span class="label">Ticket Type</span>
                <span class="value">{{ $ticket['name'] }}</span>
            </div>
            <div class="row">
                <span class="label">Ticket Code</span>
                <span class="value">{{ $ticketCode }}</span>
            </div>
            @if($event['location'])
            <div class="row">
                <span class="label">Location</span>
                <span class="value">{{ $event['location'] }}</span>
            </div>
            @endif
            <div class="row">
                <span class="label">Buyer</span>
                <span class="value">{{ $buyerName }}</span>
            </div>
        </div>

        <div class="footer">
            Show this ticket at the entrance. Code: {{ $ticketCode }}
        </div>
    </div>
</body>
</html>
