import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Pencil, Plus } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";

export default function AdminRoles() {
  const token = useAuthStore((s) => s.token);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);

  const fetchData = () => {
    api.get("/admin/roles").then((r) => setRoles(r.data.data ?? [])).catch(() => {});
    api.get("/admin/permissions").then((r) => setPermissions(r.data.data ?? [])).catch(() => {});
  };
  useEffect(() => { fetchData(); }, [token]);

  const openEdit = (role: any) => {
    setEditing(role);
    setSelectedPerms(role.permissions?.map((p: any) => p.id) ?? []);
  };

  const saveRole = () => {
    if (!editing) return;
    api.put(`/admin/roles/${editing.id}`, { permission_ids: selectedPerms })
      .then(() => { setEditing(null); fetchData(); })
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roles</h1>
        <p className="text-iron-grey text-sm mt-1">Manage roles and their permissions</p>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Permissions</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role: any) => (
                <tr key={role.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium capitalize">{role.name}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap max-w-md">
                      {(role.permissions ?? []).slice(0, 6).map((p: any) => (
                        <Badge key={p.id} variant="outline" className="text-xs">{p.name}</Badge>
                      ))}
                      {(role.permissions?.length ?? 0) > 6 && (
                        <span className="text-xs text-iron-grey">+{role.permissions.length - 6} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg hover:bg-secondary/10 text-iron-grey hover:text-secondary transition-colors">
                      <Pencil className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-primary border border-bluish-purple rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 capitalize">{editing.name} — Permissions</h2>
            <div className="grid grid-cols-2 gap-2">
              {permissions.map((p: any) => (
                <label key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bluish-purple/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPerms.includes(p.id)}
                    onChange={() => setSelectedPerms((prev) =>
                      prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                    )}
                    className="accent-secondary"
                  />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveRole}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
