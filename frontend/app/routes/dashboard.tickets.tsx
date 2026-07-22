import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "~/stores/auth";
import { QrCode, Ticket, MapPin, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import api from "~/lib/api";

interface TicketCodeItem {
  id: number;
  code: string;
  is_redeemed: boolean;
  created_at: string;
  transaction_item: {
    transaction: {
      code: string;
      status: string;
      event: { id: number; name: string; start_time: string; location: string | null };
    };
    ticket: { name: string };
  };
}

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tickets, setTickets] = useState<TicketCodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true });
      return;
    }
    api.get("/tickets").then((res) => {
      setTickets(res.data.data?.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-iron-grey">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Ticket className="w-6 h-6 text-secondary" />
          <h1 className="text-2xl font-bold">My Tickets</h1>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 text-iron-grey mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Tickets Yet</h2>
            <p className="text-iron-grey mb-6">
              Explore events and grab your first ticket!
            </p>
            <Link to="/">
              <Button variant="secondary">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/dashboard/tickets/${t.code}`}
                className="rounded-2xl bg-primary p-5 hover:ring-2 hover:ring-secondary/50 transition-all block"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">
                      {t.transaction_item.transaction.event.name}
                    </h3>
                    <p className="text-sm text-iron-grey">
                      {t.transaction_item.ticket.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-xl ${
                        t.is_redeemed
                          ? "bg-green-500/20 text-green-400"
                          : "bg-secondary/20 text-secondary"
                      }`}
                    >
                      {t.is_redeemed ? "Used" : "Active"}
                    </span>
                    <QrCode className="w-5 h-5 text-iron-grey" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-pastel-purple">
                  <span className="font-mono">{t.code}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(
                      t.transaction_item.transaction.event.start_time,
                    ).toLocaleDateString("id-ID")}
                  </span>
                  {t.transaction_item.transaction.event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t.transaction_item.transaction.event.location}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
