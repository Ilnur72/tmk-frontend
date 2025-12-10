import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FactoryModal from "./modal/FactoryModal";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import { API_URL } from "../../config/const";

interface Factory {
  id: number;
  name: string;
  coords: [number, number];
  marker_icon: string;
  status: string;
  work_persent: number;
  images?: string;
  sort_num?: number;
  enterprise_name?: string;
  project_goal?: string;
  region?: string;
  importance?: string;
  description?: string;
  category?: string;
  address?: string;
  custom_fields?: Record<string, any>;
  project_values?: any;
  parameters?: any;
  factoryParams?: Array<{
    id: number;
    title?: string;
    value?: string;
    unit?: string;
  }>;
  cameras?: Array<{
    id: number;
    name: string;
    model: string;
    brand?: string;
    ip_address: string;
    status?: string;
    stream_link?: string;
    has_ptz?: boolean;
  }>;
  longitude?: number;
  latitude?: number;
  cameraUrl?: string;
}

interface LayerToggleControl {
  onAdd(map: maplibregl.Map): HTMLElement;
  onRemove(): void;
}

const FactoryMap: React.FC = () => {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Cleanup any existing VehicleTracking map instances
  const cleanupVehicleTrackingMaps = useCallback(() => {
    // Remove any vehicle tracking map containers
    const vehicleMapContainer = document.getElementById(
      "vehicleTrackingMapContainer"
    );
    if (vehicleMapContainer) {
      vehicleMapContainer.innerHTML = "";
    }

    // Clear vehicle tracking global variables
    (window as any).flyToVehicle = undefined;
    (window as any).currentVehiclesData = undefined;

    // Clear any maplibre-gl maps that might exist
    const existingMaps = document.querySelectorAll(".maplibregl-map");
    existingMaps.forEach((mapEl) => {
      if (mapEl.id === "vehicleTrackingMapContainer") {
        const mapInstance = (mapEl as any)._map;
        if (mapInstance && typeof mapInstance.remove === "function") {
          mapInstance.remove();
        }
      }
    });
  }, []);

  // Map styles
  const vectorStyle =
    "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6";

  const satelliteStyle = React.useMemo(
    () => ({
      version: 8 as const,
      sources: {
        esri: {
          type: "raster" as const,
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "esri-satellite",
          type: "raster" as const,
          source: "esri",
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    }),
    []
  );

  // Show factory details modal
  const showFactoryDetails = useCallback((factory: Factory) => {
    setSelectedFactory(factory);
    setShowModal(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedFactory(null);
  }, []);

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Fly to marker function
  const flyToMarker = useCallback(
    (coords: [number, number], fromSidebar = false) => {
      if (!map.current) return;

      if (window.innerWidth <= 768 && fromSidebar && !sidebarCollapsed) {
        toggleSidebar();
      }

      map.current.flyTo({
        center: coords,
        zoom: 15,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });
    },
    [sidebarCollapsed, toggleSidebar]
  );

  // Add markers to map
  const addMarkersToMap = useCallback(
    (factoriesData: Factory[]) => {
      if (!map.current) return;

      // Store factories data globally for sidebar access
      (window as any).currentFactoriesData = factoriesData;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Clear marker list
      const markerList = document.getElementById("markerList");
      if (markerList) {
        markerList.innerHTML = "";
      }

      let listData = "";

      factoriesData.forEach((factory, index) => {
        if (!factory.coords || factory.coords.length !== 2) return;

        // Create marker element
        const el = document.createElement("img");
        const imageName = factory.marker_icon
          ? `${factory.marker_icon}.png`
          : "marker.png";
        el.src = `/image/${imageName}`;
        el.style.width = "64px";
        el.style.height = "64px";
        el.style.cursor = "pointer";

        // Create popup content (not for factory map page)
        const isFactoryMap = window.location.pathname === "/";
        let popup = null;

        if (!isFactoryMap) {
          const popupContent = `
            <div style="background: white; padding: 10px; border-radius: 5px;" class="w-96 max-md:w-[300px]">
              <h2 style="margin: 0; color: #2c3e50;" class="font-bold text-lg">${
                factory.name
              }</h2>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.project_object"
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.construction_process"
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.production_process"
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.online_video"
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.employee_info"
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.technique_info"
              )}</p>
              ${
                factory.images
                  ? `<img src=\"${API_URL}/mnt/tmkupload/factory-images/${
                      JSON.parse(factory.images)[0]
                    }\" style=\"width: 100%; border-radius: 5px;\" />`
                  : '<img src="/image/1.jpg" style="width: 100%; border-radius: 5px;" />'
              }
            </div>
          `;
          popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);
        }

        // Create marker
        const marker = new maplibregl.Marker({ element: el }).setLngLat(
          factory.coords
        );

        if (popup) {
          marker.setPopup(popup);
        }

        marker.addTo(map.current!);
        markersRef.current.push(marker);

        // Add marker click event
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          flyToMarker(factory.coords);

          // Show React modal for factory map page
          const isFactoryMap = window.location.pathname === "/";
          if (isFactoryMap) {
            showFactoryDetails(factory);
          } else {
            // Show factory details modal if function exists for other pages
            if (typeof (window as any).showFactoryDetails === "function") {
              setTimeout(() => {
                (window as any).showFactoryDetails(factory);
              }, 500);
            }
          }
        });

        // Add to sidebar list
        const clickAction = isFactoryMap
          ? `flyToMarker([${factory.coords}], true); setTimeout(() => { window.showReactModal(${index}); }, 500);`
          : `flyToMarker([${factory.coords}], true)`;

        listData += `
        <div class="intro-x">
          <div class="box zoom-in mb-1 flex items-center px-1 py-1 cursor-pointer hover:bg-gray-50" onclick="${clickAction}">
            <div class="image-fit h-10 w-10 flex-none overflow-hidden rounded-full">
              <img src="/image/marker2.png" alt="marker">
            </div>
            <div class="ml-4 mr-auto">
              <div class="font-small">${index + 1}. ${factory.name}</div>
            </div>
          </div>
        </div>
      `;
      });

      if (markerList) {
        markerList.innerHTML = listData;
      }

      // Make flyToMarker globally available
      (window as any).flyToMarker = flyToMarker;

      // Make showReactModal globally available for sidebar clicks
      (window as any).showReactModal = (index: number) => {
        const factoryData = (window as any).currentFactoriesData?.[index];
        if (factoryData) {
          showFactoryDetails(factoryData);
        }
      };
    },
    [flyToMarker, showFactoryDetails]
  );

  // Fetch factories data
  const fetchFactories = useCallback(async () => {
    try {
      const response = await axios.get("/factory/marker");
      const data = response.data || [];

      // Parse coords if they're strings
      const processedData = data.map((item: any) => ({
        ...item,
        coords:
          typeof item.coords === "string"
            ? JSON.parse(item.coords.replace(/'/g, '"'))
            : item.coords,
      }));

      addMarkersToMap(processedData);
    } catch (error) {
      console.error(t("factory.errors.fetch"), error);
    }
  }, [addMarkersToMap]);

  // Layer toggle control
  const createLayerToggleControl = useCallback((): LayerToggleControl => {
    let isSatellite = false;

    return {
      onAdd(mapInstance: maplibregl.Map): HTMLElement {
        const btn = document.createElement("button");
        btn.className = "maplibregl-ctrl-icon";
        btn.type = "button";
        btn.title = "Toggle Satellite";
        btn.innerHTML = "🛰️";
        btn.style.fontSize = "16px";

        btn.onclick = () => {
          mapInstance.setStyle(isSatellite ? vectorStyle : satelliteStyle);
          isSatellite = !isSatellite;
        };

        const container = document.createElement("div");
        container.className = "maplibregl-ctrl maplibregl-ctrl-group";
        container.appendChild(btn);
        return container;
      },

      onRemove(): void {
        // Cleanup if needed
      },
    };
  }, [vectorStyle, satelliteStyle]);

  // Component mount cleanup
  useEffect(() => {
    cleanupVehicleTrackingMaps();
  }, [cleanupVehicleTrackingMaps]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: vectorStyle,
      center: [69.2401, 41.2995], // Tashkent
      zoom: 6,
      attributionControl: false,
    });

    // Add navigation control
    map.current.addControl(new maplibregl.NavigationControl());

    // Add layer toggle control
    map.current.addControl(createLayerToggleControl() as any, "bottom-right");

    // Load markers when map is ready
    map.current.on("load", () => {
      fetchFactories();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [createLayerToggleControl]);

  // Handle sidebar padding changes
  useEffect(() => {
    if (!map.current) return;

    const padding = sidebarCollapsed ? { left: 0 } : { left: 300 };
    map.current.easeTo({
      padding,
      duration: 300,
    });
  }, [sidebarCollapsed]);

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded ">
          <div
            id="map"
            ref={mapContainer}
            className="maplibregl-map max-md:my-2 max-md:w-full max-md:fixed rounded-[30px]"
          >
            <div
              id="left"
              className={`sidebar  left ${sidebarCollapsed ? "collapsed" : ""}`}
              style={{
                position: "absolute",
                top: window.innerWidth <= 768 ? "45px" : 0,
                left: sidebarCollapsed ? -300 : 0,
                width: "300px",
                height: window.innerWidth <= 768 ? "calc(100% - 80px)" : "100%",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                transition: "left 0.3s ease, top 0.3s ease, height 0.3s ease",
                zIndex: 1,
                borderRadius: "0 20px 20px 0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="sidebar-content factory-map">
                <div
                  id="markerList"
                  style={{
                    padding: "5px",
                    overflowY: "auto",
                    height: "100%",
                  }}
                ></div>
              </div>
            </div>

            {/* Sidebar toggle button - har doim ko'rinadigan */}
            <div
              className="sidebar-toggle factory-map rounded-rect left"
              style={{
                position: "absolute",
                top: window.innerWidth <= 768 ? "calc(50% + 40px)" : "50%",
                left: sidebarCollapsed ? "10px" : "310px",
                width: "40px",
                height: "60px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5em",
                transform: "translateY(-50%)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                transition: "left 0.3s ease, top 0.3s ease",
                zIndex: 1,
              }}
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? "→" : "←"}
            </div>
          </div>
        </div>
      </div>

      {/* Factory Details Modal */}
      <FactoryModal
        factory={selectedFactory}
        isOpen={showModal}
        onClose={closeModal}
      />
    </>
  );
};

export default FactoryMap;
