import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";
import { useTranslation } from "react-i18next";

export default function AdminUsers() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    const params = search ? `?search=${search}` : "";
    api.get(`/admin/users${params}`).then((r) => setUsers(r.data.data?.data ?? [])).catch(() => {});
  };

  useEffect(() => { fetchUsers(); }, [token]);
  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [search]);

  const deleteUser = (id: number) => {
    if (!confirm(t("admin.users.deleteConfirm"))) return;
    api.delete(`/admin/users/${id}`).then(fetchUsers).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.users.title")}</h1>
          <p className="text-iron-grey text-sm mt-1">{t("admin.users.subtitle")}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron-grey" />
          <input
            className="w-full rounded-xl bg-primary border border-bluish-purple pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-smoke-purple focus:border-secondary focus:outline-none"
            placeholder={t("admin.users.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">{t("admin.users.name")}</th>
                <th className="p-4 font-medium">{t("admin.users.email")}</th>
                <th className="p-4 font-medium">{t("admin.users.roles")}</th>
                <th className="p-4 font-medium">{t("admin.users.created")}</th>
                <th className="p-4 font-medium text-right">{t("admin.users.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-iron-grey">{t("admin.users.noData")}</td></tr>
              ) : users.map((u: any) => (
                <tr key={u.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-iron-grey">{u.email}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {(u.roles ?? []).map((r: any) => (
                        <Badge key={r.id} variant="outline" className="text-xs">{r.name}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-iron-grey text-xs">{u.created_at?.slice(0, 10)}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-iron-grey hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
