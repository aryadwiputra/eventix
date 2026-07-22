import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Ticket,
  Shield,
  QrCode,
  Music,
  Mic,
  Code,
  Palette,
  Trophy,
  Plane,
  Briefcase,
  Heart,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { EventCard } from "~/components/event/card-event";
import { CategoryCard } from "~/components/event/card-category";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

interface ApiEvent {
  id: number;
  name: string;
  slug: string;
  headline?: string;
  location?: string;
  start_time: string;
  type: string;
  status: string;
  is_popular: boolean;
  category?: { name: string } | null;
}

const features = [
  {
    icon: Ticket,
    titleKey: "landing.features.easyBookingTitle",
    descKey: "landing.features.easyBookingDesc",
  },
  {
    icon: Shield,
    titleKey: "landing.features.securePaymentTitle",
    descKey: "landing.features.securePaymentDesc",
  },
  {
    icon: QrCode,
    titleKey: "landing.features.qrCheckinTitle",
    descKey: "landing.features.qrCheckinDesc",
  },
];

const steps = [
  { step: 1, titleKey: "landing.howItWorks.step1Title", descKey: "landing.howItWorks.step1Desc" },
  { step: 2, titleKey: "landing.howItWorks.step2Title", descKey: "landing.howItWorks.step2Desc" },
  { step: 3, titleKey: "landing.howItWorks.step3Title", descKey: "landing.howItWorks.step3Desc" },
];

const categories = [
  { name: "Music", icon: Music, count: 12 },
  { name: "Conference", icon: Mic, count: 8 },
  { name: "Workshop", icon: Code, count: 6 },
  { name: "Festival", icon: Palette, count: 4 },
  { name: "Sports", icon: Trophy, count: 3 },
  { name: "Travel", icon: Plane, count: 2 },
  { name: "Business", icon: Briefcase, count: 5 },
  { name: "Charity", icon: Heart, count: 1 },
];

export default function Landing() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
    api.get("/events").then((res) => {
      setEvents(res.data.data?.data ?? []);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="max-w-screen-xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-[480px]">
            <span className="inline-block bg-persian-pink/20 text-persian-pink text-sm font-medium px-4 py-1 rounded-[50px] mb-6">
              {t("landing.hero.badge")}
            </span>
            <h1 className="text-[36px] md:text-[48px] font-bold leading-tight mb-4">
              {t("landing.hero.titleBefore")}{" "}
              <span className="bg-butter-yellow text-dark-indigo px-2">
                {t("landing.hero.titleHighlight")}
              </span>{" "}
              {t("landing.hero.titleAfter")}
            </h1>
            <p className="text-iron-grey text-lg mb-8">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex gap-4">
              <Button variant="secondary" size="lg">
                {t("landing.hero.exploreEvents")}
              </Button>
              <Link to="/auth/register">
                <Button variant="outline" size="lg">
                  {t("landing.hero.signUpFree")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="rounded-2xl bg-primary p-6 shadow-2xl w-full max-w-[480px]">
              <div className="rounded-xl bg-bluish-purple p-8 text-center">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-bold text-secondary mb-2">
                  {t("landing.hero.cardTitle")}
                </h3>
                <p className="text-iron-grey text-sm">
                  {t("landing.hero.cardSubtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <img src="/svgs/wavy-line-1.svg" className="absolute -z-10 w-full mt-[-200px]" alt="" />

      {/* Events Grid */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-[24px] md:text-[38px] font-bold text-center mb-12">
            {t("landing.events.titleBefore")}{" "}
            <span className="bg-butter-yellow text-dark-indigo px-2">
              {t("landing.events.titleHighlight")}
            </span>
            {t("landing.events.titleAfter")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-primary/30">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-[24px] md:text-[38px] font-bold text-center mb-12">
            {t("landing.features.titleBefore")}{" "}
            <span className="bg-butter-yellow text-dark-indigo px-2">
              {t("landing.features.titleHighlight")}
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.titleKey}
                className="rounded-2xl bg-primary p-6 text-center hover:ring-2 hover:ring-secondary/50 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-bluish-purple flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t(f.titleKey)}</h3>
                <p className="text-iron-grey text-sm">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-[24px] md:text-[38px] font-bold text-center mb-12">
            {t("landing.howItWorks.titleBefore")}{" "}
            <span className="bg-butter-yellow text-dark-indigo px-2">
              {t("landing.howItWorks.titleHighlight")}
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl bg-primary p-6 text-center relative"
              >
                <span className="absolute -top-4 left-6 bg-secondary text-dark-indigo w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {s.step}
                </span>
                <h3 className="text-lg font-semibold mt-3 mb-2">{t(s.titleKey)}</h3>
                <p className="text-iron-grey text-sm">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-primary/30">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-[24px] md:text-[38px] font-bold text-center mb-12">
            {t("landing.categories.titleBefore")}{" "}
            <span className="bg-butter-yellow text-dark-indigo px-2">
              {t("landing.categories.titleHighlight")}
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <CategoryCard
                key={c.name}
                name={c.name}
                icon={c.icon}
                eventCount={c.count}
              />
            ))}
          </div>
        </div>
      </section>

      <img src="/svgs/wavy-line-2.svg" className="absolute -z-10 w-full mt-[-200px]" alt="" />

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-[28px] md:text-[42px] font-bold mb-4">
            {t("landing.cta.titleBefore")}{" "}
            <span className="bg-butter-yellow text-dark-indigo px-2">
              {t("landing.cta.titleHighlight")}
            </span>
          </h2>
          <p className="text-iron-grey text-lg mb-8 max-w-lg mx-auto">
            {t("landing.cta.subtitle")}
          </p>
          <Button variant="secondary" size="lg">
            {t("landing.cta.browseEvents")}
          </Button>
        </div>
      </section>
    </div>
  );
}
