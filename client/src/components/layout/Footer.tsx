import { Link } from "react-router-dom";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Everything", to: "/" },
      { label: "Home", to: "/?category=Home" },
      { label: "Clothing", to: "/?category=Clothing" },
      { label: "Electronics", to: "/?category=Electronics" },
      { label: "Books", to: "/?category=Books" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/register" },
      { label: "Orders", to: "/orders" },
      { label: "Saved", to: "/wishlist" },
      { label: "Bag", to: "/cart" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-950/12 bg-paper-200">
      <div className="shell py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Statement */}
          <div className="md:col-span-5">
            <p
              className="font-serif text-[28px] font-semibold leading-none tracking-tight text-ink-950"
              style={{
                fontVariationSettings: '"opsz" 40, "SOFT" 24, "WONK" 1',
              }}
            >
              Sundry
            </p>
            <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-ink-700">
              A general store for well-made everyday objects. We stock one of a
              thing rather than nine, and only after we have lived with it long
              enough to have an opinion.
            </p>

            <dl className="mt-8 grid max-w-sm grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="meta">Established</dt>
                <dd className="mt-1 font-mono text-sm tabular text-ink-950">
                  2019
                </dd>
              </div>
              <div>
                <dt className="meta">Items stocked</dt>
                <dd className="mt-1 font-mono text-sm tabular text-ink-950">
                  43
                </dd>
              </div>
            </dl>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-4 md:col-start-8">
            {COLUMNS.map(({ heading, links }) => (
              <nav key={heading} aria-label={heading}>
                <p className="meta">{heading}</p>
                <ul className="mt-4 space-y-2.5">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="text-[13px] text-ink-600 transition-colors hover:text-ink-950"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Colophon */}
        <div className="mt-16 flex flex-col gap-4 border-t border-ink-950/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="meta">© {new Date().getFullYear()} Sundry</p>
          <p className="meta">
            Set in Fraunces, Inter Tight &amp; IBM Plex Mono
          </p>
        </div>
      </div>
    </footer>
  );
}
