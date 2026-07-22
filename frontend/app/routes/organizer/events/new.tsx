import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowLeft } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";

export default function CreateEvent() {
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
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <div>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-iron-grey text-sm mt-1">Fill in the details for your new event</p>
      </div>

      <Card className="bg-primary border-bluish-purple">
        <form onSubmit={submit} className="p-6 space-y-5">
          <Input placeholder="Event name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="Headline (optional)" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-2xl bg-primary border-2 border-transparent px-5 py-3 text-white placeholder:text-smoke-purple focus:border-persian-pink focus:outline-none transition-colors min-h-[120px] resize-y"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-iron-grey mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-iron-grey mb-1 block">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-xl bg-primary border border-bluish-purple px-4 py-3 text-sm text-white focus:border-secondary focus:outline-none"
              >
                <option value="">No category</option>
                {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="datetime-local" placeholder="Start time *" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
            <Input type="datetime-local" placeholder="End time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          {form.type === "offline" && (
            <Input placeholder="Location *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          )}
          {form.type === "online" && (
            <Input placeholder="Meeting link *" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} required />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/organizer/events")}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Event"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
