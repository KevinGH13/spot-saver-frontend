"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SpotCategory, CreateSpotInput } from "@/types/spot";

const CATEGORIES: { label: string; value: SpotCategory }[] = [
  { label: "Restaurante", value: "restaurant" },
  { label: "Café", value: "coffee" },
  { label: "Hotel", value: "hotel" },
  { label: "Otro", value: "other" },
];

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

const EMPTY_FORM = {
  name: "",
  category: "restaurant" as SpotCategory,
  address: "",
  url: "",
  tags: "",
};

export default function CreateSpotModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    const payload: CreateSpotInput = {
      name: form.name.trim(),
      category: form.category,
      address: form.address.trim() || undefined,
      url: form.url.trim() || undefined,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      // Coordinates will be resolved from address once the map is integrated
      lat: 0,
      lng: 0,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear el spot.");
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white md:inset-0 md:m-auto md:max-w-lg md:max-h-fit"
        style={{
          borderRadius: "20px 20px 0 0",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: "var(--palette-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--palette-text-primary)", letterSpacing: "-0.18px" }}
          >
            Nuevo spot
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ backgroundColor: "var(--palette-surface-secondary)" }}
          >
            <X size={16} style={{ color: "var(--palette-text-primary)" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">

          {/* Name */}
          <Field label="Nombre" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Café El Punto"
              className="w-full px-4 py-3 text-sm outline-none transition-shadow"
              style={inputStyle}
            />
          </Field>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--palette-text-primary)" }}
            >
              Categoría <span style={{ color: "var(--palette-bg-primary-core)" }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("category", value)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border transition-colors"
                  style={
                    form.category === value
                      ? {
                          backgroundColor: "var(--palette-text-primary)",
                          color: "#ffffff",
                          borderColor: "var(--palette-text-primary)",
                        }
                      : {
                          backgroundColor: "#ffffff",
                          color: "var(--palette-text-primary)",
                          borderColor: "var(--palette-border)",
                        }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <Field label="Dirección">
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Ej. Calle Mayor 12, Madrid"
              className="w-full px-4 py-3 text-sm outline-none transition-shadow"
              style={inputStyle}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--palette-text-secondary)" }}>
              Las coordenadas se calcularán a partir de aquí cuando se integre el mapa.
            </p>
          </Field>

          {/* URL */}
          <Field label="Enlace (URL)">
            <input
              type="url"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 text-sm outline-none transition-shadow"
              style={inputStyle}
            />
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="terraza, vistas, tranquilo"
              className="w-full px-4 py-3 text-sm outline-none transition-shadow"
              style={inputStyle}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--palette-text-secondary)" }}>
              Separados por comas.
            </p>
          </Field>

          {/* Error */}
          {error && (
            <p className="text-sm font-medium" style={{ color: "#c13515" }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--palette-text-primary)" }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "var(--palette-bg-primary-core)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--palette-text-primary)";
            }}
          >
            {loading ? "Guardando…" : "Guardar spot"}
          </button>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--palette-text-primary)" }}>
        {label}{" "}
        {required && (
          <span style={{ color: "var(--palette-bg-primary-core)" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--palette-border)",
  borderRadius: "8px",
  color: "var(--palette-text-primary)",
  backgroundColor: "#ffffff",
};
