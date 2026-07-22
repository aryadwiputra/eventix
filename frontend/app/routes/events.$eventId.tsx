import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { MapPin, Clock, Calendar, Monitor, Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/stores/auth";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

interface TicketType {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  sold_count: number;
  max_per_transaction: number;
  is_active: boolean;
}

interface EventData {
  id: number;
  name: string;
  slug: string;
  headline: string | null;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  type: string;
  status: string;
  is_popular: boolean;
  category: { id: number; name: string } | null;
  organizer: { id: number; company_name?: string; user: { name: string } } | null;
  photos: string[];
  tickets: TicketType[];
}

function fmtDate(d: Date) {
  const locale = i18n.language === "id" ? "id-ID" : "en-US";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString(i18n.language === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function EventDetailPage() {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!eventId) return;
    api.get(`/events/${eventId}`).then((res) => {
      setEvent(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-iron-grey">{t("common.loading")}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t("event.notFound")}</h2>
          <Link to="/" className="text-secondary hover:underline">{t("event.backHome")}</Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const activeTickets = event.tickets.filter((t) => t.is_active);

  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const totalPrice = activeTickets.reduce((sum, t) => sum + (qty[t.id] || 0) * t.price, 0);

  const handleBook = () => {
    const selected = activeTickets
      .filter((t) => (qty[t.id] || 0) > 0)
      .map((t) => ({ id: t.id, name: t.name, qty: qty[t.id], price: t.price }));

    if (selected.length === 0) return;

    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: `/events/${eventId}` } });
      return;
    }

    navigate(`/checkout/${eventId}`, { state: { tickets: selected } });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative">
      <img src="/svgs/wavy-line-3.svg" className="absolute -z-10 w-full top-[300px]" alt="" />
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("event.backToEvents")}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Event Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <div>
              {event.is_popular && (
                <span className="inline-block bg-butter-yellow text-dark-indigo text-sm font-semibold px-4 py-1 rounded-xl mb-4">
                  {t("event.popular")}
                </span>
              )}
              <h1 className="text-[32px] md:text-[42px] font-bold leading-tight mb-2">
                {event.name}
              </h1>
              {event.headline && (
                <p className="text-iron-grey text-lg">{event.headline}</p>
              )}
            </div>

            {/* Event Photos */}
            {event.photos?.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {event.photos.map((p, i) => (
                  <img
                    key={i}
                    src={`/storage/${p}`}
                    className="rounded-2xl h-64 md:h-80 object-cover flex-shrink-0"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-bluish-purple h-64 md:h-80 flex items-center justify-center">
                <span className="text-6xl">🎟️</span>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-primary p-4">
                <Calendar className="w-5 h-5 text-secondary mb-2" />
                <p className="text-xs text-pastel-purple">{t("event.infoDate")}</p>
                <p className="text-sm font-semibold">{fmtDate(startDate)}</p>
              </div>
              <div className="rounded-xl bg-primary p-4">
                <Clock className="w-5 h-5 text-secondary mb-2" />
                <p className="text-xs text-pastel-purple">{t("event.infoTime")}</p>
                <p className="text-sm font-semibold">
                  {fmtTime(startDate)}{endDate ? ` - ${fmtTime(endDate)}` : ""}
                </p>
              </div>
              <div className="rounded-xl bg-primary p-4">
                <MapPin className="w-5 h-5 text-secondary mb-2" />
                <p className="text-xs text-pastel-purple">{t("event.infoLocation")}</p>
                <p className="text-sm font-semibold">{event.location ?? t("event.online")}</p>
              </div>
              <div className="rounded-xl bg-primary p-4">
                <Monitor className="w-5 h-5 text-secondary mb-2" />
                <p className="text-xs text-pastel-purple">{t("event.infoType")}</p>
                <p className="text-sm font-semibold capitalize">{event.type}</p>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-xl font-bold mb-3">
                  {t("event.aboutTitle")}{" "}
                  <span className="bg-butter-yellow text-dark-indigo px-1">{t("event.aboutHighlight")}</span>
                </h2>
                <p className="text-iron-grey leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Organizer */}
            {event.organizer && (
              <div className="rounded-2xl bg-primary p-5">
                <p className="text-sm text-pastel-purple mb-1">{t("event.organizedBy")}</p>
                <p className="font-semibold">
                  {event.organizer.company_name || event.organizer.user.name}
                </p>
              </div>
            )}
          </div>

          {/* Right: Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-primary p-6 space-y-4">
              <h3 className="text-lg font-bold text-secondary">{t("event.tickets.choose")}</h3>

              {activeTickets.length === 0 ? (
                <p className="text-iron-grey text-sm">{t("event.tickets.none")}</p>
              ) : (
                <>
                  {activeTickets.map((ticket) => {
                    const available = ticket.quantity - ticket.sold_count;
                    const selected = qty[ticket.id] || 0;
                    const max = Math.min(ticket.max_per_transaction, available);

                    return (
                      <div key={ticket.id} className="rounded-xl bg-bluish-purple p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{ticket.name}</p>
                            <p className="text-secondary text-lg font-bold">
                              Rp {ticket.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        {ticket.description && (
                          <p className="text-xs text-iron-grey mb-3">{ticket.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-pastel-purple">
                            {t("event.tickets.left", { count: available })}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setQty((prev) => ({
                                  ...prev,
                                  [ticket.id]: Math.max(0, selected - 1),
                                }))
                              }
                              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/60 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{selected}</span>
                            <button
                              onClick={() =>
                                setQty((prev) => ({
                                  ...prev,
                                  [ticket.id]: Math.min(max, selected + 1),
                                }))
                              }
                              disabled={selected >= max}
                              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/60 transition-colors disabled:opacity-30"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t border-bluish-purple pt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-iron-grey">{t("event.tickets.selected")}</span>
                      <span>{totalQty} {totalQty !== 1 ? t("event.tickets.tickets") : t("event.tickets.ticket")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("event.tickets.total")}</span>
                      <span className="text-secondary">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={totalQty === 0}
                    onClick={handleBook}
                  >
                    {t("event.tickets.book")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
