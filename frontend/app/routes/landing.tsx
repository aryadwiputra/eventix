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
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { EventCard } from "~/components/event/card-event";
import { CategoryCard } from "~/components/event/card-category";
import { Countdown } from "~/components/ui/countdown";
import { Testimonials } from "~/components/ui/testimonials";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";
import { FeaturedEventCard } from "~/components/ui/featured-event-card";

export interface ApiEvent {
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
  photos?: string[];
  tickets_min_price?: number;
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/events").then((res) => {
      setEvents(res.data.data?.data ?? []);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) > now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const nextEvent = upcomingEvents[0];
  const nextEventDate = nextEvent ? new Date(nextEvent.start_time) : null;

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nextEventPhoto = nextEvent?.photos?.[0] ?? null;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background photo */}
        {loaded && nextEventPhoto && (
          <div className="absolute inset-0 animate-fade-in">
            <img
              src={`/storage/${nextEventPhoto}`}
              alt=""
              className="w-full h-full object-cover"
              style={{ transform: `translateY(${scrollY * 0.25}px)` }}
            />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-indigo/95 via-dark-indigo/60 to-dark-indigo/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-indigo via-dark-indigo/20 to-transparent" />

        {/* Decorative glow */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-persian-pink/5 rounded-full blur-3xl pointer-events-none" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-dark-indigo to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-screen-xl mx-auto px-6 grid lg:grid-cols-7 gap-12 items-center min-h-[75vh]">
            {/* Left column */}
            <div className="lg:col-span-4 animate-fade-in-up">
              <span className="inline-flex items-center gap-2 bg-persian-pink/20 text-persian-pink text-sm font-medium px-4 py-1 rounded-[50px] mb-6">
                {nextEvent && (
                  <span className="w-2 h-2 rounded-full bg-persian-pink animate-pulse" />
                )}
                {t("landing.hero.badge")}
              </span>

              <h1 className="text-[36px] md:text-[48px] font-bold leading-tight mb-4">
                {t("landing.hero.titleBefore")}{" "}
                <span className="bg-butter-yellow text-dark-indigo px-2">
                  {t("landing.hero.titleHighlight")}
                </span>{" "}
                {t("landing.hero.titleAfter")}
              </h1>

              <p className="text-iron-grey text-lg mb-6 max-w-lg">
                {t("landing.hero.subtitle")}
              </p>

              {/* Countdown */}
              {nextEventDate && nextEventDate > now && (
                <div className="mb-6 animate-fade-in animate-delay-200">
                  <p className="text-sm text-pastel-purple mb-2">
                    {t("landing.countdown.eventStartsIn")}
                  </p>
                  <Countdown target={nextEventDate} />
                </div>
              )}

              {/* Date & location badges */}
              {nextEvent && (
                <div className="flex flex-wrap gap-3 mb-8 text-sm animate-fade-in animate-delay-300">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur px-3 py-1.5 text-iron-grey border border-white/10">
                    <Calendar className="w-4 h-4 text-secondary" />
                    {new Date(nextEvent.start_time).toLocaleDateString(
                      i18n.language === "id" ? "id-ID" : "en-US",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </span>
                  {nextEvent.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur px-3 py-1.5 text-iron-grey border border-white/10">
                      <MapPin className="w-4 h-4 text-secondary" />
                      {nextEvent.location}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-4 animate-fade-in animate-delay-500">
                <a href="#events" className="rounded-[50px] font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 px-8 py-4 text-base bg-secondary text-dark-indigo hover:bg-secondary/80">
                  {t("landing.hero.exploreEvents")}
                </a>
                <Link to="/auth/register">
                  <Button variant="outline" size="lg" className="bg-white/5 backdrop-blur border-white/20 hover:bg-white/10">
                    {t("landing.hero.signUpFree")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Featured Event Card */}
            {loaded && nextEvent && (
              <div className="lg:col-span-3 hidden lg:block animate-fade-in animate-delay-300">
                <FeaturedEventCard event={nextEvent} />
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="max-w-screen-xl mx-auto px-6 mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
              {[
                { value: "500+", label: t("landing.socialProof.events") },
                { value: "50K+", label: t("landing.socialProof.tickets") },
                { value: "15K+", label: t("landing.socialProof.attendees") },
                { value: "25+", label: t("landing.socialProof.cities") },
              ].map((s, i) => (
                <div key={s.label} className={`text-center animate-fade-in animate-delay-${(i + 1) * 200}`}>
                  <p className="text-2xl md:text-3xl font-bold text-secondary">{s.value}</p>
                  <p className="text-sm text-iron-grey mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section id="events" className="py-20 scroll-mt-24">
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

      {/* Testimonials */}
      <Testimonials />

      {/* Categories */}
      <section className="py-20">
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
