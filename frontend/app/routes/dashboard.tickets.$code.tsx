import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useAuthStore } from "~/stores/auth";
import { ArrowLeft, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "~/components/ui/button";
import api from "~/lib/api";

interface TicketDetail {
  id: number;
  code: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
  transaction_item: {
    price_at_purchase: number;
    ticket: { name: string; description: string | null };
    transaction: {
      code: string;
      status: string;
      event: { id: number; name: string; start_time: string; end_time: string | null; location: string | null };
    };
  };
}

export default function TicketDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true });
      return;
    }
    if (!code) return;
    api.get(`/tickets/${code}`).then((res) => {
      setTicket(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-iron-grey">Loading...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
          <Link to="/dashboard/tickets" className="text-secondary hover:underline">
            Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  const event = ticket.transaction_item.transaction.event;
  const startDate = new Date(event.start_time);

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <Link
          to="/dashboard/tickets"
          className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Tickets
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Ticket Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status Banner */}
            <div
              className={`rounded-2xl p-5 flex items-center gap-3 ${
                ticket.is_redeemed
                  ? "bg-green-500/10 text-green-400"
                  : "bg-secondary/10 text-secondary"
              }`}
            >
              {ticket.is_redeemed ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <div>
                <p className="font-semibold">
                  {ticket.is_redeemed ? "Ticket Used" : "Active Ticket"}
                </p>
                <p className="text-sm opacity-80">
                  {ticket.is_redeemed
                    ? `Redeemed at ${ticket.redeemed_at ? new Date(ticket.redeemed_at).toLocaleString("id-ID") : "-"}`
                    : "Show this QR code at the entrance"}
                </p>
              </div>
            </div>

            {/* Event Info */}
            <div className="rounded-2xl bg-primary p-6">
              <h1 className="text-2xl font-bold mb-4">{event.name}</h1>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-pastel-purple mb-1">Ticket Type</p>
                  <p className="font-semibold">
                    {ticket.transaction_item.ticket.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-pastel-purple mb-1">Ticket Code</p>
                  <p className="font-mono font-semibold text-secondary">{ticket.code}</p>
                </div>
                <div>
                  <p className="text-xs text-pastel-purple mb-1">Date</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-secondary" />
                    {startDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {event.location && (
                  <div>
                    <p className="text-xs text-pastel-purple mb-1">Location</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-secondary" />
                      {event.location}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-bluish-purple pt-4">
                <p className="text-xs text-pastel-purple mb-1">Transaction</p>
                <p className="font-mono text-sm">
                  {ticket.transaction_item.transaction.code}
                </p>
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl bg-primary p-8 text-center">
              <h3 className="font-bold mb-6">Your QR Code</h3>
              <div className="bg-white rounded-xl p-4 inline-block mx-auto mb-4">
                <QRCodeSVG
                  value={`TICKETY:${ticket.code}`}
                  size={200}
                  level="M"
                />
              </div>
              <p className="text-sm text-iron-grey">
                Show this code to the event staff for check-in
              </p>
              <div className="mt-6">
                <Link to={`/events/${event.id}`}>
                  <Button variant="outline" className="w-full">
                    View Event Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
