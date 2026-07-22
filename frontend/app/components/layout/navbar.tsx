import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/stores/auth";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "~/lib/i18n";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-indigo/80 backdrop-blur-md border-b border-primary">
      <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          {t("nav.brand")}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/events"
            className="text-iron-grey hover:text-white transition-colors"
          >
            {t("nav.events")}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard/tickets"
                className="text-iron-grey hover:text-white transition-colors"
              >
                {t("nav.myTickets")}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Link to="/auth/login">
              <Button size="sm">{t("nav.signIn")}</Button>
            </Link>
          )}

          <button
            onClick={() => i18n.changeLanguage(i18n.language === "id" ? "en" : "id")}
            className="flex items-center gap-1.5 text-sm text-iron-grey hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            {i18n.language === "id" ? "EN" : "ID"}
          </button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary px-6 py-4 flex flex-col gap-4">
          <Link
            to="/events"
            className="text-iron-grey"
            onClick={() => setOpen(false)}
          >
            {t("nav.events")}
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard/tickets"
                className="text-iron-grey"
                onClick={() => setOpen(false)}
              >
                {t("nav.myTickets")}
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Link to="/auth/login" onClick={() => setOpen(false)}>
              <Button>{t("nav.signIn")}</Button>
            </Link>
          )}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === "id" ? "en" : "id")}
            className="flex items-center gap-1.5 text-sm text-iron-grey hover:text-white"
          >
            <Globe className="w-4 h-4" />
            {i18n.language === "id" ? "EN" : "ID"}
          </button>
        </div>
      )}
    </nav>
  );
}
