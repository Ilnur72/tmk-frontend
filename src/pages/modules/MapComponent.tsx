import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapComponentProps {
  selectedLocation: { lat: number; lng: number } | null;
  setSelectedLocation: (loc: { lat: number; lng: number }) => void;
  setFormData: (cb: (prev: any) => any) => void;
}

const vectorStyle =
  "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6";

const satelliteStyle = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "esri-satellite",
      type: "raster",
      source: "esri",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

const MapComponent: React.FC<MapComponentProps> = ({
  selectedLocation,
  setSelectedLocation,
  setFormData,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    let marker: maplibregl.Marker | null = null;
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: vectorStyle,
        center: [69.2401, 41.2995],
        zoom: 10,
        attributionControl: false,
      });

      map.current.addControl(new maplibregl.NavigationControl());

      // Layer toggle control
      let isSatellite = false;
      const btn = document.createElement("button");
      btn.className = "maplibregl-ctrl-icon";
      btn.type = "button";
      btn.title = t("map.toggle_satellite");
      btn.innerHTML = "🛰️";
      btn.style.fontSize = "16px";
      btn.onclick = () => {
        map.current!.setStyle(
          isSatellite ? vectorStyle : (satelliteStyle as any)
        );
        isSatellite = !isSatellite;
      };
      const container = document.createElement("div");
      container.className = "maplibregl-ctrl maplibregl-ctrl-group";
      container.appendChild(btn);
      map.current.addControl(
        {
          onAdd: () => container,
          onRemove: () => {},
        },
        "bottom-right"
      );

      // Add marker logic (draggable)
      const addOrMoveMarker = (lat: number, lng: number) => {
        if (marker) marker.remove();
        const el = document.createElement("div");
        el.style.backgroundImage = "url('/image/marker.png')";
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.backgroundSize = "100%";
        el.style.cursor = "pointer";
        marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([lng, lat])
          .addTo(map.current!);
        marker.on("dragend", () => {
          const lngLat = marker!.getLngLat();
          setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
          setFormData((prev: any) => ({
            ...prev,
            location: `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`,
            coordinates: { lat: lngLat.lat, lng: lngLat.lng },
          }));
        });
      };

      // Click event to set marker
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setSelectedLocation({ lat, lng });
        addOrMoveMarker(lat, lng);
        setFormData((prev: any) => ({
          ...prev,
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: { lat, lng },
        }));
      });

      // Initial marker if selectedLocation exists
      if (selectedLocation) {
        addOrMoveMarker(selectedLocation.lat, selectedLocation.lng);
        map.current.setCenter([selectedLocation.lng, selectedLocation.lat]);
      }
    }
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  const { t } = useTranslation();

  // Manual coordinate input sync
  useEffect(() => {
    if (map.current && selectedLocation) {
      map.current.setCenter([selectedLocation.lng, selectedLocation.lat]);
      // Remove all existing markers
      const existingMarkers = document.querySelectorAll(".maplibregl-marker");
      existingMarkers.forEach((marker) => marker.remove());
      // Add draggable marker at new location
      const el = document.createElement("div");
      el.style.backgroundImage = "url('/image/marker.png')";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.backgroundSize = "100%";
      el.style.cursor = "pointer";
      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current!);
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setSelectedLocation({ lat: lngLat.lat, lng: lngLat.lng });
        setFormData((prev: any) => ({
          ...prev,
          location: `${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`,
          coordinates: { lat: lngLat.lat, lng: lngLat.lng },
        }));
      });
    }
  }, [selectedLocation, setSelectedLocation, setFormData]);

  return (
    <div>
      {/* Manual coordinates input */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label>{t("map.latitude")}</label>
          <input
            type="number"
            step="0.000001"
            placeholder={t("map.latitude_placeholder")}
            value={selectedLocation ? selectedLocation.lat : ""}
            onChange={(e) => {
              const lat = parseFloat(e.target.value);
              if (!isNaN(lat)) {
                setSelectedLocation({
                  lat,
                  lng: selectedLocation ? selectedLocation.lng : 0,
                });
                setFormData((prev: any) => ({
                  ...prev,
                  coordinates: { lat, lng: prev.coordinates?.lng || 0 },
                }));
              }
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>{t("map.longitude")}</label>
          <input
            type="number"
            step="0.000001"
            placeholder={t("map.longitude_placeholder")}
            value={selectedLocation ? selectedLocation.lng : ""}
            onChange={(e) => {
              const lng = parseFloat(e.target.value);
              if (!isNaN(lng)) {
                setSelectedLocation({
                  lat: selectedLocation ? selectedLocation.lat : 0,
                  lng,
                });
                setFormData((prev: any) => ({
                  ...prev,
                  coordinates: { lat: prev.coordinates?.lat || 0, lng },
                }));
              }
            }}
          />
        </div>
      </div>
      <div
        ref={mapContainer}
        className="map-container"
        style={{ width: "100%", height: "300px" }}
      />
    </div>
  );
};

export default MapComponent;
