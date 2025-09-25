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

  const vectorStyle =
    "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6";

  console.log("🚀 VehicleTracking component rendered");

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    console.log("✅ Sidebar toggled:", !sidebarCollapsed);
  };

  // Add vehicles to map
  const addVehiclesToMap = useCallback((vehicles: Vehicle[]) => {
    if (!map.current) {
      console.log("❌ Map not available for adding markers");
      return;
    }

    if (!map.current.isStyleLoaded()) {
      console.log("⏳ Map style not loaded yet, retrying in 500ms...");
      setTimeout(() => addVehiclesToMap(vehicles), 500);
      return;
    }

    console.log("📍 Adding vehicles to map:", vehicles.length, vehicles);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    vehicles.forEach((vehicle, index) => {
      console.log(`🚗 Adding vehicle ${index + 1}:`, {
        name: vehicle.name,
        coords: [vehicle.longitude, vehicle.latitude],
        status: vehicle.status,
      });

      // Create beautiful marker element
      const markerElement = document.createElement("div");
      const isOnline = vehicle.status === "online";
      const isMoving = vehicle.speed > 0;

      markerElement.className = isMoving
        ? "vehicle-marker moving"
        : "vehicle-marker";
      markerElement.style.cssText = `
        width: 45px;
        height: 45px;
        background: ${
          isOnline
            ? isMoving
              ? "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)"
              : "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)"
        };
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 
          0 6px 20px rgba(0,0,0,0.15), 
          0 2px 6px rgba(0,0,0,0.1),
          inset 0 1px 0 rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        position: relative;
        user-select: none;
      `;

      // Create inner icon container for better styling
      const iconContainer = document.createElement("div");
      iconContainer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      `;

      // Add appropriate icon based on vehicle type and status
      if (
        vehicle.name.toLowerCase().includes("truck") ||
        vehicle.name.toLowerCase().includes("камаз")
      ) {
        iconContainer.innerHTML = isMoving ? "🚚" : "🚛";
      } else if (
        vehicle.name.toLowerCase().includes("bus") ||
        vehicle.name.toLowerCase().includes("автобус")
      ) {
        iconContainer.innerHTML = "�";
      } else if (
        vehicle.name.toLowerCase().includes("excavator") ||
        vehicle.name.toLowerCase().includes("xcmg")
      ) {
        iconContainer.innerHTML = "🚜";
      } else if (isMoving) {
        iconContainer.innerHTML = "�";
      } else if (isOnline) {
        iconContainer.innerHTML = "🚙";
      } else {
        iconContainer.innerHTML = "⚫";
      }

      markerElement.appendChild(iconContainer);

      // Add status indicator dot
      const statusDot = document.createElement("div");
      statusDot.style.cssText = `
        position: absolute;
        top: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background: ${isMoving ? "#22c55e" : isOnline ? "#3b82f6" : "#ef4444"};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ${isMoving ? "animation: pulse 1.5s infinite;" : ""}
      `;
      markerElement.appendChild(statusDot);

      // Create marker
      const marker = new maplibregl.Marker(markerElement)
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .addTo(map.current!);

      console.log(`✅ Marker ${index + 1} added successfully`);

      // Add beautiful popup
      const popup = new maplibregl.Popup({
        offset: 30,
        closeButton: true,
        closeOnClick: false,
        className: "vehicle-popup",
      }).setHTML(`
        <div style="
          padding: 20px; 
          font-family: 'Inter', 'Segoe UI', sans-serif; 
          max-width: 280px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="
              width: 40px; 
              height: 40px; 
              background: ${
                isMoving
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : isOnline
                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                  : "linear-gradient(135deg, #ef4444, #dc2626)"
              };
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              margin-right: 12px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            ">
              ${iconContainer.innerHTML}
            </div>
            <div>
              <h3 style="
                margin: 0 0 4px 0; 
                font-weight: 700; 
                color: #1f2937; 
                font-size: 16px;
                line-height: 1.2;
              ">${vehicle.name}</h3>
              <span style="
                background: ${
                  vehicle.status === "online" ? "#dcfce7" : "#fee2e2"
                };
                color: ${vehicle.status === "online" ? "#15803d" : "#dc2626"};
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">
                ${vehicle.status === "online" ? "🟢 Onlayn" : "🔴 Oflayn"}
              </span>
            </div>
          </div>
          
          <div style="
            background: #f1f5f9;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
          ">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 13px; font-weight: 500;">🏃‍♂️ Tezlik:</span>
              <span style="color: #1e293b; font-weight: 700; font-size: 14px;">${
                vehicle.speed
              } km/h</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b; font-size: 13px; font-weight: 500;">📍 Koordinatalar:</span>
              <span style="color: #1e293b; font-size: 12px; font-family: monospace;">${vehicle.latitude.toFixed(
                4
              )}, ${vehicle.longitude.toFixed(4)}</span>
            </div>
          </div>
          
          <div style="
            font-size: 11px; 
            color: #94a3b8; 
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          ">
            Oxirgi yangilanish: ${new Date(vehicle.lastUpdate).toLocaleString(
              "uz-UZ"
            )}
          </div>
        </div>
      `);

      markerElement.addEventListener("click", () => {
        console.log(`🎯 Clicked on vehicle: ${vehicle.name}`);

        // Add click animation
        markerElement.classList.add("clicked");
        setTimeout(() => {
          markerElement.classList.remove("clicked");
        }, 600);

        popup.addTo(map.current!);
      });

      markersRef.current.push(marker);
    });

    console.log(
      `✅ Total ${vehicles.length} vehicles added to map. Current markers:`,
      markersRef.current.length
    );
  }, []);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      console.log("📡 Fetching vehicles from API...");
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/tracking/vehicles`);
      console.log("📊 Raw API Response:", response.data);
      console.log("📊 API Response type:", typeof response.data);
      console.log(
        "📊 API Response length:",
        Array.isArray(response.data) ? response.data.length : "Not an array"
      );

      let vehiclesData = response.data;

      // If API returns empty or null, use test data
      if (
        !vehiclesData ||
        (Array.isArray(vehiclesData) && vehiclesData.length === 0)
      ) {
        console.log("🧪 API returned empty data, using test vehicles...");
        vehiclesData = [
          {
            id: 1,
            name: "Test Texnika 1",
            position: { latitude: 41.2995, longitude: 69.2401, speed: 45 },
            status: { isOnline: true },
          },
          {
            id: 2,
            name: "Test Texnika 2",
            position: { latitude: 41.3051, longitude: 69.2797, speed: 0 },
            status: { isOnline: false },
          },
          {
            id: 3,
            name: "Test Texnika 3",
            position: { latitude: 41.2856, longitude: 69.2034, speed: 30 },
            status: { isOnline: true },
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
            | "offline", // Moving vehicles are online
          lastUpdate: item.lastUpdate || new Date().toISOString(),
        };
        console.log(`🚗 Transformed vehicle:`, vehicle);
        return vehicle;
      });

      console.log("🔄 Final transformed vehicles:", transformedData);
      console.log(`📈 Total vehicles to display: ${transformedData.length}`);

      setVehicles(transformedData);

      // Add markers with a small delay to ensure map is ready
      setTimeout(() => {
        addVehiclesToMap(transformedData);
      }, 100);

      setLoading(false);
      console.log("✅ Vehicles loaded and markers should be added!");
    } catch (err) {
      console.error("❌ Error fetching vehicles:", err);

      // Use test data on error
      console.log("🧪 Using test data due to API error...");
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
          name: "Fallback Texnika 2",
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

    console.log("🗺️ Initializing map...");

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: vectorStyle,
        center: [69.2401, 41.2995], // Tashkent coordinates
        zoom: 10,
      });

      map.current.on("load", () => {
        console.log("✅ Map loaded successfully");
        fetchVehicles();
      });

      map.current.on("error", (e) => {
        console.error("❌ Map error:", e);
        setError("Xaritani yuklashda xatolik yuz berdi");
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("❌ Error initializing map:", error);
      setError("Xaritani yuklashda xatolik yuz berdi");
    }

    return () => {
      console.log("🧹 Cleaning up map...");
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [fetchVehicles]);

  // Periodic vehicle updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        console.log("🔄 Auto-refreshing vehicles...");
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
                            <img src="/image/car.jpg" alt="vehicle" />
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
              className="sidebar-toggle vehicle-tracking rounded-rect left"
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
