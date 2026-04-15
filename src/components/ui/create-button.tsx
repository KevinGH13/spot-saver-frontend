import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateButton() {
  return (
    <Link
      href="/create"
      className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-colors"
    >
      <Plus />
    </Link>
  );
}