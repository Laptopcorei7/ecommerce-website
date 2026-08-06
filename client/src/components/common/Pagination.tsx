interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Build the page list with ellipses: always the first and last page, plus a
 * window around the current one. Returns numbers and `"…"` gaps.
 */
function pageList(page: number, totalPages: number): (number | "…")[] {
  const WINDOW = 1;
  const pages = new Set<number>([1, totalPages]);

  for (let p = page - WINDOW; p <= page + WINDOW; p += 1) {
    if (p > 1 && p < totalPages) pages.add(p);
  }

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) out.push("…");
    out.push(p);
    previous = p;
  }
  return out;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = pageList(page, totalPages);
  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-6 border-t border-ink-950/12 pt-6"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={atStart}
        className="font-mono text-meta uppercase text-ink-600 transition-colors hover:text-ink-950 disabled:pointer-events-none disabled:text-ink-400"
      >
        ← Previous
      </button>

      <ol className="flex items-center gap-1">
        {items.map((item, i) =>
          item === "…" ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className="px-1 font-mono text-meta text-ink-600"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={`grid h-8 min-w-8 place-items-center px-2 font-mono text-meta tabular transition-colors ${
                  item === page
                    ? "bg-ink-950 text-paper-50"
                    : "text-ink-600 hover:bg-ink-950/5 hover:text-ink-950"
                }`}
              >
                {String(item).padStart(2, "0")}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={atEnd}
        className="font-mono text-meta uppercase text-ink-600 transition-colors hover:text-ink-950 disabled:pointer-events-none disabled:text-ink-400"
      >
        Next →
      </button>
    </nav>
  );
}
