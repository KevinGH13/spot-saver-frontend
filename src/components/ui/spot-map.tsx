"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Spot } from "@/types/spot";
import { CATEGORY_META } from "@/lib/category-meta";

type Props = { spots: Spot[] };

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function SpotMap({ spots }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const mappable = spots.filter((s) => s.lat !== 0 || s.lng !== 0);

  // Get user location once on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {} // silently ignore permission denied / unavailable
    );
  }, []);

  // Initialize / reinitialize map when spots change
  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const defaultCenter: [number, number] =
      mappable.length > 0
        ? [mappable[0].lat, mappable[0].lng]
        : userLocation ?? [40.4168, -3.7038]; // fallback Madrid

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
          <div style="font-weight:600;font-size:14px;color:#222;margin-bottom:2px">${escapeHtml(spot.name)}</div>
          <div style="font-size:12px;color:#6a6a6a">${escapeHtml(meta.label)}</div>
          ${spot.address ? `<div style="font-size:12px;color:#6a6a6a;margin-top:2px">${escapeHtml(spot.address)}</div>` : ""}
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

  // Add user location marker when available (separate from map init)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const map = mapRef.current;

    const userIcon = L.divIcon({
      html: `
        <div style="position:relative;width:20px;height:20px">
          <div style="width:20px;height:20px;border-radius:50%;background:#4285f4;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>
        </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: "",
    });

    const marker = L.marker(userLocation, { icon: userIcon })
      .bindPopup("Tu ubicación")
      .addTo(map);

    // Only center on user if there are no spots with coordinates
    if (mappable.length === 0) {
      map.setView(userLocation, 14);
    }

    return () => {
      marker.remove();
    };
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {mappable.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <p
            className="text-sm font-semibold px-4 py-2 rounded-full"
            style={{
              backgroundColor: "var(--palette-surface-overlay)",
              color: "var(--palette-text-secondary)",
            }}
          >
            Ningún spot tiene ubicación todavía
          </p>
        </div>
      )}
    </div>
  );
}
