import React, { useState, useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import axios from "axios";
import "maplibre-gl/dist/maplibre-gl.css";
import { API_URL } from "../../config/const";

// Vehicle interface
interface Vehicle {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: "online" | "offline";
  lastUpdate: string;
}

const VehicleTracking: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const vehicleDataRef = useRef<Vehicle[]>([]);

  const vectorStyle =
    "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6";


  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Add vehicles to map - FactoryMap style
  const addVehiclesToMap = useCallback((vehicles: Vehicle[]) => {
    if (!map.current) {
      return;
    }

    if (!map.current.isStyleLoaded()) {
      setTimeout(() => addVehiclesToMap(vehicles), 500);
      return;
    }


    // Check if we can update existing markers instead of recreating
    const canUpdateExisting =
      markersRef.current.length > 0 &&
      markersRef.current.length === vehicles.length &&
      vehicleDataRef.current.length === vehicles.length;

    if (canUpdateExisting) {
      let hasAnyChanges = false;

      vehicles.forEach((vehicle, index) => {
        const currentMarker = markersRef.current[index];
        const oldVehicle = vehicleDataRef.current[index];

        if (currentMarker && oldVehicle) {
          const hasPositionChanged =
            Math.abs(oldVehicle.latitude - vehicle.latitude) > 0.000001 ||
            Math.abs(oldVehicle.longitude - vehicle.longitude) > 0.000001;

          if (hasPositionChanged) {
            const newPosition: [number, number] = [
              vehicle.longitude,
              vehicle.latitude,
            ];
            currentMarker.setLngLat(newPosition);
            hasAnyChanges = true;
          }
        }
      });

      // Update stored vehicle data
      vehicleDataRef.current = [...vehicles];

      if (!hasAnyChanges) {
       
      }
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    vehicleDataRef.current = [];

    vehicles.forEach((vehicle, index) => {
     

      // Create marker element using img like FactoryMap
      const el = document.createElement("img");
      const isOnline = vehicle.status === "online";
      const isMoving = vehicle.speed > 0;

      // Choose icon based on vehicle type and status
      let iconName = "car.jpg";
      if (
        vehicle.name.toLowerCase().includes("truck") ||
        vehicle.name.toLowerCase().includes("камаз")
      ) {
        iconName = isMoving ? "sedan.png" : "car.jpg";
      } else if (
        vehicle.name.toLowerCase().includes("excavator") ||
        vehicle.name.toLowerCase().includes("xcmg")
      ) {
        iconName = "mine-cart.png";
      } else if (isMoving) {
        iconName = "sedan.png";
      } else if (!isOnline) {
        iconName = "marker2.png";
      }

      el.src = `/image/carmarker.png`;
      el.style.width = "64px";
      el.style.height = "64px";
      el.style.cursor = "pointer";

      // Create popup content - FactoryMap style
      const popupContent = `
        <div style="background: white; padding: 15px; border-radius: 8px; max-width: 280px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${
            vehicle.name
          }</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;">
            Status: <span style="color: ${
              vehicle.status === "online" ? "#10b981" : "#ef4444"
            };">
              ${vehicle.status === "online" ? "🟢 Onlayn" : "🔴 Oflayn"}
            </span>
          </p>
          <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Tezlik: ${
            vehicle.speed
          } km/h</p>
          <p style="margin: 4px 0; font-size: 12px; color: #94a3b8;">
            Koordinatalar: ${vehicle.latitude.toFixed(
              4
            )}, ${vehicle.longitude.toFixed(4)}
          </p>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

      // Create marker using FactoryMap pattern
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click event handler - FactoryMap style
      el.addEventListener("click", (e) => {
        e.stopPropagation();

        // Fly to marker
        if (map.current) {
          map.current.flyTo({
            center: [vehicle.longitude, vehicle.latitude],
            zoom: 15,
            speed: 0.8,
            curve: 1.2,
            essential: true,
          });
        }
      });

      markersRef.current.push(marker);
    });

    // Store current vehicle data for next comparison
    vehicleDataRef.current = [...vehicles];

    
  }, []);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/tracking/vehicles`);

      let vehiclesData = response.data;

      // If API returns empty or null, use test data
      if (
        !vehiclesData ||
        (Array.isArray(vehiclesData) && vehiclesData.length === 0)
      ) {
        vehiclesData = [
          {
            id: 1,
            name: "Test Texnika 1",
            latitude: 41.2995,
            longitude: 69.2401,
            speed: 45,
            status: "online",
            lastUpdate: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Test Texnika 2",
            latitude: 41.3051,
            longitude: 69.2797,
            speed: 0,
            status: "offline",
            lastUpdate: new Date().toISOString(),
          },
          {
            id: 3,
            name: "KAMAZ Yuk Mashinasi",
            latitude: 41.2856,
            longitude: 69.2034,
            speed: 30,
            status: "online",
            lastUpdate: new Date().toISOString(),
          },
          {
            id: 4,
            name: "XCMG Ekskavator",
            latitude: 41.3156,
            longitude: 69.2434,
            speed: 0,
            status: "online",
            lastUpdate: new Date().toISOString(),
          },
        ];
      }

      const transformedData: Vehicle[] = vehiclesData.map((item: any) => {
        const vehicle = {
          id: item.id,
          name: item.name || `Texnika ${item.id}`,
          latitude: item.latitude || 41.2995,
          longitude: item.longitude || 69.2401,
          speed: item.speed || 0,
          status: (item.speed > 0 ? "online" : "offline") as
            | "online"
            | "offline",
          lastUpdate: item.lastUpdate || new Date().toISOString(),
        };
        return vehicle;
      });

      setVehicles(transformedData);
      setTimeout(() => {
        addVehiclesToMap(transformedData);
      }, 100);
      setLoading(false);
    } catch (err) {
      // Use test data on error
      const testVehicles: Vehicle[] = [
        {
          id: 1,
          name: "Fallback Texnika 1",
          latitude: 41.2995,
          longitude: 69.2401,
          speed: 25,
          status: "online",
          lastUpdate: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Fallback KAMAZ",
          latitude: 41.3051,
          longitude: 69.2797,
          speed: 0,
          status: "offline",
          lastUpdate: new Date().toISOString(),
        },
      ];

      setVehicles(testVehicles);
      setTimeout(() => {
        addVehiclesToMap(testVehicles);
      }, 100);
      setLoading(false);
    }
  }, [addVehiclesToMap]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;


    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: vectorStyle,
        center: [69.2401, 41.2995], // Tashkent coordinates
        zoom: 10,
      });

      map.current.on("load", () => {
        fetchVehicles();
      });

      map.current.on("error", (e) => {
        setError("Xaritani yuklashda xatolik yuz berdi");
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    } catch (error) {
      setError("Xaritani yuklashda xatolik yuz berdi");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      vehicleDataRef.current = [];
    };
  }, [fetchVehicles]);

  // Periodic vehicle updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchVehicles();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [loading, fetchVehicles]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-bold">Xatolik yuz berdi</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded">
          <div
            ref={mapContainer}
            className="maplibregl-map vehicle-tracking-map max-md:my-2 rounded max-md:w-full max-md:fixed rounded-[30px]"
            style={{
              width: "100%",
              height: "95vh",
              minHeight: "500px",
              position: "relative",
            }}
          >
            {/* Sidebar */}
            <div
              className={`sidebar vehicle-tracking left ${
                sidebarCollapsed ? "collapsed" : ""
              }`}
              style={{
                position: "absolute",
                top: 0,
                left: sidebarCollapsed ? "-300px" : "0px",
                width: "300px",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                transition: "left 0.3s ease",
                zIndex: 1000,
                borderRadius: "0 20px 20px 0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "block",
                visibility: "visible",
              }}
            >
              <div className="sidebar-content vehicle-tracking">
                <div className="px-4 py-3 bg-gray-50 border-b w-full flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    Texnikalar Kuzatuvi
                  </h3>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Online:{" "}
                      {vehicles.filter((v) => v.status === "online").length}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Offline:{" "}
                      {vehicles.filter((v) => v.status === "offline").length}
                    </span>
                  </div>
                </div>

                <div
                  className="overflow-y-auto w-full flex-1"
                  style={{
                    padding: "5px",
                  }}
                >
                  {loading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Texnikalar topilmadi</p>
                    </div>
                  ) : (
                    vehicles.map((vehicle, index) => (
                      <div
                        key={vehicle.id}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50`}
                        onClick={() => {
                          if (map.current) {
                            map.current.flyTo({
                              center: [vehicle.longitude, vehicle.latitude],
                              zoom: 15,
                              duration: 1000,
                            });
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div className="image-fit h-10 w-10 flex-none overflow-hidden rounded-full mr-3">
                            <img
                              src="/image/sedan.png"
                              alt="vehicle"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {index + 1}. {vehicle.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Tezlik: {vehicle.speed} km/h
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                  vehicle.status === "online"
                                    ? "bg-green-400"
                                    : "bg-red-400"
                                }`}
                              ></span>
                              <span className="text-xs text-gray-500">
                                {vehicle.status === "online"
                                  ? "Onlayn"
                                  : "Oflayn"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar toggle button */}
            <div
              className="sidebar-toggle factory-map rounded-rect left"
              style={{
                position: "absolute",
                top: "50%",
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
                transition: "left 0.3s ease",
                zIndex: 1001,
              }}
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? "→" : "←"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTracking;
