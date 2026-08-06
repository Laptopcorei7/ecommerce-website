interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullPage?: boolean;
  message?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
  xl: "h-12 w-12",
};

export default function Loading({
  size = "md",
  fullPage = false,
  message,
}: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-4" role="status">
      <span
        aria-hidden
        className={`${sizeMap[size]} animate-spin rounded-full border border-ink-950/15 border-t-ink-950`}
      />
      <p className="meta">{message ?? "Loading"}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-paper-100/85 backdrop-blur-[2px]">
        {spinner}
      </div>
    );
  }

  return <div className="grid place-items-center py-24">{spinner}</div>;
}

/**
 * Skeletons use a background step rather than a shimmer sweep — on a paper
 * ground a moving highlight reads as a rendering bug.
 */
export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-paper-300 ${className}`} />;
}

/** Matches the real ProductCard cell so the grid doesn't reflow on load. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-paper-100">
      <LoadingSkeleton className="aspect-[4/5] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <LoadingSkeleton className="h-2.5 w-1/4" />
        <LoadingSkeleton className="h-4 w-4/5" />
        <LoadingSkeleton className="h-3 w-1/3" />
        <div className="mt-auto pt-4">
          <LoadingSkeleton className="h-3.5 w-1/4" />
        </div>
      </div>
    </div>
  );
}
