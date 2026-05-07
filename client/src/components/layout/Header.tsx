import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    success("You have been signed out.");
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-soft border-b border-ink-100"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-ink-950 flex items-center justify-center group-hover:bg-brand-600 transition-colors duration-200">
              <span className="text-white font-serif text-sm font-bold">L</span>
            </div>
            <span className="font-serif text-xl font-semibold text-ink-950 tracking-tight">
              Luxe
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/", label: "Shop" },
              { to: "/wishlist", label: "Wishlist" },
              { to: "/orders", label: "Orders" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-ink-100 text-ink-950"
                      : "text-ink-600 hover:text-ink-950 hover:bg-ink-50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-100 text-brand-700"
                      : "text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-ink-600 hover:text-ink-950 hover:bg-ink-100 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1 animate-in">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-ink-100 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink-800 hidden sm:block max-w-[100px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-strong border border-ink-100 py-1.5 z-20 animate-in">
                      <div className="px-4 py-2.5 border-b border-ink-50">
                        <p className="text-xs text-ink-400 font-medium">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-ink-900 truncate">
                          {user?.email}
                        </p>
                      </div>
                      {[
                        { to: "/profile", label: "My Profile" },
                        { to: "/orders", label: "My Orders" },
                        { to: "/wishlist", label: "Wishlist" },
                      ].map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 hover:text-ink-950 transition-colors"
                        >
                          {label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-ink-50 mt-1.5 pt-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                            />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-950 rounded-full hover:bg-ink-50 transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary !py-2 !px-4 !text-xs"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden ml-1 p-2 rounded-full text-ink-600 hover:bg-ink-100 transition-colors"
            >
              {menuOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-ink-100 pt-3 animate-in">
            {[
              { to: "/", label: "Shop", end: true },
              { to: "/wishlist", label: "Wishlist", end: false },
              { to: "/orders", label: "Orders", end: false },
              {
                to: "/cart",
                label: `Cart${itemCount > 0 ? ` (${itemCount})` : ""}`,
                end: false,
              },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-ink-100 text-ink-950"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-950"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
