import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";

const NAV = [
  { to: "/", label: "Shop", end: true },
  { to: "/wishlist", label: "Saved", end: false },
  { to: "/orders", label: "Orders", end: false },
];

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Any navigation closes both menus. Without this the account dropdown
  // survives a route change and hangs over the new page.
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!userMenuOpen) return;

    function onPointerDown(e: PointerEvent) {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [userMenuOpen]);

  // The mobile sheet covers the page; the page behind it must not scroll.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    setUserMenuOpen(false);
    success("Signed out.");
    navigate("/");
  }

  return (
    <>
      {/* ── Announcement ──────────────────────────────────────────────────── */}
      <div className="bg-ink-950 text-paper-100">
        <div className="shell flex h-9 items-center justify-center gap-6 text-center">
          <p className="font-mono text-meta-xs uppercase">
            Complimentary shipping over $75
          </p>
          <span
            aria-hidden
            className="hidden h-3 w-px bg-paper-100/25 sm:block"
          />
          <p className="hidden font-mono text-meta-xs uppercase sm:block">
            30-day returns
          </p>
        </div>
      </div>

      {/* ── Masthead ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-ink-950/12 bg-paper-100/92 backdrop-blur-md">
        <div className="shell flex h-16 items-center justify-between gap-6">
          {/* Wordmark */}
          <Link to="/" className="group flex shrink-0 items-baseline gap-2">
            <span
              className="font-serif text-[26px] font-semibold leading-none tracking-tight text-ink-950"
              style={{
                fontVariationSettings: '"opsz" 36, "SOFT" 24, "WONK" 1',
              }}
            >
              Sundry
            </span>
            <span
              aria-hidden
              className="hidden h-1.5 w-1.5 rounded-full bg-vermilion-600 transition-transform duration-300 ease-out group-hover:scale-150 sm:block"
            />
          </Link>

          {/* Primary nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {({ isActive }) => (
                  <span
                    className={`relative py-1 font-mono text-meta uppercase transition-colors duration-200 ${
                      isActive
                        ? "text-ink-950"
                        : "text-ink-500 hover:text-ink-950"
                    }`}
                  >
                    {label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 h-px w-full bg-ink-950 transition-transform duration-300 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `font-mono text-meta uppercase transition-colors duration-200 ${
                    isActive
                      ? "text-vermilion-600"
                      : "text-vermilion-600/70 hover:text-vermilion-600"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-5">
            <Link
              to="/cart"
              className="group flex items-baseline gap-1.5 font-mono text-meta uppercase text-ink-600 transition-colors hover:text-ink-950"
            >
              Bag
              <span
                className={`tabular ${itemCount > 0 ? "text-vermilion-600" : "text-ink-300"}`}
              >
                ({itemCount > 99 ? "99+" : itemCount})
              </span>
            </Link>

            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 font-mono text-meta uppercase text-ink-600 transition-colors hover:text-ink-950"
                >
                  <span className="grid h-6 w-6 place-items-center border border-ink-950/24 text-[10px] text-ink-950">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[7rem] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-60 animate-rise border border-ink-950/12 bg-paper-50 shadow-strong"
                  >
                    <div className="border-b border-ink-950/12 px-4 py-3">
                      <p className="meta">Signed in as</p>
                      <p className="mt-1 truncate text-[13px] text-ink-950">
                        {user?.email}
                      </p>
                    </div>

                    {[
                      { to: "/profile", label: "Profile" },
                      { to: "/orders", label: "Orders" },
                      { to: "/wishlist", label: "Saved" },
                    ].map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        className="block px-4 py-2.5 text-[13px] text-ink-700 transition-colors hover:bg-ink-950/5 hover:text-ink-950"
                      >
                        {label}
                      </Link>
                    ))}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className="block px-4 py-2.5 text-[13px] text-vermilion-600 transition-colors hover:bg-vermilion-600/8"
                      >
                        Admin panel
                      </Link>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full border-t border-ink-950/12 px-4 py-2.5 text-left font-mono text-meta uppercase text-ink-500 transition-colors hover:bg-ink-950/5 hover:text-ink-950"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-4 md:flex">
                <Link
                  to="/login"
                  className="font-mono text-meta uppercase text-ink-600 transition-colors hover:text-ink-950"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Create account
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="-mr-1 grid h-9 w-9 place-items-center text-ink-700 md:hidden"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  d={
                    menuOpen
                      ? "M6 18 18 6M6 6l12 12"
                      : "M3.75 7.5h16.5M3.75 16.5h16.5"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile sheet ──────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 top-[100px] z-30 animate-fade bg-paper-100 md:hidden">
          <nav className="shell flex flex-col divide-y divide-ink-950/12 border-b border-ink-950/12">
            {[
              ...NAV,
              { to: "/cart", label: `Bag (${itemCount})`, end: false },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `display-sm py-5 text-2xl transition-colors ${
                    isActive ? "text-ink-950" : "text-ink-500"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="shell mt-8 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="btn-outline w-full">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn-outline w-full">
                    Admin panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-ghost w-full"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary w-full">
                  Create account
                </Link>
                <Link to="/login" className="btn-outline w-full">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
