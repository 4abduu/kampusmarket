import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarPickerProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "lg";
  readOnly?: boolean;
}

export default function RatingStarPicker({
  value,
  onChange,
  size = "lg",
  readOnly = false,
}: RatingStarPickerProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const ratingLabels: Record<number, string> = {
    0: "Klik untuk memberi rating",
    1: "Sangat Kurang",
    2: "Kurang",
    3: "Cukup Baik",
    4: "Baik",
    5: "Sangat Baik",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            className={`focus:outline-none transition-transform ${
              !readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
            disabled={readOnly}
          >
            <Star
              className={`${size === "lg" ? "h-8 w-8" : "h-6 w-6"} transition-colors ${
                star <= (hoverValue || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
              }`}
            />
          </button>
        ))}
      </div>
      {!readOnly && (
        <p className="text-sm text-muted-foreground min-h-[20px]">{ratingLabels[hoverValue || value]}</p>
      )}
    </div>
  );
}
