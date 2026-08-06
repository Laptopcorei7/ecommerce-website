interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-5 h-5",
};

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

function Star({ filled, size }: { filled: boolean; size: string }) {
  return (
    <svg
      aria-hidden
      className={`${size} ${filled ? "text-ink-950" : "text-ink-950/15"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  const px = sizeMap[size];

  // Read-only ratings are output, not controls. Rendering them as buttons put
  // five unusable stops per rating into the keyboard tab order.
  if (!interactive) {
    return (
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${rating.toFixed(1)} out of ${maxRating} stars`}
      >
        {stars.map((star) => (
          <Star key={star} filled={star <= Math.round(rating)} size={px} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === Math.round(rating)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange?.(star)}
          className="rounded-sm p-0.5 transition-transform duration-150 ease-out hover:scale-110 active:scale-95"
        >
          <Star filled={star <= Math.round(rating)} size={px} />
        </button>
      ))}
    </div>
  );
}
