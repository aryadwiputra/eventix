import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useForm } from "react-hook-form";
import api from "~/lib/api";

export default function EventTickets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [eventName, setEventName] = useState("");
  const [editing, setEditing] = useState<any | null>(null);

  const fetch = () => {
    api.get(`/admin/events/${id}`).then((r) => {
      setEventName(r.data.data.name);
      setTickets(r.data.data.tickets ?? []);
    }).catch(() => {});
  };
  useEffect(() => { fetch(); }, [id]);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    values: editing ? {
      name: editing.name ?? "",
      description: editing.description ?? "",
      price: String(editing.price ?? ""),
      quantity: String(editing.quantity ?? ""),
      max_per_transaction: String(editing.max_per_transaction ?? "10"),
    } : undefined,
  });

  const onSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      price: Number(data.price),
      quantity: Number(data.quantity),
      max_per_transaction: Number(data.max_per_transaction),
    };
    if (editing) {
      await api.put(`/admin/events/${id}/tickets/${editing.id}`, payload).catch(() => {});
    } else {
      await api.post(`/admin/events/${id}/tickets`, payload).catch(() => {});
    }
    setEditing(null);
    reset({ name: "", description: "", price: "", quantity: "", max_per_transaction: "10" });
    fetch();
  };

  const deleteTicket = (ticketId: number) => {
    if (!confirm("Delete this ticket type?")) return;
    api.delete(`/admin/events/${id}/tickets/${ticketId}`).then(fetch).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/organizer/events")} className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{eventName || "Event"}</h1>
          <p className="text-iron-grey text-sm mt-1">Manage ticket types</p>
        </div>
        <Button onClick={() => { setEditing({ name: "", description: "", price: "", quantity: "", max_per_transaction: "10", isNew: true }); }}>
          <Plus className="w-4 h-4" /> Add Ticket
        </Button>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Sold</th>
                <th className="p-4 font-medium">Active</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-iron-grey">No tickets yet</td></tr>
              ) : tickets.map((t: any) => (
                <tr key={t.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4">Rp {(t.price ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-4">{t.quantity}</td>
                  <td className="p-4">{t.sold_count ?? 0}</td>
                  <td className="p-4">{t.is_active ? <Badge variant="outline" className="bg-green-500/10 text-green-400">Active</Badge> : <Badge variant="outline">Inactive</Badge>}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditing(t)} className="p-1.5 rounded-lg hover:bg-secondary/10 text-iron-grey hover:text-secondary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTicket(t.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-iron-grey hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setEditing(null); reset(); }} />
          <form onSubmit={handleSubmit(onSubmit)} className="relative bg-primary border border-bluish-purple rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">{editing.isNew ? "Add" : "Edit"} Ticket</h2>
            <div className="space-y-4">
              <Input placeholder="Ticket name *" {...register("name", { required: true })} />
              <Input placeholder="Description" {...register("description")} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Price *" {...register("price", { required: true })} />
                <Input type="number" placeholder="Quantity *" {...register("quantity", { required: true })} />
              </div>
              <Input type="number" placeholder="Max per transaction (default: 10)" {...register("max_per_transaction")} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => { setEditing(null); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
