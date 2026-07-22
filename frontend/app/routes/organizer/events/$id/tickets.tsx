import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useForm } from "react-hook-form";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

export default function EventTickets() {
  const { t } = useTranslation();
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
    if (!confirm(t("organizer.tickets.deleteConfirm"))) return;
    api.delete(`/admin/events/${id}/tickets/${ticketId}`).then(fetch).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/organizer/events")} className="inline-flex items-center gap-2 text-iron-grey hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t("organizer.tickets.back")}
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{eventName || "Event"}</h1>
          <p className="text-iron-grey text-sm mt-1">{t("organizer.tickets.title")}</p>
        </div>
        <Button onClick={() => { setEditing({ name: "", description: "", price: "", quantity: "", max_per_transaction: "10", isNew: true }); }}>
          <Plus className="w-4 h-4" /> {t("organizer.tickets.addTicket")}
        </Button>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">{t("organizer.tickets.name")}</th>
                <th className="p-4 font-medium">{t("organizer.tickets.price")}</th>
                <th className="p-4 font-medium">{t("organizer.tickets.qty")}</th>
                <th className="p-4 font-medium">{t("organizer.tickets.sold")}</th>
                <th className="p-4 font-medium">{t("organizer.tickets.activeCol")}</th>
                <th className="p-4 font-medium text-right">{t("organizer.tickets.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-iron-grey">{t("organizer.tickets.noData")}</td></tr>
              ) : tickets.map((t: any) => (
                <tr key={t.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4">Rp {(t.price ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-4">{t.quantity}</td>
                  <td className="p-4">{t.sold_count ?? 0}</td>
                  <td className="p-4">                      {t.is_active ? <Badge variant="outline" className="bg-green-500/10 text-green-400">{t("common.active")}</Badge> : <Badge variant="outline">{t("common.inactive")}</Badge>}</td>
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
            <h2 className="text-lg font-bold mb-4">{editing.isNew ? t("organizer.tickets.dialogAdd") : t("organizer.tickets.dialogEdit")}</h2>
            <div className="space-y-4">
              <Input placeholder={t("organizer.tickets.dialogName")} {...register("name", { required: true })} />
              <Input placeholder={t("organizer.tickets.dialogDesc")} {...register("description")} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder={t("organizer.tickets.dialogPrice")} {...register("price", { required: true })} />
                <Input type="number" placeholder={t("organizer.tickets.dialogQty")} {...register("quantity", { required: true })} />
              </div>
              <Input type="number" placeholder={t("organizer.tickets.dialogMax")} {...register("max_per_transaction")} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => { setEditing(null); reset(); }}>{t("organizer.tickets.cancel")}</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("organizer.tickets.saving") : t("organizer.tickets.save")}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
