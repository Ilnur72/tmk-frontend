import React, { useEffect, useRef, useState, useCallback } from "react";
import FactoryModal from "./components/FactoryModal";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

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
  const toggleSidebar = useCallback(
    (id: string) => {
      if (!map.current) return;

      const collapsed = sidebarCollapsed;
      const padding: any = {};

      if (collapsed) {
        padding[id] = 300;
        map.current.easeTo({
          padding,
          duration: 1000,
        });
        setSidebarCollapsed(false);
      } else {
        padding[id] = 0;
        map.current.easeTo({
          padding,
          duration: 1000,
        });
        setSidebarCollapsed(true);
      }
    },
    [sidebarCollapsed]
  );

  // Fly to marker function
  const flyToMarker = useCallback(
    (coords: [number, number], fromSidebar = false) => {
      if (!map.current) return;

      if (window.innerWidth <= 768 && fromSidebar && !sidebarCollapsed) {
        toggleSidebar("left");
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
        const isFactoryMap = window.location.pathname === "/map";
        let popup = null;

        if (!isFactoryMap) {
          const popupContent = `
          <div style="background: white; padding: 10px; border-radius: 5px;" class="w-96 max-md:w-[300px]">
            <h2 style="margin: 0; color: #2c3e50;" class="font-bold text-lg">${
              factory.name
            }</h2>
            <p style="margin: 5px 0; font-size: 1.4em;">Лойиҳа ва объект бўйича маълумот</p>
            <p style="margin: 5px 0; font-size: 1.4em;">Қурилиш жараёни маълумотлари</p>
            <p style="margin: 5px 0; font-size: 1.4em;">Ишлаб чиқариш жараёни маълумотлари</p>
            <p style="margin: 5px 0; font-size: 1.4em;">Онлайн видео кузатув</p>
            <p style="margin: 5px 0; font-size: 1.4em;">Ходимлар ҳақида махлумот</p>
            <p style="margin: 5px 0; font-size: 1.4em;">Техникалар ҳақида махлумот</p>
            ${
              factory.images
                ? `<img src="/mnt/tmkupload/factory-images/${
                    JSON.parse(factory.images)[0]
                  }" style="width: 100%; border-radius: 5px;" />`
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
          const isFactoryMap = window.location.pathname === "/map";
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
              <div class="font-small">${factory.sort_num || index + 1}. ${
          factory.name
        }</div>
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
      console.error("Error fetching factories:", error);
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
      // Auto-collapse sidebar on load
      toggleSidebar("left");
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Map Styles */}
      <style>{`
        #map {
          width: 100%;
          height: 97vh;
          margin: 0;
          padding: 0;
          left: 0;
        }

        .rounded-rect {
          background: white;
          border-radius: 10px;
          box-shadow: 0 0 50px -25px black;
        }

        .flex-center {
          position: absolute;
          display: flex;
          padding-left: 10px;
          margin-top: 10px;
        }

        .flex-center.left {
          left: 0px;
        }

        .sidebar-content {
          position: absolute;
          width: 88%;
          height: 90%;
          color: gray;
        }

        .sidebar-toggle {
          position: absolute;
          width: 1.3em;
          height: 1.3em;
          overflow: visible;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .sidebar-toggle.left {
          right: -1.5em;
        }

        .sidebar-toggle:hover {
          color: #0aa1cf;
          cursor: pointer;
        }

        .sidebar {
          transition: transform 1s;
          z-index: 1;
          width: 300px;
          height: 100%;
        }

        .left.collapsed {
          transform: translateX(-276px);
        }

        .maplibregl-ctrl-top-right {
          bottom: 130px;
          top: auto;
          right: 7px;
        }

        .maplibregl-ctrl-bottom-right {
          bottom: 80px;
          right: 7px;
        }
      `}</style>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded ">
          <div
            id="map"
            ref={mapContainer}
            className="maplibregl-map max-md:my-2 rounded max-md:w-full max-md:fixed rounded-[30px]"
          >
            <div
              id="left"
              className={`sidebar flex-center left ${
                sidebarCollapsed ? "collapsed" : ""
              }`}
            >
              <div className="absolute max-md:top-10 sidebar-content rounded-rect flex-center max-md:h-[87%]">
                <div
                  id="markerList"
                  style={{
                    margin: "5px",
                    padding: "5px",
                    overflowY: "auto",
                    top: sidebarCollapsed ? "30px" : "0",
                  }}
                ></div>

                <div
                  className="sidebar-toggle rounded-rect left"
                  style={{ fontSize: "2em" }}
                  onClick={() => toggleSidebar("left")}
                >
                  →
                </div>
              </div>
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
