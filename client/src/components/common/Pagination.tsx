interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btn = (
    label: React.ReactNode,
    target: number,
    isActive = false,
    disabled = false,
  ) => (
    <button
      key={`btn-${target}`}
      onClick={() => !disabled && onPageChange(target)}
      disabled={disabled}
      className={`
        min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors
        ${
          isActive
            ? "bg-primary-600 text-white shadow-sm"
            : disabled
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      {btn(
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>,
        page - 1,
        false,
        page === 1,
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-400">
            …
          </span>
        ) : (
          btn(p, p as number, p === page)
        ),
      )}
      {btn(
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>,
        page + 1,
        false,
        page === totalPages,
      )}
    </div>
  );
}
