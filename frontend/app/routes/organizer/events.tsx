import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";
import { useTranslation } from "react-i18next";

const statusColors: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function OrganizerEvents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = () => {
    api.get("/admin/events?per_page=50").then((r) => setEvents(r.data.data?.data ?? [])).catch(() => {});
  };
  useEffect(() => { fetchEvents(); }, [token]);

  const deleteEvent = (id: number) => {
    if (!confirm(t("organizer.events.deleteConfirm"))) return;
    api.delete(`/admin/events/${id}`).then(fetchEvents).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("organizer.events.title")}</h1>
          <p className="text-iron-grey text-sm mt-1">{t("organizer.events.subtitle")}</p>
        </div>
        <Button onClick={() => navigate("/organizer/events/new")}><Plus className="w-4 h-4" /> {t("organizer.events.createEvent")}</Button>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">{t("organizer.events.name")}</th>
                <th className="p-4 font-medium">{t("organizer.events.type")}</th>
                <th className="p-4 font-medium">{t("organizer.events.status")}</th>
                <th className="p-4 font-medium">{t("organizer.events.date")}</th>
                <th className="p-4 font-medium text-right">{t("organizer.events.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-iron-grey">{t("organizer.events.noData")}</td></tr>
              ) : events.map((e: any) => (
                <tr key={e.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium">{e.name}</td>
                  <td className="p-4 capitalize text-iron-grey">{e.type}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[e.status] ?? ""}>{t("common.status." + e.status)}</Badge>
                  </td>
                  <td className="p-4 text-xs text-iron-grey">{e.start_time?.slice(0, 10)}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => navigate(`/organizer/events/${e.id}`)}
                        className="p-1.5 rounded-lg hover:bg-secondary/10 text-iron-grey hover:text-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/organizer/events/${e.id}/tickets`)}
                        className="p-1.5 rounded-lg hover:bg-secondary/10 text-iron-grey hover:text-secondary transition-colors"
                      >
                        <Ticket className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteEvent(e.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-iron-grey hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
