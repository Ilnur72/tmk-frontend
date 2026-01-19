import React, { useEffect, useRef, useState } from "react";

interface MapComponentProps {
  containerId: string;
  type: "create" | "edit";
  longitude?: number;
  latitude?: number;
  onCoordinatesChange?: ({ lat, lng }: { lat: number; lng: number }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  containerId,
  type,
  longitude = 69.2401,
  latitude = 41.2995,
  onCoordinatesChange,
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Check if maplibregl is available
    if (typeof window !== "undefined" && (window as any).maplibregl) {
      initializeMap();
    } else {
      // Load MapLibre GL JS if not available
      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
      script.onload = initializeMap;
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.href = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Update map center and marker when props change (useful for edit modal)
  useEffect(() => {
    if (mapRef.current) {
      try {
        mapRef.current.setCenter([longitude, latitude]);
        if (
          markerRef.current &&
          typeof markerRef.current.setLngLat === "function"
        ) {
          markerRef.current.setLngLat([longitude, latitude]);
        }
      } catch (err) {
        // ignore if map not yet initialized
      }
    }
  }, [latitude, longitude]);

  const initializeMap = () => {
    const maplibregl = (window as any).maplibregl;

    const map = new maplibregl.Map({
      container: containerId,
      style:
        "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6",
      center: [longitude, latitude],
      attributionControl: false,
      zoom: 10,
    });

    let marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    // Update initial coordinates
    updateCoordinates(latitude, longitude);

    marker.on("drag", function () {
      const lngLat = marker.getLngLat();
      updateCoordinates(lngLat.lat, lngLat.lng);
    });

    marker.on("dragend", function () {
      const lngLat = marker.getLngLat();
      updateCoordinates(lngLat.lat, lngLat.lng);
    });

    map.on("click", function (e: any) {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      marker.remove();
      marker = new maplibregl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;
      updateCoordinates(lat, lng);

      marker.on("drag", function () {
        const lngLat = marker.getLngLat();
        updateCoordinates(lngLat.lat, lngLat.lng);
      });

      marker.on("dragend", function () {
        const lngLat = marker.getLngLat();
        updateCoordinates(lngLat.lat, lngLat.lng);
      });
    });
  };

  // const handleLocationSearch = () => {
  //   if (mapRef.current && markerRef.current) {
  //     mapRef.current.setCenter([longitude, latitude]);
  //     markerRef.current.setLngLat([longitude, latitude]);
  //   }
  // };

  const updateCoordinates = (lat: number, lng: number) => {
    if (onCoordinatesChange) {
      onCoordinatesChange({ lat, lng });
    }
  };

  return (
    <div>
      <div
        id={containerId}
        style={{ width: "100%", height: "400px" }}
        className="rounded-lg"
      />
      {/* <div className="pt-3 flex gap-2">
        <input
          type="number"
          step="any"
          placeholder="Кенглик"
          value={latitude.toFixed(6)}
          onChange={(e) =>
            onCoordinatesChange?.({
              lat: parseFloat(e.target.value) || 0,
              lng: longitude,
            })
          }
          className="flex-1 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <input
          type="number"
          step="any"
          placeholder="Узунлик"
          value={longitude.toFixed(6)}
          onChange={(e) =>
            onCoordinatesChange?.({
              lat: latitude,
              lng: parseFloat(e.target.value) || 0,
            })
          }
          className="flex-1 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <button
          type="button"
          onClick={handleLocationSearch}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Кидириш
        </button>
      </div> */}
    </div>
  );
};

export default MapComponent;
