import { Link } from "react-router";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import type { ApiEvent } from "~/routes/landing";

export function FeaturedEventCard({ event }: { event: ApiEvent }) {
  const { t } = useTranslation();
  const startDate = new Date(event.start_time);
  const locale = i18n.language === "id" ? "id-ID" : "en-US";

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block rounded-2xl overflow-hidden bg-primary/80 backdrop-blur-sm border border-white/10 shadow-2xl hover:ring-2 hover:ring-secondary/50 transition-all duration-500 hover:-translate-y-2"
    >
      {event.photos && event.photos.length > 0 ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={`/storage/${event.photos[0]}`}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-secondary/20 to-bluish-purple flex items-center justify-center">
          <Ticket className="w-16 h-16 text-secondary/40" />
        </div>
      )}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-bold leading-tight group-hover:text-secondary transition-colors">
          {event.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-iron-grey">
          <Calendar className="w-4 h-4 text-secondary shrink-0" />
          {startDate.toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-iron-grey">
            <MapPin className="w-4 h-4 text-secondary shrink-0" />
            {event.location}
          </div>
        )}
        <div className="pt-2">
          {event.tickets_min_price !== null && event.tickets_min_price !== undefined
            ? (
              <span className="text-lg font-bold text-secondary">
                {event.tickets_min_price > 0
                  ? `Rp ${event.tickets_min_price.toLocaleString("id-ID")}+`
                  : t("eventCard.free")}
              </span>
            )
            : null}
        </div>
        <div className="inline-block w-full text-center rounded-[50px] bg-secondary text-dark-indigo font-semibold px-4 py-3 transition-all duration-300 group-hover:bg-secondary/80">
          {t("landing.hero.getTickets")}
        </div>
      </div>
    </Link>
  );
}
