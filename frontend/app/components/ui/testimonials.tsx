import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  { nameKey: "item1Name", roleKey: "item1Role", quoteKey: "item1Quote" },
  { nameKey: "item2Name", roleKey: "item2Role", quoteKey: "item2Quote" },
  { nameKey: "item3Name", roleKey: "item3Role", quoteKey: "item3Quote" },
];

export function Testimonials() {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === items.length - 1 ? 0 : i + 1));

  const item = items[idx];

  return (
    <section className="py-20 bg-primary/30">
      <div className="max-w-screen-xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {t("landing.testimonials.title")}
        </h2>
        <p className="text-iron-grey mb-12">
          {t("landing.testimonials.subtitle")}
        </p>

        <div className="max-w-2xl mx-auto relative">
          <Quote className="w-10 h-10 text-secondary/30 mx-auto mb-4" />
          <p className="text-lg md:text-xl leading-relaxed text-iron-grey italic mb-6">
            &ldquo;{t(`landing.testimonials.${item.quoteKey}`)}&rdquo;
          </p>
          <p className="font-semibold">{t(`landing.testimonials.${item.nameKey}`)}</p>
          <p className="text-sm text-pastel-purple">{t(`landing.testimonials.${item.roleKey}`)}</p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-bluish-purple transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === idx ? "bg-secondary" : "bg-bluish-purple"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-bluish-purple transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
