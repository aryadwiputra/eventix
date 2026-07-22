import { ArrowRight, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const gradients: Record<string, string> = {
  Music: "from-persian-pink/30 via-primary to-transparent",
  Conference: "from-secondary/30 via-primary to-transparent",
  Workshop: "from-butter-yellow/20 via-primary to-transparent",
  Festival: "from-persian-pink/20 via-bluish-purple to-transparent",
  Sports: "from-secondary/20 via-primary to-transparent",
  Travel: "from-butter-yellow/10 via-primary to-transparent",
  Business: "from-secondary/10 via-bluish-purple to-transparent",
  Charity: "from-persian-pink/10 via-primary to-transparent",
};

const borderGlows: Record<string, string> = {
  Music: "hover:ring-persian-pink/50",
  Conference: "hover:ring-secondary/50",
  Workshop: "hover:ring-butter-yellow/50",
  Festival: "hover:ring-persian-pink/40",
  Sports: "hover:ring-secondary/40",
  Travel: "hover:ring-butter-yellow/40",
  Business: "hover:ring-secondary/30",
  Charity: "hover:ring-persian-pink/30",
};

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  eventCount: number;
}

export function CategoryCard({ name, icon: Icon, eventCount }: CategoryCardProps) {
  const { t } = useTranslation();
  const grad = gradients[name] ?? "from-bluish-purple/30 via-primary to-transparent";
  const glow = borderGlows[name] ?? "hover:ring-secondary/50";

  return (
    <div
      className={`group relative flex items-center gap-4 rounded-2xl bg-primary p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:ring-2 ${glow} overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${grad})` }}
      />
      <div className="relative z-10 flex items-center gap-4 w-full">
        <div className="w-12 h-12 rounded-xl bg-bluish-purple flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6 text-secondary" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold">{name}</h4>
          <p className="text-sm text-pastel-purple">{t("categoryCard.events", { count: eventCount })}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-pastel-purple opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </div>
    </div>
  );
}
