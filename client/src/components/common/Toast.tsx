import { useToast } from "@/contexts/ToastContext";

/**
 * Toasts are ruled slips that stack in the bottom-left, away from the cart and
 * account controls in the top-right. Type is carried by a mono label and a rule
 * colour rather than four pastel backgrounds.
 */
const config = {
  success: { label: "Done", accent: "bg-ink-950" },
  error: { label: "Error", accent: "bg-vermilion-600" },
  warning: { label: "Notice", accent: "bg-clay-dark" },
  info: { label: "Info", accent: "bg-ink-400" },
} as const;

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      // Assertive would interrupt a screen reader mid-sentence for a
      // confirmation that is never urgent.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 left-5 z-[9999] flex w-full max-w-[22rem] flex-col-reverse gap-2"
    >
      {toasts.map((toast) => {
        const { label, accent } = config[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex animate-sheet-in items-stretch border border-ink-950/12 bg-paper-50 shadow-strong"
          >
            <span aria-hidden className={`w-1 shrink-0 ${accent}`} />

            <div className="flex flex-1 items-start gap-3 px-4 py-3">
              <div className="flex-1">
                <p className="meta-strong">{label}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-700">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
                className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center text-ink-400 transition-colors hover:text-ink-950"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
