"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";
import { CATEGORY_META } from "@/lib/category-meta";

type Props = { spots: Spot[] };

export default function SpotMap({ spots }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const mappable = spots.filter((s) => s.lat !== 0 || s.lng !== 0);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const defaultCenter: [number, number] =
      mappable.length > 0
        ? [mappable[0].lat, mappable[0].lng]
        : [40.4168, -3.7038]; // Madrid fallback

    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    }).addTo(map);

    mappable.forEach((spot) => {
      const meta = CATEGORY_META[spot.category];
      const icon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:${meta.color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: "",
      });

      const popup = `
        <div style="font-family:system-ui;min-width:130px;padding:2px 0">
          <div style="font-weight:600;font-size:14px;color:#222;margin-bottom:2px">${spot.name}</div>
          <div style="font-size:12px;color:#6a6a6a">${meta.label}</div>
          ${spot.address ? `<div style="font-size:12px;color:#6a6a6a;margin-top:2px">${spot.address}</div>` : ""}
        </div>
      `;

      L.marker([spot.lat, spot.lng], { icon }).bindPopup(popup).addTo(map);
    });

    if (mappable.length > 1) {
      const bounds = L.latLngBounds(mappable.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [48, 48] });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [spots]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {mappable.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <p
            className="text-sm font-semibold bg-white/90 px-4 py-2 rounded-full"
            style={{ color: "var(--palette-text-secondary)" }}
          >
            Ningún spot tiene ubicación todavía
          </p>
        </div>
      )}
    </div>
  );
}
