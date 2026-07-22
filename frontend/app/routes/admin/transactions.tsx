import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Select } from "~/components/ui/select";
import api from "~/lib/api";
import { useTranslation } from "react-i18next";

const statusColors: Record<string, string> = {
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminTransactions() {
  const { t } = useTranslation();
  const [txs, setTxs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const fetch = () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    api.get(`/admin/transactions${params}`).then((r) => setTxs(r.data.data?.data ?? [])).catch(() => {});
  };
  useEffect(() => { fetch(); }, [statusFilter]);

  const updateStatus = (id: number, status: string) => {
    api.put(`/admin/transactions/${id}/status`, { status }).then(fetch).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.transactions.title")}</h1>
        <p className="text-iron-grey text-sm mt-1">{t("admin.transactions.subtitle")}</p>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-primary border border-bluish-purple px-4 py-2.5 text-sm text-white focus:border-secondary focus:outline-none"
        >
          <option value="">{t("admin.transactions.all")}</option>
          <option value="pending">{t("common.status.pending")}</option>
          <option value="paid">{t("common.status.paid")}</option>
          <option value="expired">{t("common.status.expired")}</option>
          <option value="cancelled">{t("common.status.cancelled")}</option>
          <option value="failed">{t("common.status.failed")}</option>
        </select>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">{t("admin.transactions.code")}</th>
                <th className="p-4 font-medium">{t("admin.transactions.name")}</th>
                <th className="p-4 font-medium">{t("admin.transactions.event")}</th>
                <th className="p-4 font-medium">{t("admin.transactions.amount")}</th>
                <th className="p-4 font-medium">{t("admin.transactions.status")}</th>
                <th className="p-4 font-medium">{t("admin.transactions.date")}</th>
                <th className="p-4 font-medium text-right">{t("admin.transactions.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-iron-grey">{t("admin.transactions.noData")}</td></tr>
              ) : txs.map((tx: any) => (
                <tr key={tx.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-mono text-xs">{tx.code}</td>
                  <td className="p-4">{tx.name}</td>
                  <td className="p-4 text-iron-grey">{tx.event?.name ?? "-"}</td>
                  <td className="p-4">Rp {(tx.total_amount ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[tx.status] ?? ""}>{t("common.status." + tx.status)}</Badge>
                  </td>
                  <td className="p-4 text-xs text-iron-grey">{tx.created_at?.slice(0, 10)}</td>
                  <td className="p-4 text-right">
                    {tx.status === "pending" && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => updateStatus(tx.id, "paid")} className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs hover:bg-green-500/20">{t("admin.transactions.approve")}</button>
                        <button onClick={() => updateStatus(tx.id, "expired")} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20">{t("admin.transactions.expire")}</button>
                      </div>
                    )}
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
