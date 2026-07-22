import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { EventCard } from "~/components/event/card-event";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

interface Category {
  id: number;
  name: string;
  slug: string;
}

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
  category?: Category | null;
  photos?: string[];
  tickets_min_price?: number;
}

export default function EventsIndex() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const DEBOUNCE_MS = 300;

  const fetchEvents = (p: number, append: boolean) => {
    const loader = append ? setLoadingMore : setLoading;
    loader(true);
    const params: Record<string, string | number> = { per_page: 12, page: p };
    if (search) params.search = search;
    if (selectedCategory) params.category_id = selectedCategory;
    if (selectedType) params.type = selectedType;

    api.get("/events", { params })
      .then((res) => {
        const d = res.data.data;
        setEvents(append ? (prev) => [...prev, ...(d.data ?? [])] : (d.data ?? []));
        setHasMore(d.current_page < d.last_page);
      })
      .catch(() => {})
      .finally(() => loader(false));
  };

  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    setEvents([]);
    setHasMore(true);
    const timer = setTimeout(() => fetchEvents(1, false), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedType]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEvents(next, true);
  };

  const hasFilters = search !== "" || selectedCategory !== null || selectedType !== "";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedType("");
  };

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-persian-pink/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-screen-xl mx-auto px-6">
          <h1 className="text-[32px] md:text-[44px] font-bold text-center mb-4 animate-fade-in-up">
            {t("eventsPage.title")}
          </h1>
          <p className="text-iron-grey text-lg text-center mb-8 max-w-xl mx-auto animate-fade-in-up animate-delay-100">
            {t("eventsPage.subtitle")}
          </p>

          <div className="max-w-xl mx-auto mb-6 animate-fade-in-up animate-delay-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pastel-purple" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("eventsPage.searchPlaceholder")}
                className="w-full h-12 pl-12 pr-10 rounded-[50px] bg-primary border border-bluish-purple text-white placeholder:text-pastel-purple focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-pastel-purple hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-6 animate-fade-in-up animate-delay-300">
            {[
              { value: "", label: t("eventsPage.filterAllType") },
              { value: "offline", label: t("eventsPage.filterOffline") },
              { value: "online", label: t("eventsPage.filterOnline") },
            ].map((ft) => (
              <button
                key={ft.value}
                onClick={() => setSelectedType(ft.value)}
                className={`px-5 py-2 rounded-[50px] text-sm font-medium transition-all cursor-pointer ${
                  selectedType === ft.value
                    ? "bg-secondary text-dark-indigo"
                    : "bg-primary text-iron-grey hover:bg-bluish-purple border border-bluish-purple"
                }`}
              >
                {ft.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up animate-delay-400">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-[50px] text-sm font-medium transition-all cursor-pointer ${
                  selectedCategory === null
                    ? "bg-secondary text-dark-indigo"
                    : "bg-primary text-iron-grey hover:bg-bluish-purple border border-bluish-purple"
                }`}
              >
                {t("eventsPage.filterAll")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-[50px] text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-secondary text-dark-indigo"
                      : "bg-primary text-iron-grey hover:bg-bluish-purple border border-bluish-purple"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-screen-xl mx-auto px-6">
          {(hasFilters || events.length > 0) && (
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <p className="text-iron-grey text-sm">
                {t("eventsPage.showingResults", { count: events.length })}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  {t("eventsPage.clearFilters")}
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-primary h-80 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-pastel-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("eventsPage.noEvents")}</h3>
              <p className="text-iron-grey mb-4 max-w-md mx-auto">{t("eventsPage.noEventsDesc")}</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="rounded-[50px] bg-secondary text-dark-indigo font-semibold text-sm px-6 py-2 hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  {t("eventsPage.clearFilters")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, i) => (
                  <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${(i % 3) * 100}ms` }}>
                    <EventCard {...event} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-[50px] bg-primary text-iron-grey font-medium px-8 py-3 border border-bluish-purple hover:bg-bluish-purple hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? t("common.loading") : t("eventsPage.loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
