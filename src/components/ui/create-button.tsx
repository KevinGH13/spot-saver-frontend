import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function CreateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full text-white transition-colors"
      style={{
        backgroundColor: "var(--palette-text-primary)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "var(--palette-bg-primary-core)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "var(--palette-text-primary)";
      }}
    >
      <Plus size={22} />
    </button>
  );
}
