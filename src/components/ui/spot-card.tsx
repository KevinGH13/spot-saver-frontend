import Link from "next/link";
import { Spot } from "@/types/spot";
import { CATEGORY_META } from "@/lib/category-meta";

type Props = {
  spot: Spot;
};

export default function SpotCard({ spot }: Props) {
  const meta = CATEGORY_META[spot.category];
  const { Icon } = meta;

  return (
    <Link href={`/spots/${spot.id}`} className="block">
      <article
        className="flex flex-col rounded-[20px] bg-white overflow-hidden transition-shadow"
        style={{ boxShadow: "var(--shadow-card)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "var(--shadow-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "var(--shadow-card)";
        }}
      >
        {/* Icon area */}
        <div
          className="flex items-center justify-center py-5"
          style={{ backgroundColor: meta.bg }}
        >
          <Icon size={28} strokeWidth={1.6} style={{ color: meta.color }} />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 p-3">
          <p
            className="text-sm font-semibold leading-tight line-clamp-2"
            style={{ color: "var(--palette-text-primary)", letterSpacing: "-0.18px" }}
          >
            {spot.name}
          </p>

          <span
            className="text-xs font-medium w-fit px-2 py-0.5 rounded-full"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>

          {spot.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {spot.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--palette-surface-secondary)",
                    color: "var(--palette-text-secondary)",
                  }}
                >
                  {tag}
                </span>
              ))}
              {spot.tags.length > 3 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--palette-surface-secondary)",
                    color: "var(--palette-text-secondary)",
                  }}
                >
                  +{spot.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
