"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Loader2, MapPin } from "lucide-react";
import { Spot, SpotCategory, CreateSpotInput } from "@/types/spot";

const MiniMapPreview = dynamic(() => import("./mini-map-preview"), {
  ssr: false,
});

const CATEGORIES: { label: string; value: SpotCategory }[] = [
  { label: "Restaurante", value: "restaurant" },
  { label: "Café", value: "coffee" },
  { label: "Hotel", value: "hotel" },
  { label: "Otro", value: "other" },
];

type Props = {
  spot?: Spot; // si se pasa, modo edición
  onClose: () => void;
  onSaved: () => void;
};

type Suggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

function parseSuggestion(display_name: string): { title: string; subtitle: string } {
  const parts = display_name.split(", ");
  return { title: parts[0], subtitle: parts.slice(1, 3).join(", ") };
}

async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SpotSaver/1.0 (kevoutgh@gmail.com)" },
  });
  if (!res.ok) return [];
  return res.json();
}

export default function SpotModal({ spot, onClose, onSaved }: Props) {
  const isEdit = !!spot;

  const [form, setForm] = useState({
    name: spot?.name ?? "",
    category: (spot?.category ?? "restaurant") as SpotCategory,
    address: spot?.address ?? "",
    url: spot?.url ?? "",
    tags: spot?.tags.join(", ") ?? "",
  });

  // Pre-llenar coords si el spot ya tiene ubicación geocodificada
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    spot && (spot.lat !== 0 || spot.lng !== 0)
      ? { lat: spot.lat, lng: spot.lng }
      : null
  );

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        addressWrapperRef.current &&
        !addressWrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAddressChange(value: string) {
    setForm((prev) => ({ ...prev, address: value }));
    setCoords(null);
    setSuggestions([]);
    setShowSuggestions(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await fetchSuggestions(value.trim());
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSearching(false);
    }, 400);
  }

  function selectSuggestion(s: Suggestion) {
    setForm((prev) => ({ ...prev, address: s.display_name }));
    setCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (form.address.trim() && !coords) {
      setError("Selecciona una dirección de las sugerencias.");
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
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
    };

    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/spots/${spot.id}` : "/api/spots",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al guardar el spot.");
      }

      onSaved();
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
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:inset-0 md:m-auto md:max-w-lg md:max-h-fit bg-[var(--palette-surface-white)]"
        style={{ borderRadius: "20px 20px 0 0", boxShadow: "var(--shadow-card)" }}
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
          style={{ borderColor: "var(--palette-border-subtle)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--palette-text-primary)", letterSpacing: "-0.18px" }}
          >
            {isEdit ? "Editar spot" : "Nuevo spot"}
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
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[80vh]"
        >
          {/* Name */}
          <Field label="Nombre" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej. Café El Punto"
              className="w-full px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </Field>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--palette-text-primary)" }}
            >
              Categoría{" "}
              <span style={{ color: "var(--palette-bg-primary-core)" }}>*</span>
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
                          backgroundColor: "var(--palette-action-bg)",
                          color: "var(--palette-action-color)",
                          borderColor: "var(--palette-action-bg)",
                        }
                      : {
                          backgroundColor: "var(--palette-surface-white)",
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

          {/* Address with suggestions */}
          <Field label="Dirección">
            <div className="relative" ref={addressWrapperRef}>
              <div className="relative">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder="Ej. Madrid, Calle Mayor 12..."
                  className="w-full px-4 py-3 text-sm outline-none pr-10"
                  style={inputStyle}
                  autoComplete="off"
                />
                {searching ? (
                  <Loader2
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
                    style={{ color: "var(--palette-text-secondary)" }}
                  />
                ) : form.address && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, address: "" }));
                      setCoords(null);
                      setSuggestions([]);
                      setShowSuggestions(false);
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full"
                    style={{ backgroundColor: "var(--palette-border)" }}
                  >
                    <X size={11} style={{ color: "#ffffff" }} />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <ul
                  className="absolute z-10 w-full mt-1 overflow-hidden"
                  style={{
                    backgroundColor: "var(--palette-surface-white)",
                    border: "1px solid var(--palette-border)",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  {suggestions.map((s) => {
                    const { title, subtitle } = parseSuggestion(s.display_name);
                    return (
                      <li key={s.place_id}>
                        <button
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--palette-surface-secondary)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                        >
                          <MapPin
                            size={14}
                            className="mt-0.5 shrink-0"
                            style={{ color: "var(--palette-text-secondary)" }}
                          />
                          <span className="flex flex-col min-w-0">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--palette-text-primary)" }}
                            >
                              {title}
                            </span>
                            {subtitle && (
                              <span
                                className="text-xs truncate"
                                style={{ color: "var(--palette-text-secondary)" }}
                              >
                                {subtitle}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Mini-map preview */}
            {coords && (
              <div className="mt-2">
                <MiniMapPreview lat={coords.lat} lng={coords.lng} />
              </div>
            )}
          </Field>

          {/* URL */}
          <Field label="Enlace (URL)">
            <input
              type="url"
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 text-sm outline-none"
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
              className="w-full px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--palette-text-secondary)" }}
            >
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
            disabled={loading || searching}
            className="w-full py-3 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--palette-action-bg)",
              color: "var(--palette-action-color)",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "var(--palette-bg-primary-core)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "var(--palette-action-bg)";
            }}
          >
            {loading
              ? isEdit ? "Guardando…" : "Guardando…"
              : isEdit ? "Guardar cambios" : "Guardar spot"}
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
      <label
        className="text-sm font-medium"
        style={{ color: "var(--palette-text-primary)" }}
      >
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
  backgroundColor: "var(--palette-surface-white)",
};
