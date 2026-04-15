"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";

const MiniMapPreview = dynamic(
  () => import("@/components/ui/mini-map-preview"),
  { ssr: false }
);
import { Spot } from "@/types/spot";
import { CATEGORY_META } from "@/lib/category-meta";
import { DUMMY_SPOTS } from "@/lib/dummy-spots";

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/spots/${id}`);
        if (!res.ok) throw new Error();
        setSpot(await res.json());
      } catch {
        const dummy = DUMMY_SPOTS.find((s) => s.id === id) ?? null;
        setSpot(dummy);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <DetailSkeleton onBack={() => router.back()} />;
  if (!spot) return <NotFound onBack={() => router.back()} />;

  const meta = CATEGORY_META[spot.category];
  const { Icon } = meta;

  const formattedDate = new Date(spot.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ backgroundColor: meta.bg, height: "220px" }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-4 flex items-center justify-center w-9 h-9 rounded-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.9)",
            boxShadow: "var(--shadow-hover)",
          }}
        >
          <ArrowLeft size={18} style={{ color: "var(--palette-text-primary)" }} />
        </button>

        <Icon size={64} strokeWidth={1.4} style={{ color: meta.color }} />
      </div>

      {/* Content */}
      <div className="px-5 py-6 flex flex-col gap-6 max-w-lg mx-auto">
        {/* Name + category */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-2xl font-bold leading-tight"
            style={{ color: "var(--palette-text-primary)", letterSpacing: "-0.44px" }}
          >
            {spot.name}
          </h1>
          <span
            className="text-xs font-semibold w-fit px-3 py-1 rounded-full"
            style={{ backgroundColor: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>

        <Divider />

        {/* Details */}
        <div className="flex flex-col gap-4">
          {spot.address && (
            <Row icon={<MapPin size={16} />} label="Dirección">
              <p className="text-sm" style={{ color: "var(--palette-text-primary)" }}>
                {spot.address}
              </p>
            </Row>
          )}

          {spot.url && (
            <Row icon={<ExternalLink size={16} />} label="Enlace">
              <a
                href={spot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline underline-offset-2 break-all"
                style={{ color: "#428bff" }}
              >
                {spot.url}
              </a>
            </Row>
          )}

          {spot.tags.length > 0 && (
            <Row icon={null} label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {spot.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: "var(--palette-surface-secondary)",
                      color: "var(--palette-text-secondary)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Row>
          )}

          <Row icon={<Calendar size={16} />} label="Guardado el">
            <p className="text-sm" style={{ color: "var(--palette-text-secondary)" }}>
              {formattedDate}
            </p>
          </Row>
        </div>

        <Divider />

        {/* Map */}
        {spot.lat !== 0 || spot.lng !== 0 ? (
          <div className="flex flex-col gap-2">
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--palette-text-primary)" }}
            >
              Ubicación
            </p>
            <div className="rounded-[20px] overflow-hidden" style={{ height: "200px" }}>
              <MiniMapPreview lat={spot.lat} lng={spot.lng} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Subcomponents ── */

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && (
          <span style={{ color: "var(--palette-text-secondary)" }}>{icon}</span>
        )}
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--palette-text-secondary)" }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <hr style={{ borderColor: "rgba(0,0,0,0.08)" }} />
  );
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative w-full animate-pulse"
        style={{ backgroundColor: "var(--palette-surface-secondary)", height: "220px" }}
      >
        <button
          onClick={onBack}
          className="absolute top-5 left-4 flex items-center justify-center w-9 h-9 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
        >
          <ArrowLeft size={18} style={{ color: "var(--palette-text-primary)" }} />
        </button>
      </div>
      <div className="px-5 py-6 flex flex-col gap-4 max-w-lg mx-auto">
        {[120, 60, 200, 160].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded-full animate-pulse"
            style={{
              width: `${w}px`,
              backgroundColor: "var(--palette-surface-secondary)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p
        className="text-base font-semibold"
        style={{ color: "var(--palette-text-primary)" }}
      >
        Spot no encontrado
      </p>
      <button
        onClick={onBack}
        className="text-sm"
        style={{ color: "#428bff" }}
      >
        Volver
      </button>
    </div>
  );
}
