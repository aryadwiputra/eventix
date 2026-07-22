import { MapPin } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

interface EventCardProps {
  id: number;
  name: string;
  headline?: string;
  location?: string;
  start_time: string;
  is_popular: boolean;
  category?: { name: string } | null;
}

export function EventCard({
  id,
  name,
  headline,
  location,
  start_time,
  is_popular,
  category,
}: EventCardProps) {
  const { t } = useTranslation();
  const date = new Date(start_time);
  const locale = i18n.language === "id" ? "id-ID" : "en-US";
  const formatted = date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    + " · " + date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="group relative rounded-2xl bg-primary overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-secondary/50">
      <div className="h-48 bg-bluish-purple flex items-center justify-center">
        <span className="text-4xl">🎟️</span>
        {is_popular && (
          <span className="absolute top-3 right-3 bg-butter-yellow text-dark-indigo text-xs font-semibold px-3 py-1 rounded-xl">
            {t("eventCard.popular")}
          </span>
        )}
      </div>
      <div className="p-5 group-hover:-translate-y-[70%] transition-transform duration-300">
        <p className="text-sm text-pastel-purple mb-1">
          {category?.name ?? "Event"} · {formatted}
        </p>
        <h3 className="text-lg font-semibold truncate">{name}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-iron-grey">
          <MapPin className="w-4 h-4" />
          <span>{location ?? t("event.online")}</span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-3">
          {headline && (
            <p className="text-sm text-iron-grey line-clamp-2 mb-3">
              {headline}
            </p>
          )}
          <Link
            to={`/events/${id}`}
            className="inline-block rounded-[50px] bg-secondary text-dark-indigo font-semibold text-sm px-4 py-2 hover:bg-secondary/80"
          >
            {t("eventCard.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
