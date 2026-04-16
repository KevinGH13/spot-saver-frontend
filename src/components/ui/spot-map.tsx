"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
import "@/lib/maps";
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
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const mappable = spots.filter((s) => s.lat !== 0 || s.lng !== 0);

  // Geolocalización del usuario
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Inicializar el mapa una sola vez
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
      if (cancelled || !containerRef.current) return;

      const map = new Map(containerRef.current, {
        center: { lat: 40.4168, lng: -3.7038 },
        zoom: 13,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapRef.current = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => { m.map = null; });
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar markers cuando cambian spots o ubicación
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    (async () => {
      const { AdvancedMarkerElement } =
        await importLibrary("marker") as google.maps.MarkerLibrary;

      const map = mapRef.current!;

      // Limpiar markers anteriores
      markersRef.current.forEach((m) => { m.map = null; });
      markersRef.current = [];
      activeInfoWindowRef.current?.close();
      activeInfoWindowRef.current = null;

      // Markers de spots
      mappable.forEach((spot) => {
        const meta = CATEGORY_META[spot.category];

        const pin = document.createElement("div");
        pin.style.cssText = `width:20px;height:20px;border-radius:50%;background:${meta.color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)`;

        const marker = new AdvancedMarkerElement({
          position: { lat: spot.lat, lng: spot.lng },
          map,
          title: spot.name,
          content: pin,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:system-ui;min-width:140px;padding:4px 2px">
              <div style="font-weight:600;font-size:14px;color:#222;margin-bottom:3px">
                ${escapeHtml(spot.name)}
              </div>
              <div style="font-size:12px;color:#6a6a6a;margin-bottom:2px">
                ${escapeHtml(meta.label)}
              </div>
              ${spot.address
                ? `<div style="font-size:12px;color:#6a6a6a">${escapeHtml(spot.address)}</div>`
                : ""}
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open({ anchor: marker, map });
          activeInfoWindowRef.current = infoWindow;
        });

        markersRef.current.push(marker);
      });

      // Marker de ubicación del usuario (punto azul personalizado)
      if (userLocation) {
        const dot = document.createElement("div");
        dot.style.cssText =
          "width:16px;height:16px;border-radius:50%;background:#4285f4;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)";

        const userMarker = new AdvancedMarkerElement({
          position: userLocation,
          map,
          title: "Tu ubicación",
          content: dot,
          zIndex: 1000,
        });
        markersRef.current.push(userMarker);
      }

      // Ajustar vista
      if (mappable.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        mappable.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
        map.fitBounds(bounds);
      } else if (mappable.length === 1) {
        map.setCenter({ lat: mappable[0].lat, lng: mappable[0].lng });
        map.setZoom(14);
      } else if (userLocation) {
        map.setCenter(userLocation);
        map.setZoom(14);
      }
    })();
  }, [spots, userLocation, mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

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
