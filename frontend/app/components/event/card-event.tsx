import { MapPin } from "lucide-react";
import { Link } from "react-router";

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
  const date = new Date(start_time);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const fmt = (n: number) => n.toString().padStart(2, "0");
  const formatted = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} · ${fmt(date.getHours())}:${fmt(date.getMinutes())}`;

  return (
    <div className="group relative rounded-2xl bg-primary overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-secondary/50">
      <div className="h-48 bg-bluish-purple flex items-center justify-center">
        <span className="text-4xl">🎟️</span>
        {is_popular && (
          <span className="absolute top-3 right-3 bg-butter-yellow text-dark-indigo text-xs font-semibold px-3 py-1 rounded-xl">
            Popular
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
          <span>{location ?? "Online"}</span>
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
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
