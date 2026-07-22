import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/stores/auth";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-indigo/80 backdrop-blur-md border-b border-primary">
      <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Ticke<span className="text-secondary">ty</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/events"
            className="text-iron-grey hover:text-white transition-colors"
          >
            Events
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard/tickets"
                className="text-iron-grey hover:text-white transition-colors"
              >
                My Tickets
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
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
            Events
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard/tickets"
                className="text-iron-grey"
                onClick={() => setOpen(false)}
              >
                My Tickets
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth/login" onClick={() => setOpen(false)}>
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
