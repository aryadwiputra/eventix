import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface CountdownProps {
  target: Date;
}

export function Countdown({ target }: CountdownProps) {
  const { t } = useTranslation();
  const [diff, setDiff] = useState(target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff <= 0) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const box = (val: number, label: string) => (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
        <span className="text-xl md:text-2xl font-bold text-butter-yellow tabular-nums">
          {String(val).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-pastel-purple mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3 md:gap-4">
      {box(d, t("landing.countdown.days"))}
      <span className="text-2xl text-pastel-purple pb-6">:</span>
      {box(h, t("landing.countdown.hours"))}
      <span className="text-2xl text-pastel-purple pb-6">:</span>
      {box(m, t("landing.countdown.minutes"))}
      <span className="text-2xl text-pastel-purple pb-6">:</span>
      {box(s, t("landing.countdown.seconds"))}
    </div>
  );
}
