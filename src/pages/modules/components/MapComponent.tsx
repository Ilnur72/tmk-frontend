import React, { useEffect, useRef } from "react";

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    </div>
  );
};

export default MapComponent;
