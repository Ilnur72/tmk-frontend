import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import axios from "axios";
import { Activity, Wifi, Zap, ZapOff, ChevronLeft, ChevronRight } from "lucide-react";
import VehicleDetailModal from "./VehicleDetailModal";
import TransportListModal from "./TransportListModal";
import { API_URL } from "../../config/const";

const API_BASE_URL = API_URL;

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
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<number, maplibregl.Marker>>(new Map());
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats>({ total: 0, online: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [activeVehicleId, setActiveVehicleId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransportListOpen, setIsTransportListOpen] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

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

        map.current.flyTo({
          center: [markerPosition.lng, markerPosition.lat],
          zoom: 16,
          duration: 1500,
        });
      } else {
        // Fallback to vehicle data from state
        const vehicle = vehicles.find((v: any) => v.id === vehicleId);
        if (vehicle?.position) {
          map.current.flyTo({
            center: [vehicle.position.longitude, vehicle.position.latitude],
            zoom: 16,
            duration: 1500,
          });
        }
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
    [vehicles]
  );

  // Real-time yoqish/o'chirish
  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled((prev) => !prev);
  }, []);

  // Haydovchi ma'lumotlarini yangilash (hozircha localStorage da saqlaymiz)
  const handleUpdateVehicleDriver = useCallback(
    async (vehicleId: number, driverData: any) => {
      try {
        let driverId = driverData.id;

        // Agar driver ID yo'q bo'lsa, yangi driver yaratamiz
        if (!driverId) {
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

          if (
            createResponse.status === 201 &&
            createResponse.data.status === "success"
          ) {
            driverId = createResponse.data.data.id;
          } else {
            throw new Error("Failed to create driver");
          }
        } else {
          // Mavjud haydovchi ma'lumotlarini yangilash

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
        }

        const assignResponse = await axios.post(
          `${API_BASE_URL}/drivers/${driverId}/assign-vehicle/${vehicleId}`
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

          // LocalStorage'ga saqlash (backup sifatida)
          const storageKey = `vehicle_driver_${vehicleId}`;
          const fullDriverData = { ...driverData, id: driverId };
          localStorage.setItem(storageKey, JSON.stringify(fullDriverData));

          // Success notification
          alert(
            `${t("vehicle_tracking.driver_assigned_success")}\n\n${t(
              "vehicle_tracking.name"
            )}: ${driverData.firstName} ${driverData.lastName}\n${t(
              "vehicle_tracking.phone"
            )}: ${driverData.phoneNumber}\n${t(
              "vehicle_tracking.transport_id"
            )}: ${vehicleId}`
          );
        }
      } catch (error: any) {
        // Error notification
        alert(
          `${t("vehicle_tracking.error_occurred")}\n\n${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [t]
  );

  const fetchVehicles = useCallback(async () => {
    try {
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
        return;
      }

      if (cache.vehicles) {
        setVehicles(cache.vehicles);
        setStats(cache.stats || { total: 0, online: 0 });
        setLoading(false);
      }

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
      setLoading(false);

      // Markers will be updated by useEffect when vehicles state changes
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    }
  }, []); // No dependencies to avoid refresh loops

  // 🔁 REST API polling — har 5 soniyada yangilanib turadi
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const poll = async () => {
      try {
        const [vehiclesResponse, statsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/vehicles/realtime`, { timeout: 5000 }),
          axios.get(`${API_BASE_URL}/api/vehicles/stats`, { timeout: 5000 }),
        ]);

        const vehiclesData = vehiclesResponse.data?.success
          ? vehiclesResponse.data.data
          : vehiclesResponse.data;
        const statsData = statsResponse.data?.success
          ? statsResponse.data.data
          : statsResponse.data;

        if (vehiclesData) {
          const processed = vehiclesData.map((v: any) => ({
            ...v,
            position: v.position || { latitude: 41.2995, longitude: 69.2401, speed: 0 },
            status: v.status || { isOnline: false },
            sensors: v.sensors || {},
          }));
          setVehicles(processed);
          cacheRef.current.vehicles = processed;
        }
        if (statsData) {
          const s = { total: statsData?.total || 0, online: statsData?.online || 0 };
          setStats(s);
          cacheRef.current.stats = s;
        }
        setLastUpdate(new Date());
        cacheRef.current.lastUpdate = Date.now();
        setLoading(false);
      } catch (err) {
        console.error("Polling error:", err);
        setLoading(false);
      }
    };

    poll(); // darhol birinchi marta
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

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

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // no refreshInterval dependency needed

  // Manual mode: bir marta fetch qilish
  useEffect(() => {
    if (!isRealTimeEnabled) {
      fetchVehicles();
    }
  }, [isRealTimeEnabled, fetchVehicles]);

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

              // ✅ SOLUTION: Get CURRENT position from the marker object itself
              // This is always up-to-date because marker position is updated in real-time
              const currentMarkerPosition = marker.getLngLat();

              // Use the focusOnVehicle function for consistency
              focusOnVehicle(vehicle.id);
            });

            markersRef.current.set(vehicle.id, marker);
          }
        }
      });

      // Remove markers for vehicles that no longer exist
      const currentVehicleIds = new Set(vehicles.map((v) => v.id));
      markersRef.current.forEach((marker, vehicleId) => {
        if (!currentVehicleIds.has(vehicleId)) {
          marker.remove();
          markersRef.current.delete(vehicleId);
        }
      });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [vehicles, activeVehicleId, updateMarkerStyle, focusOnVehicle]);

  return (
    <div className="flex h-[calc(100vh-45px)] md:h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`relative bg-white shadow-lg flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarOpen ? "w-72 md:w-80" : "w-0 overflow-hidden"
        }`}
      >
        {/* Header */}
        <div className="px-2 py-1.5 border-b border-gray-200 min-w-[288px] md:min-w-[320px]">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <Activity className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-800 truncate">{t("vehicle_tracking.title")}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {lastUpdate && (
                <span className="text-[9px] text-gray-400">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={toggleRealTime}
                className={`flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  isRealTimeEnabled
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isRealTimeEnabled ? <Zap className="h-2.5 w-2.5" /> : <ZapOff className="h-2.5 w-2.5" />}
              </button>
            </div>
          </div>

          {/* Stats compact row */}
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-1 bg-blue-50 rounded px-2 py-1 flex-1">
              <Activity className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="text-[10px] text-blue-600">{t("vehicle_tracking.total")}:</span>
              <span className="text-xs font-bold text-blue-700">{vehicles.length}/{stats.total}</span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 rounded px-2 py-1 flex-1">
              <Wifi className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span className="text-[10px] text-green-600">{t("vehicle_tracking.online")}:</span>
              <span className="text-xs font-bold text-green-700">{stats.online}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar min-w-[288px] md:min-w-[320px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1.5 p-2">
              {vehicles.map((vehicle: Vehicle) => {
                const isActive = activeVehicleId === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => focusOnVehicle(vehicle.id)}
                    className={`rounded-lg p-2 cursor-pointer border transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <h3 className="font-medium text-gray-800 text-xs">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          vehicle.status.isOnline
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-[10px]">
                        {vehicle.status.isOnline
                          ? t("vehicle_tracking.online")
                          : t("vehicle_tracking.offline")}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-auto">
                        {vehicle.position.speed} km/h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative min-w-0">
        {/* Sidebar toggle button */}
        <button
          onClick={() => setIsSidebarOpen((v) => !v)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-gray-200 rounded-r-lg p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title={isSidebarOpen ? "Yopish" : "Ochish"}
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div ref={mapContainer} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-gray-700">
                  {t("vehicle_tracking.loading_data")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Transport Management Button - desktop only */}
        <div className="absolute top-4 left-4 hidden md:block">
          <button
            onClick={() => setIsTransportListOpen(true)}
            className="px-3 py-2 text-sm bg-white hover:bg-gray-50 text-blue-700 rounded-lg border border-blue-300 shadow-md transition-colors"
          >
            📋 {t("vehicle_tracking.transport_management")}
          </button>
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
