import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Pencil, Trash2, Ticket } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";

const statusColors: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function OrganizerEvents() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = () => {
    api.get("/admin/events?per_page=50").then((r) => setEvents(r.data.data?.data ?? [])).catch(() => {});
  };
  useEffect(() => { fetchEvents(); }, [token]);

  const deleteEvent = (id: number) => {
    if (!confirm("Delete this event?")) return;
    api.delete(`/admin/events/${id}`).then(fetchEvents).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-iron-grey text-sm mt-1">Manage your events</p>
        </div>
        <Button onClick={() => navigate("/organizer/events/new")}><Plus className="w-4 h-4" /> Create Event</Button>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-iron-grey">No events yet</td></tr>
              ) : events.map((e: any) => (
                <tr key={e.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium">{e.name}</td>
                  <td className="p-4 capitalize text-iron-grey">{e.type}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[e.status] ?? ""}>{e.status}</Badge>
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
