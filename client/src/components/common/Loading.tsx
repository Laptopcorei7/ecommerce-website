interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullPage?: boolean;
  message?: string;
}

const sizeMap = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
  xl: "h-16 w-16 border-4",
};

export default function Loading({
  size = "md",
  fullPage = false,
  message,
}: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-brand-200 border-t-brand-600 animate-spin`}
      />
      {message && <p className="text-sm text-ink-400 font-medium">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">{spinner}</div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-ink-200 rounded-2xl ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="aspect-[3/4] w-full rounded-2xl" />
      <div className="space-y-2 px-0.5">
        <LoadingSkeleton className="h-3 w-1/3" />
        <LoadingSkeleton className="h-4 w-4/5" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
