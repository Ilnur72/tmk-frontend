import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import FactoryModal from "./modal/FactoryModal";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import { API_URL } from "../../config/const";
import { Select } from "../../components/UI/Select";

// Weather Widget Component
const WeatherWidget = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set widget HTML with custom attributes
    container.innerHTML = `
      <div style="border-radius: 12px; overflow: hidden;" id="ww_5e9f54c4e904c" v='1.3' loc='id' a='{"t":"horizontal","lang":"uz","sl_lpl":1,"ids":["wl2689"],"font":"Arial","sl_ics":"one_a","sl_sot":"celsius","cl_bkg":"#33b5d6","cl_font":"#FFFFFF","cl_cloud":"#FFFFFF","cl_persp":"#FFFFFF","cl_sun":"#FFC107","cl_moon":"#FFC107","cl_thund":"#FF5722"}'>
        <a href="https://weatherwidget.org/" id="ww_5e9f54c4e904c_u" target="_blank">Html weather widget</a>
      </div>
    `;

    // Load widget script
    const script = document.createElement("script");
    script.src = "https://app3.weatherwidget.org/js/?id=ww_5e9f54c4e904c";
    script.async = true;
    script.id = "weather-widget-script";
    scriptRef.current = script;
    document.body.appendChild(script);

    return () => {
      // Clean up script
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        try {
          document.body.removeChild(scriptRef.current);
        } catch (e) {
          // Ignore if already removed
        }
      }

      // Clean up widget container
      if (container) {
        container.innerHTML = "";
      }

      // Clean up any global variables created by the widget
      try {
        const widgetEl = document.getElementById("ww_5e9f54c4e904c");
        if (widgetEl?.parentNode) {
          widgetEl.parentNode.removeChild(widgetEl);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  return <div ref={containerRef}></div>;
};

enum ProjectCategory {
  FACTORY = "factory",
  MINE = "mine",
  MINE_CART = "mine-cart",
}

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
  object_type?: string;
  description?: string;
  category?: string;
  project_category?: string;
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

interface ObjectType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

const FactoryMap: React.FC = () => {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showWeatherMapModal, setShowWeatherMapModal] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [allFactories, setAllFactories] = useState<Factory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedObjectType, setSelectedObjectType] = useState<string>("");
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const didFetchRef = useRef(false);

  // Cleanup any existing VehicleTracking map instances
  const cleanupVehicleTrackingMaps = useCallback(() => {
    // Remove any vehicle tracking map containers
    const vehicleMapContainer = document.getElementById(
      "vehicleTrackingMapContainer",
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
    [],
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
    [sidebarCollapsed, toggleSidebar],
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
        // Sanitize marker_icon and ensure proper format
        let iconName = factory.marker_icon || "marker";
        // Remove any existing extension
        iconName = iconName.replace(/\.(png|jpg|jpeg|svg)$/i, "");
        // Add .png extension
        const imageName = `${iconName}.png`;
        el.src = `/image/${imageName}`;
        el.style.width = "64px";
        el.style.height = "64px";
        el.style.cursor = "pointer";

        // Create popup content (not for factory map page)
        const isFactoryMap = window.location.pathname === "/factory-map";
        let popup = null;

        if (!isFactoryMap) {
          const popupContent = `
            <div style="background: white; padding: 10px; border-radius: 5px;" class="w-96 max-md:w-[300px]">
              <h2 style="margin: 0; color: #2c3e50;" class="font-bold text-lg">${
                factory.name
              }</h2>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.project_object",
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.construction_process",
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.production_process",
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.online_video",
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.employee_info",
              )}</p>
              <p style="margin: 5px 0; font-size: 1.4em;">${t(
                "factory.info.technique_info",
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
          factory.coords,
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
          const isFactoryMap = window.location.pathname === "/factory-map";

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
          : `flyToMarker([${factory.coords}], true);`;

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
    [flyToMarker, showFactoryDetails, t],
  );

  // Fetch object types from backend
  const fetchObjectTypes = useCallback(async () => {
    try {
      const response = await axios.get("/factory/object-types");
      if (response.data && Array.isArray(response.data)) {
        setObjectTypes(response.data);
      }
    } catch (error) {
      console.error("Object types fetch error:", error);
    }
  }, []);

  // Fetch factories data
  const fetchFactories = useCallback(async () => {
    try {
      const params: any = {};

      // Add project_category filter if selected
      if (selectedCategory) {
        params.project_category = selectedCategory;
      }

      const response = await axios.get("/factory/marker", { params });
      const data = response.data || [];

      // Parse coords if they're strings
      const processedData = data.map((item: any) => ({
        ...item,
        coords:
          typeof item.coords === "string"
            ? JSON.parse(item.coords.replace(/'/g, '"'))
            : item.coords,
      }));

      setAllFactories(processedData);
      addMarkersToMap(processedData);
    } catch (error) {
      console.error(t("factory.errors.fetch"), error);
    }
  }, [selectedCategory, addMarkersToMap, t]);

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
      // Prevent double fetch in React 18 StrictMode
      if (didFetchRef.current) return;
      didFetchRef.current = true;

      fetchFactories();
      fetchObjectTypes();
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

  // Filter factories when filters change
  useEffect(() => {
    // Skip initial fetch if didFetchRef is false (map not loaded yet)
    if (!didFetchRef.current) return;

    // Refetch when category changes (backend filter)
    fetchFactories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Filter by object type (client-side only)
  useEffect(() => {
    if (allFactories.length === 0) return;

    let filtered = allFactories;

    if (selectedObjectType) {
      filtered = filtered.filter(
        (factory) => factory.object_type === selectedObjectType,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    addMarkersToMap(filtered);
  }, [selectedObjectType, allFactories]);

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded ">
          <div
            id="map"
            ref={mapContainer}
            className="maplibregl-map max-md:my-2 max-md:w-full max-md:fixed rounded-[30px]"
          >
            {/* Filters Section - positioned above map next to sidebar */}
            <div
              className="absolute z-10 transition-all duration-300 ease-in-out max-md:static max-md:mb-2 max-md:px-2 max-md:w-full pointer-events-none"
              style={{
                top: window.innerWidth > 768 ? "16px" : "auto",
                left:
                  window.innerWidth > 768
                    ? sidebarCollapsed
                      ? "20px"
                      : "320px"
                    : "auto",
              }}
            >
              <div className="grid grid-cols-1 gap-2 max-md:gap-2 items-start">
                {/* Filters */}
                <div className="pointer-events-auto">
                  <div className="backdrop-blur-md rounded-2xl shadow-md border border-gray-200/50 p-2.5 max-md:p-2 w-fit">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-md:gap-1.5">
                      {/* Category Filter - Checkbox with Icons */}
                      <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 max-md:text-[10px]">
                          {t("factory.filters.category", "Loyiha kategoriyasi")}
                          :
                        </label>
                        <div className="flex flex-wrap justify-center gap-2 max-md:gap-1">
                          {/* All button */}
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value=""
                              checked={selectedCategory === ""}
                              onChange={() => setSelectedCategory("")}
                              className="w-3 h-3"
                            />
                            <div className="text-lg">📋</div>
                            <span className="text-xs text-gray-600">
                              {t("factory.filters.all", "Barchasi")}
                            </span>
                          </label>

                          {/* Factory */}
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value="factory"
                              checked={selectedCategory === "factory"}
                              onChange={() => setSelectedCategory("factory")}
                              className="w-3 h-3"
                            />
                            <img
                              src="/image/factory.png"
                              alt="Factory"
                              className="w-7 h-7"
                            />
                            <span className="text-xs text-gray-600">Metal</span>
                          </label>

                          {/* Mine */}
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value="mine"
                              checked={selectedCategory === "mine"}
                              onChange={() => setSelectedCategory("mine")}
                              className="w-3 h-3"
                            />
                            <img
                              src="/image/mine.png"
                              alt="Mine"
                              className="w-7 h-7"
                            />
                            <span className="text-xs text-gray-600">Mine</span>
                          </label>

                          {/* Mine Cart */}
                          <label className="flex flex-col items-center gap-0.5 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value="mine-cart"
                              checked={selectedCategory === "mine-cart"}
                              onChange={() => setSelectedCategory("mine-cart")}
                              className="w-3 h-3"
                            />
                            <img
                              src="/image/mine-cart.png"
                              alt="Mine Cart"
                              className="w-7 h-7"
                            />
                            <span className="text-xs text-gray-600">
                              Market
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Object Type Filter - Custom Select */}
                      <div>
                        <Select
                          label={t("factory.filters.objectType", "Obyekt tipi")}
                          options={[
                            {
                              id: "",
                              name: t("factory.filters.all", "Barchasi"),
                            },
                            ...objectTypes.map((type) => ({
                              id: type.name,
                              name: type.name,
                            })),
                          ]}
                          value={selectedObjectType}
                          onChange={(value) => setSelectedObjectType(value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Widget - fixed to right, independent of sidebar */}
            <div
              className="absolute z-10 max-md:hidden pointer-events-auto"
              style={{
                top: "16px",
                right: "20px",
              }}
            >
              <div
                className="rounded-3xl overflow-hidden"
                style={{ width: "350px" }}
              >
                <div className="w-full scale-90 origin-top rounded-lg">
                  <WeatherWidget />
                </div>
                {/* Weather Map Button */}
                <div className="pb-1 px-5 border-t border-gray-100/50 justify-end flex">
                  <button
                    onClick={() => setShowWeatherMapModal(true)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-primary hover:from-cyan-600 hover:to-primary text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm group"
                  >
                    <svg
                      className="w-4 h-4 transition-transform group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    {t("factory.filters.map", "Karta")}
                  </button>
                </div>
              </div>
            </div>

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

      {/* Weather Map Modal - Fullscreen */}
      {showWeatherMapModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
          onClick={() => setShowWeatherMapModal(false)}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowWeatherMapModal(false)}
              className="absolute top-4 left-4 z-[10000] bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-2xl transition-all hover:scale-110"
              title="Yopish"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Top gradient overlay to hide header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent z-[9999] pointer-events-none"></div>

            {/* Weather Map Iframe - positioned higher to hide top bar */}
            <iframe
              src="https://www.ventusky.com/temperature-map/2m-above-ground#p=39.59;69.02;8&t=20260112/07&src=link"
              className="w-full border-0 rounded-lg"
              style={{
                height: "calc(100% + 77px)",
                marginTop: "-77px",
              }}
              title="Ob-havo kartasi"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FactoryMap;
