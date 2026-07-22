import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";
import { useForm } from "react-hook-form";

export default function AdminCategories() {
  const token = useAuthStore((s) => s.token);
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchCats = () => {
    api.get("/admin/categories").then((r) => setCats(r.data.data ?? [])).catch(() => {});
  };
  useEffect(() => { fetchCats(); }, [token]);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    values: editing ? { name: editing.name, icon: editing.icon ?? "", description: editing.description ?? "" } : undefined,
  });

  const onSubmit = async (data: any) => {
    if (editing) {
      await api.put(`/admin/categories/${editing.id}`, data).catch(() => {});
    } else {
      await api.post("/admin/categories", data).catch(() => {});
    }
    setEditing(null);
    reset();
    fetchCats();
  };

  const deleteCat = (id: number) => {
    if (!confirm("Delete this category?")) return;
    api.delete(`/admin/categories/${id}`).then(fetchCats).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-iron-grey text-sm mt-1">Manage event categories</p>
        </div>
        <Button onClick={() => { setEditing({ name: "", icon: "", description: "" }); }}><Plus className="w-4 h-4" /> Add</Button>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Icon</th>
                <th className="p-4 font-medium">Active</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-iron-grey">No categories</td></tr>
              ) : cats.map((c: any) => (
                <tr key={c.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-iron-grey">{c.icon ?? "-"}</td>
                  <td className="p-4">{c.is_active ? "✅" : "❌"}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg hover:bg-secondary/10 text-iron-grey hover:text-secondary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCat(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-iron-grey hover:text-red-400 transition-colors">
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
            <h2 className="text-lg font-bold mb-4">{editing.id ? "Edit" : "Add"} Category</h2>
            <div className="space-y-4">
              <Input placeholder="Category name" {...register("name", { required: true })} />
              <Input placeholder="Icon slug (optional)" {...register("icon")} />
              <Input placeholder="Description (optional)" {...register("description")} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => { setEditing(null); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>Save</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
