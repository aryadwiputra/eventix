import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-primary/50 border-t border-primary">
      <div className="max-w-screen-xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-3">
            Ticke<span className="text-secondary">ty</span>
          </h3>
          <p className="text-pastel-purple text-sm">
            Your go-to platform for discovering and booking amazing events.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Events</h4>
          <div className="flex flex-col gap-2 text-iron-grey text-sm">
            <Link to="/events" className="hover:text-white">
              Browse Events
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Account</h4>
          <div className="flex flex-col gap-2 text-iron-grey text-sm">
            <Link to="/auth/login" className="hover:text-white">
              Sign In
            </Link>
            <Link to="/auth/register" className="hover:text-white">
              Register
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <div className="flex flex-col gap-2 text-iron-grey text-sm">
            <span className="text-pastel-purple">Privacy Policy</span>
            <span className="text-pastel-purple">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary text-center py-4 text-sm text-pastel-purple">
        &copy; {new Date().getFullYear()} Tickety. All rights reserved.
      </div>
    </footer>
  );
}
