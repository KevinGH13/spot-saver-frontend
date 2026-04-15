"use client";

import { useState, useEffect, useCallback } from "react";
import CreateButton from "@/components/ui/create-button";
import CreateSpotModal from "@/components/ui/create-spot-modal";
import Header from "@/components/ui/header";
import CategoryFilter from "@/components/ui/category-filter";
import SearchBar from "@/components/ui/search-bar";
import SpotCard from "@/components/ui/spot-card";
import { Spot, SpotCategory } from "@/types/spot";
import { DUMMY_SPOTS } from "@/lib/dummy-spots";

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SpotCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spots");
      if (!res.ok) throw new Error();
      const data: Spot[] = await res.json();
      setSpots(data.length > 0 ? data : DUMMY_SPOTS);
    } catch {
      setSpots(DUMMY_SPOTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const filtered = spots.filter((spot) => {
    const matchesCategory =
      activeCategory === "all" || spot.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      spot.name.toLowerCase().includes(q) ||
      spot.tags.some((t) => t.toLowerCase().includes(q)) ||
      (spot.address?.toLowerCase().includes(q) ?? false);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-[72px]">
        {/* Category tabs */}
        <div
          className="px-6 pt-2 border-b"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Search */}
        <div
          className="px-6 py-3 border-b"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Grid */}
        <main className="px-4 py-5">
          {loading ? (
            <SpotSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState hasSearch={!!search || activeCategory !== "all"} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateButton onClick={() => setShowModal(true)} />

      {showModal && (
        <CreateSpotModal
          onClose={() => setShowModal(false)}
          onCreated={fetchSpots}
        />
      )}
    </div>
  );
}

function SpotSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[20px] overflow-hidden animate-pulse"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="w-full h-16"
            style={{ backgroundColor: "var(--palette-surface-secondary)" }}
          />
          <div className="p-3 flex flex-col gap-2">
            <div
              className="h-3 rounded-full w-3/4"
              style={{ backgroundColor: "var(--palette-surface-secondary)" }}
            />
            <div
              className="h-3 rounded-full w-1/2"
              style={{ backgroundColor: "var(--palette-surface-secondary)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p
        className="text-base font-semibold"
        style={{ color: "var(--palette-text-primary)" }}
      >
        {hasSearch ? "Sin resultados" : "Aún no hay spots"}
      </p>
      <p
        className="text-sm text-center max-w-xs"
        style={{ color: "var(--palette-text-secondary)" }}
      >
        {hasSearch
          ? "Prueba con otro término o categoría."
          : "Pulsa el botón + para añadir tu primer spot."}
      </p>
    </div>
  );
}
