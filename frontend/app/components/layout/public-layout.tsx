import { Outlet } from "react-router";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-dark-indigo text-white">
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
