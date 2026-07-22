import { ArrowRight, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  eventCount: number;
}

export function CategoryCard({ name, icon: Icon, eventCount }: CategoryCardProps) {
  const { t } = useTranslation();
  return (
    <div className="group flex items-center gap-4 rounded-2xl bg-primary p-5 cursor-pointer hover:ring-2 hover:ring-butter-yellow transition-all">
      <div className="w-12 h-12 rounded-xl bg-bluish-purple flex items-center justify-center">
        <Icon className="w-6 h-6 text-secondary" />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold">{name}</h4>
        <p className="text-sm text-pastel-purple">{t("categoryCard.events", { count: eventCount })}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-pastel-purple opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
    </div>
  );
}
