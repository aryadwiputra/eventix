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
  photos?: string[];
  tickets_min_price?: number;
}

export function EventCard({
  id,
  name,
  headline,
  location,
  start_time,
  is_popular,
  category,
  photos,
  tickets_min_price,
}: EventCardProps) {
  const { t } = useTranslation();
  const date = new Date(start_time);
  const locale = i18n.language === "id" ? "id-ID" : "en-US";
  const formatted = date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    + " · " + date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  const hasPhoto = photos && photos.length > 0;
  const hasPrice = tickets_min_price !== null && tickets_min_price !== undefined;
  const isSoldOut = tickets_min_price === null;

  return (
    <div className="group relative rounded-2xl bg-primary overflow-hidden transition-all duration-500 hover:ring-2 hover:ring-secondary/50 hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-1.5">
      <div className="h-48 overflow-hidden">
        {hasPhoto ? (
          <img
            src={`/storage/${photos![0]}`}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:-translate-y-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bluish-purple via-primary to-persian-pink/20 flex items-center justify-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent transition-opacity duration-500 group-hover:from-primary/70" />
        {is_popular && (
          <span className="absolute top-3 left-3 bg-butter-yellow text-dark-indigo text-xs font-semibold px-3 py-1 rounded-xl">
            {t("eventCard.popular")}
          </span>
        )}
        {isSoldOut && (
          <span className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-semibold px-3 py-1 rounded-xl">
            {t("eventCard.soldOut")}
          </span>
        )}
        {!isSoldOut && hasPrice && (
          <span className="absolute bottom-3 right-3 bg-secondary/90 text-dark-indigo text-xs font-semibold px-3 py-1 rounded-xl">
            {tickets_min_price > 0
              ? t("eventCard.fromPrice", { price: tickets_min_price.toLocaleString("id-ID") })
              : t("eventCard.free")}
          </span>
        )}
      </div>
      <div className="p-5 transition-transform duration-500 group-hover:-translate-y-11">
        <p className="text-sm text-pastel-purple mb-1">
          {category?.name ?? "Event"} · {formatted}
        </p>
        <h3 className="text-lg font-semibold truncate">{name}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-iron-grey">
          <MapPin className="w-4 h-4" />
          <span>{location ?? t("event.online")}</span>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-all duration-400 mt-3 -translate-y-1 group-hover:translate-y-0">
          {headline && (
            <p className="text-sm text-iron-grey line-clamp-2 mb-3">
              {headline}
            </p>
          )}
          <Link
            to={`/events/${id}`}
            className="inline-block rounded-[50px] bg-secondary text-dark-indigo font-semibold text-sm px-4 py-2 shadow-lg shadow-secondary/30 hover:bg-secondary/80 transition-all hover:shadow-secondary/50"
          >
            {t("eventCard.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
