import { LayoutGrid, Utensils, Coffee, BedDouble, Tag } from "lucide-react";
import { SpotCategory } from "@/types/spot";

const CATEGORIES: {
  label: string;
  value: SpotCategory | "all";
  Icon: React.ElementType;
}[] = [
  { label: "Todos", value: "all", Icon: LayoutGrid },
  { label: "Restaurantes", value: "restaurant", Icon: Utensils },
  { label: "Café", value: "coffee", Icon: Coffee },
  { label: "Hoteles", value: "hotel", Icon: BedDouble },
  { label: "Otros", value: "other", Icon: Tag },
];

type Props = {
  active: SpotCategory | "all";
  onChange: (category: SpotCategory | "all") => void;
};

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <nav className="flex flex-row gap-1 overflow-x-auto">
      {CATEGORIES.map(({ label, value, Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className="flex flex-col items-center gap-1.5 px-4 pb-2 pt-1 whitespace-nowrap border-b-2 transition-colors"
            style={
              isActive
                ? {
                    color: "var(--palette-text-primary)",
                    borderColor: "var(--palette-bg-primary-core)",
                  }
                : {
                    color: "var(--palette-text-secondary)",
                    borderColor: "transparent",
                  }
            }
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--palette-text-primary)";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--palette-text-secondary)";
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
