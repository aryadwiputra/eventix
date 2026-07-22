import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowLeft } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";
import { useTranslation } from "react-i18next";

export default function CreateEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [cats, setCats] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", headline: "", description: "", type: "offline",
    start_time: "", end_time: "", location: "", meeting_link: "",
    category_id: "",
  });

  useEffect(() => {
    api.get("/admin/categories").then((r) => setCats(r.data.data ?? [])).catch(() => {});
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      if (payload.category_id) payload.category_id = Number(payload.category_id);
      else delete payload.category_id;
      if (!payload.end_time) delete payload.end_time;

      await api.post("/admin/events", payload);
      navigate("/organizer/events");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate("/organizer/events")} className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t("organizer.createEvent.back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold">{t("organizer.createEvent.title")}</h1>
        <p className="text-iron-grey text-sm mt-1">{t("organizer.createEvent.subtitle")}</p>
      </div>

      <Card className="bg-primary border-bluish-purple">
        <form onSubmit={submit} className="p-6 space-y-5">
          <Input placeholder={t("organizer.createEvent.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder={t("organizer.createEvent.headline")} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <textarea
            placeholder={t("organizer.createEvent.description")}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-2xl bg-primary border-2 border-transparent px-5 py-3 text-white placeholder:text-smoke-purple focus:border-persian-pink focus:outline-none transition-colors min-h-[120px] resize-y"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-iron-grey mb-1 block">{t("organizer.createEvent.type")}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none"
              >
                <option value="offline">{t("common.type.offline")}</option>
                <option value="online">{t("common.type.online")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-iron-grey mb-1 block">{t("organizer.createEvent.category")}</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none"
              >
                <option value="">{t("organizer.createEvent.noCategory")}</option>
                {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" placeholder={t("organizer.createEvent.startTime")} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            <Input type="datetime-local" placeholder={t("organizer.createEvent.endTime")} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          {form.type === "offline" && (
            <Input placeholder={t("organizer.createEvent.location")} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          )}
          {form.type === "online" && (
            <Input placeholder={t("organizer.createEvent.meetingLink")} value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} required />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/organizer/events")}>{t("organizer.createEvent.cancel")}</Button>
            <Button type="submit" disabled={submitting}>{submitting ? t("organizer.createEvent.submitting") : t("organizer.createEvent.submit")}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
