"use client";

import { useState } from "react";
import CreateButton from "@/components/ui/create-button";
import Header from "@/components/ui/header";
import CategoryFilter from "@/components/ui/category-filter";
import { SpotCategory } from "@/types/spot";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<SpotCategory | "all">("all");

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <div className="px-4 py-3 border-b border-gray-100">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>
        <main className="p-4">
          {/* Spot list / map will go here */}
        </main>
      </div>
      <CreateButton />
    </div>
  );
}
