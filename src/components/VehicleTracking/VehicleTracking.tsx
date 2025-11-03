import React, { useState, useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { Activity, Wifi, Zap, ZapOff } from "lucide-react";
import VehicleDetailModal from "./VehicleDetailModal";
import TransportListModal from "./TransportListModal";
import { useWebSocket } from "../../hooks/useWebSocket";

const API_BASE_URL = "http://localhost:8085";

interface Vehicle {
  id: number;
  name: string;
  position: {
    latitude: number;
    longitude: number;
    speed: number;
  };
  status: {
    isOnline: boolean;
  };
  sensors: {
    ignition: boolean;
    voltage: number;
    fuel?: number;
  };
}

interface VehicleStats {
  total: number;
  online: number;
}

const VehicleTracking: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket hook according to FRONTEND_DEVELOPER_GUIDE.md
  const {
    isConnected,
    vehicles: wsVehicles,
    lastUpdate,
    error: wsError,
    connectionStatus,
    requestVehicleDetails,
    enableRealTimeTracking,
  } = useWebSocket({
    url: "ws://localhost:8085/tracking",
    autoConnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 2000,
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats>({ total: 0, online: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [activeVehicleId, setActiveVehicleId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransportListOpen, setIsTransportListOpen] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true); // Real-time boshqarish
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  ); // Manual refresh interval

  // Cache ma'lumotlari uchun ref (render'da ishlamaydi)
  const cacheRef = useRef<{
    vehicles: Vehicle[] | null;
    stats: VehicleStats | null;
    lastUpdate: number | null;
  }>({ vehicles: null, stats: null, lastUpdate: null });

  // ✅ FIXED: Focus function that uses marker position when available
  const focusOnVehicle = useCallback(
    (vehicleId: number) => {
      if (!map.current) return;

      // Try to get position from existing marker first
      const marker = markersRef.current.get(vehicleId);
      if (marker) {
        const markerPosition = marker.getLngLat();
        console.log(
          `🎯 Flying to marker position:`,
          markerPosition.lat,
          markerPosition.lng
        );

        map.current.flyTo({
          center: [markerPosition.lng, markerPosition.lat],
          zoom: 16,
          duration: 1500,
        });
      } else {
        // Fallback to vehicle data from state
        const vehicle = vehicles.find((v: any) => v.id === vehicleId);
        if (vehicle?.position) {
          console.log(
            `🎯 Flying to state position:`,
            vehicle.position.latitude,
            vehicle.position.longitude
          );
          map.current.flyTo({
            center: [vehicle.position.longitude, vehicle.position.latitude],
            zoom: 16,
            duration: 1500,
          });
        }
      }

      // Request vehicle details if connected
      if (isConnected && requestVehicleDetails) {
        requestVehicleDetails(vehicleId);
      }

      // Set active vehicle for highlighting
      setActiveVehicleId(vehicleId);

      // Open modal with vehicle details
      const vehicle = vehicles.find((v: any) => v.id === vehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
      }
    },
    [vehicles, isConnected, requestVehicleDetails]
  );

  // ✅ Real-time boshqarish funksiyasi
  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled((prev) => {
      const newValue = !prev;

      if (newValue) {
        // Real-time yoqildi - interval'ni to'xtatish
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
        console.log("🔴➡️🟢 Real-time yoqildi, WebSocket ishlatiladi");
      } else {
        // Real-time o'chirildi - manual interval boshlash
        console.log("🟢➡️🔴 Real-time o'chirildi, 30 soniyada yangilanadi");

        // Darhol birinchi ma'lumotlarni olish
        const fetchManualData = async () => {
          console.log("🔄 Manual refresh (real-time o'chiq)");
          try {
            // Direct API call to avoid dependency issues
            const [vehiclesResponse, statsResponse] = await Promise.all([
              Promise.race([
                axios.get(`${API_BASE_URL}/api/vehicles/realtime`, {
                  timeout: 1000,
                }),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Vehicles timeout")), 1000)
                ),
              ]),
              Promise.race([
                axios.get(`${API_BASE_URL}/api/vehicles/stats`, {
                  timeout: 1000,
                }),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Stats timeout")), 1000)
                ),
              ]),
            ]);

            const vehiclesData = (vehiclesResponse as any).data?.success
              ? (vehiclesResponse as any).data.data
              : (vehiclesResponse as any).data;
            const statsData = (statsResponse as any).data?.success
              ? (statsResponse as any).data.data
              : (statsResponse as any).data;

            if (vehiclesData) {
              const processedVehicles = vehiclesData.map((vehicle: any) => ({
                ...vehicle,
                position: vehicle.position || {
                  latitude: 41.2995,
                  longitude: 69.2401,
                  speed: 0,
                },
                status: vehicle.status || { isOnline: false },
                sensors: vehicle.sensors || {},
              }));

              console.log(
                "🔄 Manual mode: Setting vehicles",
                processedVehicles.length,
                "vehicles"
              );
              setVehicles(processedVehicles);
              cacheRef.current.vehicles = processedVehicles;
            }

            if (statsData) {
              const newStats = {
                total: statsData?.total || 0,
                online: statsData?.online || 0,
              };
              setStats(newStats);
              cacheRef.current.stats = newStats;
            }

            cacheRef.current.lastUpdate = Date.now();
          } catch (error) {
            console.error("Manual refresh failed:", error);
          }
        };

        // Darhol birinchi marta ma'lumot olish
        fetchManualData();

        // Intervalda davom etish
        const interval = setInterval(fetchManualData, 30000);
        setRefreshInterval(interval);
      }

      return newValue;
    });
  }, [refreshInterval]);

  // Haydovchi ma'lumotlarini yangilash (hozircha localStorage da saqlaymiz)
  const handleUpdateVehicleDriver = useCallback(
    async (vehicleId: number, driverData: any) => {
      try {
        console.log("🔄 Starting driver update process...", {
          vehicleId,
          driverData,
        });
        let driverId = driverData.id;

        // Agar driver ID yo'q bo'lsa, yangi driver yaratamiz
        if (!driverId) {
          console.log("📝 Creating new driver...");
          console.log("🚀 API Call: POST", `${API_BASE_URL}/drivers`);
          const createResponse = await axios.post(`${API_BASE_URL}/drivers`, {
            firstName: driverData.firstName,
            lastName: driverData.lastName,
            phoneNumber: driverData.phoneNumber,
            licenseNumber: driverData.licenseNumber,
            licenseCategory: driverData.licenseCategory,
            licenseExpiryDate:
              driverData.licenseExpiryDate ||
              new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // 1 yil keyingi sana
            experienceYears: String(driverData.experienceYears || 0),
            status: driverData.status || "active",
            email: driverData.email,
          });

          console.log(
            "� Create Response:",
            createResponse.status,
            createResponse.data
          );

          if (
            createResponse.status === 201 &&
            createResponse.data.status === "success"
          ) {
            driverId = createResponse.data.data.id;
            console.log("✅ Driver created with ID:", driverId);
          } else {
            throw new Error("Failed to create driver");
          }
        } else {
          // Mavjud haydovchi ma'lumotlarini yangilash
          console.log("📝 Updating existing driver with ID:", driverId);
          console.log(
            "🚀 API Call: PUT",
            `${API_BASE_URL}/drivers/${driverId}`
          );
          const updateResponse = await axios.put(
            `${API_BASE_URL}/drivers/${driverId}`,
            {
              firstName: driverData.firstName,
              lastName: driverData.lastName,
              phoneNumber: driverData.phoneNumber,
              licenseNumber: driverData.licenseNumber,
              licenseCategory: driverData.licenseCategory,
              licenseExpiryDate: driverData.licenseExpiryDate,
              experienceYears: String(driverData.experienceYears || 0),
              status: driverData.status || "active",
              email: driverData.email,
            }
          );
          console.log(
            "📊 Update Response:",
            updateResponse.status,
            updateResponse.data
          );
        }

        // Haydovchini vehiclega tayinlash
        console.log("🔗 Assigning driver to vehicle...");
        console.log(
          "🚀 API Call: POST",
          `${API_BASE_URL}/drivers/${driverId}/assign-vehicle/${vehicleId}`
        );
        const assignResponse = await axios.post(
          `${API_BASE_URL}/drivers/${driverId}/assign-vehicle/${vehicleId}`
        );

        console.log(
          "📊 Assign Response:",
          assignResponse.status,
          assignResponse.data
        );

        if (assignResponse.status === 200 || assignResponse.status === 201) {
          // Vehicles ro'yxatini yangilash
          setVehicles((prevVehicles) =>
            prevVehicles.map((vehicle) =>
              vehicle.id === vehicleId
                ? { ...vehicle, driver: { ...driverData, id: driverId } }
                : vehicle
            )
          );

          console.log("✅ Driver assigned successfully:", assignResponse.data);

          // LocalStorage'ga saqlash (backup sifatida)
          const storageKey = `vehicle_driver_${vehicleId}`;
          const fullDriverData = { ...driverData, id: driverId };
          localStorage.setItem(storageKey, JSON.stringify(fullDriverData));
          console.log(
            "💾 Saved driver data to localStorage as backup:",
            fullDriverData
          );

          // Success notification
          alert(
            `Ҳайдовчи муваффақиятли тайинланди!\n\nИсм: ${driverData.firstName} ${driverData.lastName}\nТелефон: ${driverData.phoneNumber}\nТранспорт ID: ${vehicleId}`
          );
        }
      } catch (error: any) {
        console.error("❌ Error updating driver data:", error);
        console.error(
          "❌ Error details:",
          error.response?.data || error.message
        );

        // Error notification
        alert(
          `Хатолик юз берди!\n\n${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    []
  );

  const fetchVehicles = useCallback(async () => {
    try {
      console.log("⚡ Smart loading strategy...");

      // INSTANT: Cache'dan ma'lumotlarni darhol ko'rsatish
      const cache = cacheRef.current;
      const now = Date.now();
      const CACHE_DURATION = 30000; // 30 soniya

      if (
        cache.vehicles &&
        cache.lastUpdate &&
        now - cache.lastUpdate < CACHE_DURATION
      ) {
        setVehicles(cache.vehicles);
        setStats(cache.stats || { total: 0, online: 0 });
        setLoading(false);
        console.log("⚡ Fresh cache used, no API call needed");
        return;
      }

      if (cache.vehicles) {
        setVehicles(cache.vehicles);
        setStats(cache.stats || { total: 0, online: 0 });
        setLoading(false);
        console.log("⚡ Stale cache used, refreshing in background...");
      }

      console.log("🔄 Loading fresh data from API...");

      // ⚡ ULTRA FAST: API calls with 1 second timeout
      const [vehiclesResponse, statsResponse] = await Promise.all([
        Promise.race([
          axios.get(`${API_BASE_URL}/api/vehicles/realtime`, { timeout: 1000 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Vehicles timeout")), 1000)
          ),
        ]),
        Promise.race([
          axios.get(`${API_BASE_URL}/api/vehicles/stats`, { timeout: 1000 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Stats timeout")), 1000)
          ),
        ]),
      ]);

      const vehiclesData = (vehiclesResponse as any).data?.success
        ? (vehiclesResponse as any).data.data
        : (vehiclesResponse as any).data;
      const statsData = (statsResponse as any).data?.success
        ? (statsResponse as any).data.data
        : (statsResponse as any).data;

      // ⚡ FASTEST: Direct state update without localStorage overhead
      if (vehiclesData) {
        const processedVehicles = vehiclesData.map((vehicle: any) => {
          // Use only fresh API data for maximum speed
          return {
            ...vehicle,
            // Ensure required fields exist
            position: vehicle.position || {
              latitude: 41.2995,
              longitude: 69.2401,
              speed: 0,
            },
            status: vehicle.status || { isOnline: false },
            sensors: vehicle.sensors || {},
          };
        });

        setVehicles(processedVehicles);
        cacheRef.current.vehicles = processedVehicles;
        console.log("✅ Fresh vehicles loaded");
      }

      if (statsData) {
        const newStats = {
          total: statsData?.total || 0,
          online: statsData?.online || 0,
        };
        setStats(newStats);
        cacheRef.current.stats = newStats;
        console.log("✅ Fresh stats loaded");
      }

      cacheRef.current.lastUpdate = Date.now();
      setLoading(false);

      // Markers will be updated by useEffect when vehicles state changes
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    }
  }, []); // No dependencies to avoid refresh loops

  // 🔥 MAIN EFFECT: Handle WebSocket data vs fallback with real-time toggle
  useEffect(() => {
    if (
      isConnected &&
      wsVehicles &&
      wsVehicles.length > 0 &&
      isRealTimeEnabled
    ) {
      // ✅ WebSocket is working and real-time enabled - use real-time data
      console.log(
        "🚀 REAL-TIME: Using WebSocket data:",
        wsVehicles.length,
        "vehicles"
      );
      setVehicles(wsVehicles);
      setStats({
        total: wsVehicles.length,
        online: wsVehicles.filter((v: any) => v.status?.isOnline).length,
      });
      setLoading(false);

      // Stop fallback polling since WebSocket is working
      if (fallbackIntervalRef.current) {
        console.log("🛑 WebSocket working - stopping fallback...");
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
        setFallbackMode(false);
      }

      // Stop manual refresh since WebSocket is active
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }

      // 🎯 Enable real-time position tracking
      enableRealTimeTracking();
    } else if (
      (connectionStatus === "connection_error" ||
        connectionStatus === "error") &&
      !isConnected &&
      !fallbackIntervalRef.current &&
      isRealTimeEnabled // Fallback faqat real-time enabled bo'lsa ishlasin
    ) {
      // ❌ WebSocket failed - start fallback polling (only if not already running)
      console.log("⚠️ WebSocket failed, starting REST API fallback...");
      setFallbackMode(true);

      fallbackIntervalRef.current = setInterval(async () => {
        try {
          console.log("📡 Fetching via REST API (fallback)...");
          const [vehiclesResponse, statsResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/vehicles/realtime`),
            axios.get(`${API_BASE_URL}/api/vehicles/stats`),
          ]);

          const vehiclesData = vehiclesResponse.data?.success
            ? vehiclesResponse.data.data
            : vehiclesResponse.data;
          const statsData = statsResponse.data?.success
            ? statsResponse.data.data
            : statsResponse.data;

          setVehicles(vehiclesData || []);
          setStats({
            total: statsData?.total || 0,
            online: statsData?.online || 0,
          });
        } catch (error) {
          console.error("❌ REST API fallback error:", error);
        }
      }, 10000); // Reduced to 10 seconds for more responsive fallback
    }
  }, [
    isConnected,
    wsVehicles,
    connectionStatus,
    enableRealTimeTracking,
    isRealTimeEnabled,
    refreshInterval,
  ]);

  // Map initialization (once only)
  useEffect(() => {
    const markers = markersRef.current;

    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style:
          "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6",
        center: [69.324, 41.299],
        zoom: 12,
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    }

    return () => {
      // Cleanup markers
      markers.forEach((marker: maplibregl.Marker) => marker.remove());
      markers.clear();

      // Cleanup fallback interval
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }

      // ⚡ Cleanup manual refresh interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [refreshInterval]); // Include refreshInterval for cleanup

  // ⚡ OPTIMIZED: Smart data fetching strategy
  useEffect(() => {
    // Fetch if manual mode or no WebSocket data and cache is empty or stale
    if (!isRealTimeEnabled || (!isConnected && !wsVehicles)) {
      const now = Date.now();
      const lastUpdate = cacheRef.current.lastUpdate || 0;

      // Fetch immediately if no cache, or after 2 minutes if stale
      if (!cacheRef.current.vehicles || now - lastUpdate > 120000) {
        console.log("🔄 Smart fetch triggered (Manual mode or no WebSocket)");
        fetchVehicles();
      }
    }
  }, [isConnected, wsVehicles, fetchVehicles, isRealTimeEnabled]);

  // Helper function to update marker styling
  const updateMarkerStyle = useCallback(
    (marker: maplibregl.Marker, vehicle: any, isActive: boolean) => {
      const markerElement = marker.getElement();
      if (markerElement) {
        const img = markerElement.querySelector("img");
        if (img) {
          let filter = vehicle.status.isOnline
            ? "hue-rotate(0deg) brightness(1)"
            : "grayscale(100%) brightness(0.7)";

          // Add active styling - make marker larger and add border
          if (isActive) {
            img.style.width = "50px";
            img.style.height = "50px";
            img.style.border = "3px solid #3B82F6"; // Blue border
            img.style.borderRadius = "50%";
            img.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.3)"; // Blue glow
            img.style.zIndex = "1000";
          } else {
            img.style.width = "40px";
            img.style.height = "40px";
            img.style.border = "none";
            img.style.borderRadius = "0";
            img.style.boxShadow = "none";
            img.style.zIndex = "auto";
          }

          img.style.filter = filter;
        }
      }
    },
    []
  );

  // ⚡ SUPER OPTIMIZED: Real-time marker updates (minimal DOM operations)
  useEffect(() => {
    if (vehicles.length === 0 || !map.current || !map.current.isStyleLoaded())
      return;

    // Debounce rapid updates
    const timeoutId = setTimeout(() => {
      vehicles.forEach((vehicle) => {
        if (vehicle.position?.latitude && vehicle.position?.longitude) {
          const existingMarker = markersRef.current.get(vehicle.id);

          if (existingMarker) {
            // 🎯 Smooth marker animation to new position
            const currentLngLat = existingMarker.getLngLat();
            const newLngLat = [
              vehicle.position.longitude,
              vehicle.position.latitude,
            ] as [number, number];

            // Calculate distance for smooth transition
            const distance = Math.sqrt(
              Math.pow(newLngLat[0] - currentLngLat.lng, 2) +
                Math.pow(newLngLat[1] - currentLngLat.lat, 2)
            );

            // Only animate if position actually changed significantly
            if (distance > 0.0001) {
              // ~11 meters
              console.log(
                `🚗 Vehicle ${vehicle.id} moving from`,
                currentLngLat,
                "to",
                newLngLat
              );

              // Smooth transition using MapLibre's flyTo
              existingMarker.setLngLat(newLngLat);
            }

            // Update marker styling including active state
            const isActive = activeVehicleId === vehicle.id;
            updateMarkerStyle(existingMarker, vehicle, isActive);
          } else {
            // Create new marker for new vehicle
            const el = document.createElement("div");
            el.innerHTML = `<img src="${
              vehicle.status.isOnline
                ? "/image/carmarker.png"
                : "/image/carmarker.png"
            }" 
                           style="width: 40px; height: 40px; cursor: pointer; 
                                  transition: all 0.3s ease;
                                  filter: ${
                                    vehicle.status.isOnline
                                      ? "hue-rotate(0deg) brightness(1)"
                                      : "grayscale(100%) brightness(0.7)"
                                  }" />`;

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([
                vehicle.position.longitude,
                vehicle.position.latitude,
              ])
              .addTo(map.current!);

            // Store vehicle ID on the marker element for later retrieval
            el.setAttribute("data-vehicle-id", vehicle.id.toString());

            // Apply active styling if this is the active vehicle
            const isActive = activeVehicleId === vehicle.id;
            updateMarkerStyle(marker, vehicle, isActive);

            el.addEventListener("click", (e) => {
              e.stopPropagation();

              console.log(`🔍 MARKER CLICKED for Vehicle ${vehicle.id}`);

              // ✅ SOLUTION: Get CURRENT position from the marker object itself
              // This is always up-to-date because marker position is updated in real-time
              const currentMarkerPosition = marker.getLngLat();

              console.log(`� Current marker position:`, {
                lat: currentMarkerPosition.lat,
                lng: currentMarkerPosition.lng,
              });

              // Use the focusOnVehicle function for consistency
              focusOnVehicle(vehicle.id);
            });

            markersRef.current.set(vehicle.id, marker);
            console.log(
              `🆕 New vehicle marker created for ${vehicle.name} (ID: ${vehicle.id})`
            );
          }
        }
      });

      // Remove markers for vehicles that no longer exist
      const currentVehicleIds = new Set(vehicles.map((v) => v.id));
      markersRef.current.forEach((marker, vehicleId) => {
        if (!currentVehicleIds.has(vehicleId)) {
          console.log(`🗑️ Removing marker for vehicle ${vehicleId}`);
          marker.remove();
          markersRef.current.delete(vehicleId);
        }
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [vehicles, activeVehicleId, updateMarkerStyle, focusOnVehicle]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="bg-white shadow-lg w-96 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Transport Monitoring
            </div>
            <div className="flex items-center gap-2">
              {/* Real-time Toggle Button */}
              <button
                onClick={toggleRealTime}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  isRealTimeEnabled
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={
                  isRealTimeEnabled
                    ? "Real-time yoqilgan (Click: o'chirish)"
                    : "Real-time o'chirilgan (Click: yoqish)"
                }
              >
                {isRealTimeEnabled ? (
                  <>
                    <Zap className="h-3 w-3" />
                    Real-time
                  </>
                ) : (
                  <>
                    <ZapOff className="h-3 w-3" />
                    Manual
                  </>
                )}
              </button>

              {/* Connection Status */}
              {isRealTimeEnabled ? (
                isConnected ? (
                  <div title="WebSocket Real-time Connected">
                    <Zap className="h-4 w-4 text-green-500" />
                  </div>
                ) : fallbackMode ? (
                  <div title="Using REST API Fallback">
                    <Wifi className="h-4 w-4 text-yellow-500" />
                  </div>
                ) : (
                  <div title="Disconnected">
                    <ZapOff className="h-4 w-4 text-red-500" />
                  </div>
                )
              ) : (
                <div title="Manual Mode - Updates every 30 seconds">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
              )}

              <span
                className={`text-xs px-2 py-1 rounded ${
                  !isRealTimeEnabled
                    ? "bg-blue-100 text-blue-800"
                    : isConnected
                    ? "bg-green-100 text-green-800"
                    : fallbackMode
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {!isRealTimeEnabled
                  ? "Manual (30s)"
                  : isConnected
                  ? "WebSocket Live"
                  : fallbackMode
                  ? "REST Fallback"
                  : "Offline"}
              </span>
              {wsError && (
                <div
                  title={wsError}
                  className="text-xs text-red-600 max-w-xs truncate"
                >
                  ({connectionStatus})
                </div>
              )}
            </div>
          </h2>
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Last update: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Jami{" "}
                    {!isRealTimeEnabled && (
                      <span className="text-xs">(Manual)</span>
                    )}
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {vehicles.length} / {stats.total}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Online</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.online}
                  </p>
                </div>
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {vehicles.map((vehicle: Vehicle) => {
                const isActive = activeVehicleId === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => focusOnVehicle(vehicle.id)} // ✅ Pass ID instead of object
                    className={`rounded-lg p-3 cursor-pointer border transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <h3 className="font-medium text-gray-800 text-sm">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          vehicle.status.isOnline
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs">
                        {vehicle.status.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Speed: {vehicle.position.speed} km/h
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-gray-700">
                  Ma'lumotlar yuklanmoqda...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Real-time tracking status */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  WebSocket Live
                </span>
              </>
            ) : fallbackMode ? (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm font-medium text-yellow-700">
                  REST Fallback (30s)
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-red-700">
                  Offline
                </span>
              </>
            )}
          </div>

          {/* Additional real-time info */}
          {isConnected && (
            <div className="text-xs text-gray-600 border-t pt-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span>WebSocket Real-time</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                <span>Real-time instant updates</span>
              </div>

              {/* Transport Management Button */}
              <button
                onClick={() => setIsTransportListOpen(true)}
                className="mt-2 w-full px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 transition-colors"
              >
                📋 Транспортлар бошқаруви
              </button>
            </div>
          )}

          {/* Connection info */}
          {!isConnected && (
            <div className="text-xs text-gray-600 border-t pt-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>WebSocket Disconnected</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Using REST API fallback</span>
              </div>
            </div>
          )}

          {lastUpdate && (
            <div className="text-xs text-gray-500 border-t pt-1">
              Last: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {selectedVehicle && (
        <VehicleDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          vehicle={selectedVehicle}
        />
      )}

      <TransportListModal
        isOpen={isTransportListOpen}
        onClose={() => setIsTransportListOpen(false)}
        vehicles={vehicles}
        onUpdateVehicle={handleUpdateVehicleDriver}
      />
    </div>
  );
};

export default VehicleTracking;
