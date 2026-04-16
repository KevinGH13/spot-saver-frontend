"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPin, ExternalLink, Calendar, Pencil, Trash2 } from "lucide-react";

const MiniMapPreview = dynamic(
  () => import("@/components/ui/mini-map-preview"),
  { ssr: false }
);
import SpotModal from "@/components/ui/create-spot-modal";
import { Spot } from "@/types/spot";
import { CATEGORY_META } from "@/lib/category-meta";
import { DUMMY_SPOTS } from "@/lib/dummy-spots";

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/spots/${id}`, { method: "DELETE" });
      router.push("/");
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

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
    <div className="min-h-screen bg-[var(--palette-surface-white)]">
      {/* Hero */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ backgroundColor: meta.bg, height: "220px" }}
      >
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-4 flex items-center justify-center w-9 h-9 rounded-full"
          style={{
            backgroundColor: "var(--palette-surface-overlay)",
            boxShadow: "var(--shadow-hover)",
          }}
        >
          <ArrowLeft size={18} style={{ color: "var(--palette-text-primary)" }} />
        </button>

        {/* Actions */}
        <div className="absolute top-5 right-4 flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{
              backgroundColor: "var(--palette-surface-overlay)",
              boxShadow: "var(--shadow-hover)",
            }}
          >
            <Pencil size={16} style={{ color: "var(--palette-text-primary)" }} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{
              backgroundColor: "var(--palette-surface-overlay)",
              boxShadow: "var(--shadow-hover)",
            }}
          >
            <Trash2 size={16} style={{ color: "#c13515" }} />
          </button>
        </div>

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
        {(spot.lat !== 0 || spot.lng !== 0) && (
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
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setConfirmDelete(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 px-6 py-8 flex flex-col gap-4 md:inset-0 md:m-auto md:max-w-sm md:max-h-fit"
            style={{
              backgroundColor: "var(--palette-surface-white)",
              borderRadius: "20px 20px 0 0",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex flex-col gap-1">
              <p
                className="text-base font-semibold"
                style={{ color: "var(--palette-text-primary)" }}
              >
                ¿Eliminar este spot?
              </p>
              <p className="text-sm" style={{ color: "var(--palette-text-secondary)" }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-3 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: "#c13515" }}
              >
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-full py-3 text-sm font-semibold rounded-xl"
                style={{
                  backgroundColor: "var(--palette-surface-secondary)",
                  color: "var(--palette-text-primary)",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <SpotModal
          spot={spot}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { load(); setShowEditModal(false); }}
        />
      )}
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
  return <hr style={{ borderColor: "var(--palette-border-subtle)" }} />;
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--palette-surface-white)]">
      <div
        className="relative w-full animate-pulse"
        style={{ backgroundColor: "var(--palette-surface-secondary)", height: "220px" }}
      >
        <button
          onClick={onBack}
          className="absolute top-5 left-4 flex items-center justify-center w-9 h-9 rounded-full"
          style={{ backgroundColor: "var(--palette-surface-overlay)" }}
        >
          <ArrowLeft size={18} style={{ color: "var(--palette-text-primary)" }} />
        </button>
      </div>
      <div className="px-5 py-6 flex flex-col gap-4 max-w-lg mx-auto">
        {[120, 60, 200, 160].map((w, i) => (
          <div
            key={i}
            className="h-4 rounded-full animate-pulse"
            style={{ width: `${w}px`, backgroundColor: "var(--palette-surface-secondary)" }}
          />
        ))}
      </div>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[var(--palette-surface-white)] flex flex-col items-center justify-center gap-4">
      <p className="text-base font-semibold" style={{ color: "var(--palette-text-primary)" }}>
        Spot no encontrado
      </p>
      <button onClick={onBack} className="text-sm" style={{ color: "#428bff" }}>
        Volver
      </button>
    </div>
  );
}
