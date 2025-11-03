import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface VehicleUpdateData {
  status: "success" | "no_data" | "error";
  vehicles?: any[];
  count?: number;
  timestamp?: string;
  message?: string;
  error?: string;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = "ws://localhost:8085/tracking",
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 2000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");

  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      console.log("🔌 Setting up WebSocket connection...");

      socketRef.current = io(url, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: reconnectAttempts,
        reconnectionDelay: reconnectDelay,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ WebSocket connected to TMK tracking server");
        setIsConnected(true);
        setConnectionStatus("connected");
        setError(null);
        setLastUpdate(new Date());

        // Auto-enable real-time tracking on connect
        setTimeout(() => {
          if (socketRef.current?.connected) {
            console.log("🎯 Auto-enabling real-time tracking...");
            socketRef.current.emit("enableRealTimeTracking", {
              interval: 1000, // 1 second updates
              includePosition: true,
              includeStatus: true,
              realTime: true,
            });
          }
        }, 1000);
      });

      socketRef.current.on("disconnect", (reason: string) => {
        console.log("❌ WebSocket disconnected:", reason);
        setIsConnected(false);
        setConnectionStatus("disconnected");
      });

      // Main event: Vehicle updates
      socketRef.current.on("vehicleUpdates", (data: VehicleUpdateData) => {
        console.log("🚛 Vehicle updates received:", data);

        if (data.status === "success" && data.vehicles) {
          setVehicles(data.vehicles);
          setLastUpdate(new Date(data.timestamp || Date.now()));
          setConnectionStatus("receiving_data");
          setError(null);
        } else if (data.status === "no_data") {
          setVehicles([]);
          setConnectionStatus("no_data");
          setError(
            data.message ||
              "Ma'lumot yo'q - Wialon API bilan bog'lanish muammosi"
          );
        } else if (data.status === "error") {
          setError(
            data.message || data.error || "WebSocket ma'lumot olishda xatolik"
          );
          setConnectionStatus("error");
        }
      });

      // Real-time vehicle updates (your snippet event)
      socketRef.current.on("realTimeVehicleUpdate", (data: any) => {
        console.log("⚡ realTimeVehicleUpdate received:", data);
        try {
          if (data && Array.isArray(data.vehicles)) {
            setVehicles(data.vehicles);
            setLastUpdate(new Date());
            setConnectionStatus("receiving_data");
            setError(null);
          } else if (data && typeof data.totalCount === "number") {
            setLastUpdate(new Date());
            setConnectionStatus("receiving_data");
          }
        } catch (e) {
          console.error("Error handling realTimeVehicleUpdate", e);
        }
      });

      // Status response for checkStatus
      socketRef.current.on("statusResponse", (status: any) => {
        console.log("🛈 statusResponse received:", status);
      });

      socketRef.current.on("connect_error", (error: any) => {
        console.error("❌ WebSocket connection error:", error);
        setError("Serverga ulanish xatoligi - REST API ga o'tildi");
        setConnectionStatus("connection_error");
      });

      socketRef.current.on("error", (error: any) => {
        console.error("❌ WebSocket error:", error);
        setError(`WebSocket xatolik: ${error.message || error}`);
      });
    } catch (error) {
      console.error("❌ WebSocket setup error:", error);
      setError(`Ulanish sozlashda xatolik: ${error}`);
      setConnectionStatus("setup_error");
    }
  }, [url, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Disconnecting WebSocket...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }
  }, []);

  // Request vehicle details
  const requestVehicleDetails = useCallback((vehicleId: number) => {
    if (socketRef.current?.connected) {
      console.log(`📋 Requesting details for vehicle ${vehicleId}`);
      socketRef.current.emit("requestVehicleDetails", { vehicleId });
    }
  }, []);

  // Sync vehicles
  const syncVehicles = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("🔄 Syncing vehicles...");
      socketRef.current.emit("syncVehicles");
    }
  }, []);

  // Enable real-time tracking
  const enableRealTimeTracking = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("⚡ Enabling real-time tracking...");
      socketRef.current.emit("enableRealTimeTracking", {
        interval: 1000,
        includePosition: true,
        includeStatus: true,
        realTime: true,
      });
    }
  }, []);

  // Disable real-time tracking
  const disableRealTimeTracking = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("⏹️ Disabling real-time tracking...");
      socketRef.current.emit("disableRealTimeTracking");
    }
  }, []);

  // Check status
  const checkStatus = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("🔍 Checking server status...");
      socketRef.current.emit("checkStatus");
    }
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, connect]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    error,
    lastUpdate,

    // Data
    vehicles,

    // Methods
    connect,
    disconnect,
    requestVehicleDetails,
    syncVehicles,
    enableRealTimeTracking,
    disableRealTimeTracking,
    checkStatus,
  };
};
