import { Utensils, Coffee, BedDouble, Tag } from "lucide-react";
import { SpotCategory } from "@/types/spot";

export const CATEGORY_META: Record<
  SpotCategory,
  { label: string; Icon: React.ElementType; bg: string; color: string }
> = {
  restaurant: {
    label: "Restaurante",
    Icon: Utensils,
    bg: "#fff1f3",
    color: "#e00b41",
  },
  coffee: {
    label: "Café",
    Icon: Coffee,
    bg: "#fff8f0",
    color: "#b45309",
  },
  hotel: {
    label: "Hotel",
    Icon: BedDouble,
    bg: "#eff6ff",
    color: "#1d4ed8",
  },
  other: {
    label: "Otro",
    Icon: Tag,
    bg: "#f5f5f5",
    color: "#6a6a6a",
  },
};
