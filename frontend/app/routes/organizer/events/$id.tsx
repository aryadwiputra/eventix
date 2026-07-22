import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowLeft } from "lucide-react";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

export default function EditEvent() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [cats, setCats] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get("/admin/categories").then((r) => setCats(r.data.data ?? [])).catch(() => {});
    if (id) {
      api.get(`/admin/events/${id}`).then((r) => {
        const e = r.data.data;
        setForm({
          name: e.name ?? "", headline: e.headline ?? "", description: e.description ?? "",
          type: e.type ?? "offline", start_time: e.start_time ?? "", end_time: e.end_time ?? "",
          location: e.location ?? "", meeting_link: e.meeting_link ?? "", category_id: e.category_id ?? "",
          status: e.status ?? "draft",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      if (payload.category_id) payload.category_id = Number(payload.category_id);
      else delete payload.category_id;
      if (!payload.end_time) delete payload.end_time;

      await api.put(`/admin/events/${id}`, payload);
      navigate("/organizer/events");
    } catch { setSubmitting(false); }
  };

  if (loading) return <div className="text-iron-grey">{t("common.loading")}</div>;
  if (!form.name && form.name !== "") return <div className="text-iron-grey">{t("common.noData")}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate("/organizer/events")} className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t("organizer.editEvent.back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold">{t("organizer.editEvent.title")}</h1>
        <p className="text-iron-grey text-sm mt-1">{t("organizer.editEvent.subtitle")}</p>
      </div>

      <Card className="bg-primary border-bluish-purple">
        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="flex gap-4">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none"
            >
              <option value="draft">{t("common.status.draft")}</option>
              <option value="published">{t("common.status.published")}</option>
              <option value="cancelled">{t("common.status.cancelled")}</option>
            </select>
          </div>
          <Input placeholder={t("organizer.editEvent.name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder={t("organizer.editEvent.headline")} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <textarea
            placeholder={t("organizer.editEvent.description")}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-2xl bg-primary border-2 border-transparent px-5 py-3 text-white placeholder:text-smoke-purple focus:border-persian-pink focus:outline-none transition-colors min-h-[120px] resize-y"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-iron-grey mb-1 block">{t("organizer.editEvent.type")}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none">
                <option value="offline">{t("common.type.offline")}</option>
                <option value="online">{t("common.type.online")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-iron-grey mb-1 block">{t("organizer.editEvent.category")}</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none">
                <option value="">{t("organizer.editEvent.noCategory")}</option>
                {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" placeholder={t("organizer.editEvent.startTime")} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            <Input type="datetime-local" placeholder={t("organizer.editEvent.endTime")} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          {form.type === "offline" && <Input placeholder={t("organizer.editEvent.location")} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />}
          {form.type === "online" && <Input placeholder={t("organizer.editEvent.meetingLink")} value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} required />}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/organizer/events")}>{t("organizer.editEvent.cancel")}</Button>
            <Button type="submit" disabled={submitting}>{submitting ? t("organizer.editEvent.submitting") : t("organizer.editEvent.submit")}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
