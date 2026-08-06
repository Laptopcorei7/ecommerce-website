import { Link } from "react-router-dom";
import { EDITORIAL, editorialUrl } from "@/lib/editorial";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  intro: string;
  /** Which editorial photograph fills the left panel. */
  photo?: keyof typeof EDITORIAL;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Shared frame for sign in, registration and admin sign in: a full-height
 * photograph on the left and the form on the right. Keeping it in one place
 * stops the three pages drifting apart.
 */
export default function AuthShell({
  eyebrow,
  title,
  intro,
  photo = "workshop",
  children,
  footer,
}: AuthShellProps) {
  return (
    // These routes render outside <Layout>, so the shell owns the full
    // viewport rather than sitting below a header.
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Photograph — hidden on small screens, where it would push the form
          below the fold for no benefit. */}
      <div className="relative hidden border-r border-ink-950/12 lg:block">
        <div className="well sticky top-0 h-screen">
          <img src={editorialUrl(EDITORIAL[photo], 1400)} alt="" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 to-transparent p-10">
            <p
              className="font-serif text-3xl font-semibold leading-tight text-paper-50"
              style={{
                fontVariationSettings: '"opsz" 48, "SOFT" 24, "WONK" 1',
              }}
            >
              Fewer things,
              <br />
              chosen slowly.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="meta-accent">{eyebrow}</p>
          <h1 className="display-sm mt-4 text-ink-950">{title}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-600">
            {intro}
          </p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t border-ink-950/12 pt-6 text-[13px] text-ink-600">
            {footer}
          </div>

          <Link
            to="/"
            className="mt-8 inline-block font-mono text-meta uppercase text-ink-400 underline-offset-4 transition-colors hover:text-ink-950 hover:underline"
          >
            ← Back to the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
