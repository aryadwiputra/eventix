import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { X, LayoutDashboard, Calendar, Users, Shield, ListTree, Receipt, Settings, Ticket } from "lucide-react";
import { useAuthStore } from "~/stores/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  organizerOnly?: boolean;
  attendeeOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, adminOnly: true },
  { label: "Events", href: "/admin/events", icon: Calendar, adminOnly: true },
  { label: "Transactions", href: "/admin/transactions", icon: Receipt, adminOnly: true },
  { label: "Users", href: "/admin/users", icon: Users, adminOnly: true },
  { label: "Roles", href: "/admin/roles", icon: Shield, adminOnly: true },
  { label: "Categories", href: "/admin/categories", icon: ListTree, adminOnly: true },

  { label: "Dashboard", href: "/organizer", icon: LayoutDashboard, organizerOnly: true },
  { label: "My Events", href: "/organizer/events", icon: Calendar, organizerOnly: true },
  { label: "Transactions", href: "/organizer/transactions", icon: Receipt, organizerOnly: true },
];

export function DashboardSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles?.some((r) => r.name === "super_admin") ?? false;
  const isOrg = user?.roles?.some((r) => r.name === "organizer") ?? false;

  const items = navItems.filter((i) => {
    if (i.adminOnly) return isAdmin;
    if (i.organizerOnly) return isOrg;
    return true;
  });

  const sidebar = (
    <aside className="w-64 bg-primary border-r border-bluish-purple flex flex-col h-full">
      <div className="p-5 border-b border-bluish-purple flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Event<span className="text-secondary">ix</span>
        </Link>
        <button className="lg:hidden text-iron-grey" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-bluish-purple text-secondary border-l-2 border-secondary"
                  : "text-iron-grey hover:text-white hover:bg-bluish-purple/50",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-bluish-purple">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-iron-grey truncate">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0">
        {sidebar}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
