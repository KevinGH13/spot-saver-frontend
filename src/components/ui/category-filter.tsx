import { SpotCategory } from "@/types/spot";

const CATEGORIES: { label: string; value: SpotCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Restaurants", value: "restaurant" },
  { label: "Cafes", value: "cafe" },
  { label: "Hotels", value: "hotel" },
  { label: "Bars", value: "bar" },
  { label: "Other", value: "other" },
];

type Props = {
  active: SpotCategory | "all";
  onChange: (category: SpotCategory | "all") => void;
};

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <nav className="flex flex-row gap-4 overflow-x-auto">
      {CATEGORIES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`text-sm font-semibold whitespace-nowrap pb-1 border-b-2 transition-colors ${
            active === value
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-black"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}