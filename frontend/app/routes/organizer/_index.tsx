import { Card, CardContent } from "~/components/ui/card";
import { Calendar, Receipt, TrendingUp, Users } from "lucide-react";

export default function OrganizerOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
        <p className="text-iron-grey text-sm mt-1">Your events at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "Rp 0", icon: TrendingUp, color: "text-secondary" },
          { label: "My Events", value: "-", icon: Calendar, color: "text-butter-yellow" },
          { label: "Tickets Sold", value: "-", icon: Users, color: "text-persian-pink" },
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

      <div className="rounded-2xl bg-primary border border-bluish-purple p-8 text-center">
        <Calendar className="w-12 h-12 text-iron-grey mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-1">No events yet</h2>
        <p className="text-iron-grey text-sm mb-4">Create your first event to get started</p>
        <a href="/organizer/events" className="inline-flex items-center gap-2 rounded-[50px] bg-secondary text-dark-indigo font-semibold px-6 py-3 text-sm hover:bg-secondary/80 transition-colors">
          Create Event
        </a>
      </div>
    </div>
  );
}
