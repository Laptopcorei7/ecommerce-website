import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      {/* The header is sticky rather than fixed, so main starts below it and
          full-bleed sections don't need a matching top padding to compensate. */}
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
