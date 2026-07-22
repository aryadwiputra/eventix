import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import api from "~/lib/api";
import { useAuthStore } from "~/stores/auth";

const statusColors: Record<string, string> = {
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function OrganizerTransactions() {
  const token = useAuthStore((s) => s.token);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    api.get("/admin/transactions?per_page=20").then((r) => setTxs(r.data.data?.data ?? [])).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-iron-grey text-sm mt-1">Your event transactions</p>
      </div>

      <Card className="bg-primary border-bluish-purple overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-iron-grey">No transactions</td></tr>
              ) : txs.map((tx: any) => (
                <tr key={tx.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-mono text-xs">{tx.code}</td>
                  <td className="p-4">{tx.name}</td>
                  <td className="p-4 text-iron-grey">{tx.event?.name ?? "-"}</td>
                  <td className="p-4">Rp {(tx.total_amount ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColors[tx.status] ?? ""}>{tx.status}</Badge>
                  </td>
                  <td className="p-4 text-xs text-iron-grey">{tx.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
