import { DashboardSidebar } from "./dashboard-sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-dark-indigo flex">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-dark-indigo/80 backdrop-blur-md border-b border-primary h-16 flex items-center px-6 gap-4">
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-iron-grey hidden sm:block">{t("dashboard.sidebar.adminLabel")}</span>
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold text-secondary">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
