import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
      style={{
        border: "1px solid var(--palette-border)",
        backgroundColor: "var(--palette-surface-white)",
      }}
    >
      <Search
        size={16}
        strokeWidth={2}
        style={{ color: "var(--palette-text-secondary)", flexShrink: 0 }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar spots…"
        className="flex-1 text-sm bg-transparent outline-none"
        style={{ color: "var(--palette-text-primary)" }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "var(--palette-surface-secondary)" }}
        >
          <X size={11} style={{ color: "var(--palette-text-primary)" }} />
        </button>
      )}
    </div>
  );
}
