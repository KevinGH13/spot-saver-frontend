"use client";

import { useEffect, useRef } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
import "@/lib/maps";

type Props = { lat: number; lng: number };

export default function MiniMapPreview({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    if (mapRef.current) {
      const pos = { lat, lng };
      mapRef.current.setCenter(pos);
      markerRef.current?.position && (markerRef.current.position = pos);
      return;
    }

    (async () => {
      const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
        importLibrary("maps") as Promise<google.maps.MapsLibrary>,
        importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
      ]);
      if (cancelled || !containerRef.current) return;

      const pos = { lat, lng };

      const map = new Map(containerRef.current, {
        center: pos,
        zoom: 15,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        gestureHandling: "none",
        disableDoubleClickZoom: true,
      });

      markerRef.current = new AdvancedMarkerElement({ position: pos, map });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: "140px" }}
    />
  );
}
