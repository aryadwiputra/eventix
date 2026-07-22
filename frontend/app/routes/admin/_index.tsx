import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Users, Calendar, Receipt, TrendingUp } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import api from "~/lib/api";

const statusColor: Record<string, string> = {
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AdminOverview() {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    api.get("/admin/transactions?per_page=5").then((r) => setTxs(r.data.data?.data ?? [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-iron-grey text-sm mt-1">Overview of all activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "Rp 0", icon: TrendingUp, color: "text-secondary" },
          { label: "Events", value: "-", icon: Calendar, color: "text-butter-yellow" },
          { label: "Users", value: "-", icon: Users, color: "text-persian-pink" },
          { label: "Transactions", value: "-", icon: Receipt, color: "text-secondary" },
        ].map((s) => (
          <Card key={s.label} className="bg-primary border-bluish-purple">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-iron-grey">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary border-bluish-purple">
        <div className="p-5 border-b border-bluish-purple flex items-center justify-between">
          <h2 className="font-semibold">Recent Transactions</h2>
          <Link to="/admin/transactions">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bluish-purple text-left text-iron-grey">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-iron-grey">No transactions yet</td></tr>
              ) : txs.map((tx: any) => (
                <tr key={tx.id} className="border-b border-bluish-purple/50">
                  <td className="p-4 font-mono">{tx.code}</td>
                  <td className="p-4">{tx.name}</td>
                  <td className="p-4">Rp {(tx.total_amount ?? 0).toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={statusColor[tx.status] ?? ""}>{tx.status}</Badge>
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
