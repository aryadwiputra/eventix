import { useTranslation } from "react-i18next";
import { CalendarCheck, Ticket, Users, MapPin } from "lucide-react";

const stats = [
  { icon: CalendarCheck, count: "500+", key: "events" },
  { icon: Ticket, count: "50K+", key: "tickets" },
  { icon: Users, count: "30K+", key: "attendees" },
  { icon: MapPin, count: "25+", key: "cities" },
];

export function StatsStrip() {
  const { t } = useTranslation();
  return (
    <section className="py-16">
      <div className="max-w-screen-xl mx-auto px-6">
        <h3 className="text-center text-2xl md:text-3xl font-bold mb-10">
          {t("landing.socialProof.title")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.key}
              className="rounded-2xl bg-primary p-6 text-center hover:ring-2 hover:ring-secondary/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-bluish-purple flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl font-bold text-butter-yellow">{s.count}</p>
              <p className="text-sm text-pastel-purple mt-1">
                {t(`landing.socialProof.${s.key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
