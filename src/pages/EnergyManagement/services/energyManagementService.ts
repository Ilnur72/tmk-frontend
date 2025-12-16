import axios from "axios";
import {
  Workshop,
  Meter,
  MeterReading,
  MeterOperator,
  CreateWorkshopRequest,
  CreateMeterRequest,
  CreateMeterReadingRequest,
  CreateMeterOperatorRequest,
  UpdateMeterOperatorRequest,
  User,
  PaginationParams,
  PaginatedResponse,
} from "../../../types/energy";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8085";

// Separate axios instance for energy management
const energyManagementClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor for energy management
energyManagementClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("energyManagementAuthToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
energyManagementClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only remove token on actual authentication errors, not on missing endpoints
    if (error.response?.status === 401) {
      console.warn("Authentication failed - clearing token");
      localStorage.removeItem("energyManagementAuthToken");

      // Redirect to login page by reloading the page
      // This will trigger the authentication check in the component
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

class EnergyManagementService {
  constructor() {
    // Monitor localStorage changes
    this.monitorTokenChanges();
  }

  // Monitor token changes in localStorage
  private monitorTokenChanges() {
    // Token monitoring disabled for cleaner console
  }

  // ===== AUTHENTICATION =====

  // POST /energy/login - Admin login for energy management with JWT
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${BASE_URL}/energy/login`, {
        email,
        password,
      });

      // Store JWT access token
      if (response.data.access_token) {
        localStorage.setItem(
          "energyManagementAuthToken",
          response.data.access_token
        );
      }

      // Return operator/admin data
      return response.data.operator;
    } catch (error: any) {
      console.error("❌ Login failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    localStorage.removeItem("energyManagementAuthToken");
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem("energyManagementAuthToken");
    return !!token;
  }

  // Get current token
  getCurrentToken(): string | null {
    return localStorage.getItem("energyManagementAuthToken");
  }

  // ===== WORKSHOP MANAGEMENT =====

  // POST /energy/workshops
  async createWorkshop(data: CreateWorkshopRequest): Promise<Workshop> {
    const response = await energyManagementClient.post(
      "/energy/workshops",
      data
    );
    return response.data;
  }

  // GET /energy/workshops/factory/:factoryId
  async getWorkshopsByFactory(factoryId: number): Promise<Workshop[]> {
    const response = await energyManagementClient.get(
      `/energy/workshops/factory/${factoryId}`
    );
    return response.data;
  }

  // PUT /energy/workshops/:workshopId
  async updateWorkshop(id: number, data: any): Promise<Workshop> {
    const response = await energyManagementClient.put(
      `/energy/workshops/${id}`,
      data
    );
    return response.data;
  }

  // DELETE /energy/workshops/:workshopId
  async deleteWorkshop(id: number): Promise<void> {
    await energyManagementClient.delete(`/energy/workshops/${id}`);
  }

  // ===== METER MANAGEMENT =====

  // POST /energy/meters
  async createMeter(data: CreateMeterRequest): Promise<Meter> {
    const response = await energyManagementClient.post("/energy/meters", data);
    return response.data;
  }

  // GET /energy/meters/factory/:factoryId
  async getMetersByFactory(factoryId: number): Promise<Meter[]> {
    const response = await energyManagementClient.get(
      `/energy/meters/factory/${factoryId}`
    );
    return response.data;
  }

  // GET /energy/meters/workshop/:workshopId
  async getMetersByWorkshop(workshopId: number): Promise<Meter[]> {
    const response = await energyManagementClient.get(
      `/energy/meters/workshop/${workshopId}`
    );
    return response.data;
  }

  // PUT /energy/meters/:meterId
  async updateMeter(id: number, data: any): Promise<Meter> {
    const response = await energyManagementClient.put(
      `/energy/meters/${id}`,
      data
    );
    return response.data;
  }

  // DELETE /energy/meters/:meterId
  async deleteMeter(id: number): Promise<void> {
    await energyManagementClient.delete(`/energy/meters/${id}`);
  }

  // ===== READING MANAGEMENT =====

  // POST /energy/readings
  async createMeterReading(
    data: CreateMeterReadingRequest
  ): Promise<MeterReading> {
    const response = await energyManagementClient.post(
      "/energy/readings",
      data
    );
    return response.data;
  }

  // GET /energy/readings/meter/:meterId with pagination
  async getMeterReadings(
    meterId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<MeterReading>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await energyManagementClient.get(
      `/energy/readings/meter/${meterId}?${queryParams.toString()}`
    );

    // If backend doesn't support pagination format, create fallback
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: response.data.length,
          items_per_page: response.data.length,
          has_next: false,
          has_prev: false,
        },
      };
    }

    return response.data;
  }

  // GET /energy/readings/unverified
  async getUnverifiedReadings(factoryId?: number): Promise<MeterReading[]> {
    const params = factoryId ? { factoryId: factoryId.toString() } : {};
    const response = await energyManagementClient.get(
      "/energy/readings/unverified",
      { params }
    );
    return response.data;
  }

  // POST /energy/readings/:readingId/verify
  async verifyReading(readingId: number): Promise<MeterReading> {
    const response = await energyManagementClient.post(
      `/energy/readings/${readingId}/verify`
    );
    return response.data;
  }

  // PUT /energy/readings/:readingId
  async updateMeterReading(id: number, data: any): Promise<MeterReading> {
    const response = await energyManagementClient.put(
      `/energy/readings/${id}`,
      data
    );
    return response.data;
  }

  // DELETE /energy/readings/:readingId
  async deleteMeterReading(id: number): Promise<void> {
    await energyManagementClient.delete(`/energy/readings/${id}`);
  }

  // GET /energy/meters - Get all meters for factory (using existing endpoint)
  async getAllMeters(factoryId: number): Promise<Meter[]> {
    try {
      // Try factory-specific endpoint first
      const response = await energyManagementClient.get(
        `/energy/meters/factory/${factoryId}`
      );
      return response.data;
    } catch (error) {
      // Fallback to general meters endpoint and filter by factory
      try {
        const response = await energyManagementClient.get("/energy/meters");
        const allMeters = response.data;
        // Filter by factory_id if needed
        return Array.isArray(allMeters)
          ? allMeters.filter((meter) => meter.factory_id === factoryId)
          : [];
      } catch (fallbackError) {
        return [];
      }
    }
  }

  // GET /energy/readings - Get all readings for factory
  async getAllReadings(
    factoryId: number
  ): Promise<PaginatedResponse<MeterReading>> {
    try {
      // Try multiple endpoints to get all readings
      let response;
      try {
        // First try: get all readings with factoryId parameter
        response = await energyManagementClient.get("/energy/readings", {
          params: { factoryId: factoryId.toString() },
        });
      } catch (error1: any) {
        try {
          // Second try: get all readings without parameters
          response = await energyManagementClient.get("/energy/readings");
        } catch (error2: any) {
          // Third try: fallback to unverified endpoint
          console.warn("Falling back to unverified readings endpoint");
          response = await energyManagementClient.get(
            "/energy/readings/unverified",
            {
              params: { factoryId: factoryId.toString() },
            }
          );
        }
      }

      // If backend doesn't support pagination format, create fallback
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: response.data.length,
            items_per_page: response.data.length,
            has_next: false,
            has_prev: false,
          },
        };
      }

      return response.data;
    } catch (error) {
      // Fallback: get all meters and their readings
      const meters = await this.getAllMeters(factoryId);
      let allReadings: MeterReading[] = [];

      for (const meter of meters) {
        try {
          const meterReadings = await this.getMeterReadings(meter.id);
          allReadings = [...allReadings, ...meterReadings.data];
        } catch (error) {
          // Skip meters without readings
        }
      }

      return {
        data: allReadings,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: allReadings.length,
          items_per_page: allReadings.length,
          has_next: false,
          has_prev: false,
        },
      };
    }
  }

  // ===== OPERATOR MANAGEMENT =====

  // POST /energy/meter-operators
  async createMeterOperator(
    data: CreateMeterOperatorRequest
  ): Promise<MeterOperator> {
    const response = await energyManagementClient.post(
      "/energy/meter-operators",
      data
    );
    return response.data;
  }

  // GET /energy/meter-operators
  async getMeterOperators(factoryId?: number): Promise<MeterOperator[]> {
    const params = factoryId ? { factoryId: factoryId.toString() } : {};
    const response = await energyManagementClient.get(
      "/energy/meter-operators",
      { params }
    );
    return response.data;
  }

  // PUT /energy/meter-operators/:operatorId
  async updateMeterOperator(
    operatorId: number,
    data: UpdateMeterOperatorRequest
  ): Promise<MeterOperator> {
    const response = await energyManagementClient.put(
      `/energy/meter-operators/${operatorId}`,
      data
    );
    return response.data;
  }

  // DELETE /energy/meter-operators/:operatorId
  async deleteMeterOperator(id: number): Promise<void> {
    await energyManagementClient.delete(`/energy/meter-operators/${id}`);
  }

  // ===== TEST CONNECTION =====
  async testConnection(): Promise<any> {
    const response = await energyManagementClient.get("/energy/test");
    return response.data;
  }

  // Test authentication
  async testAuth(): Promise<any> {
    const response = await energyManagementClient.get("/energy/auth/test");
    return response.data;
  }

  // Debug current state
  debugAuthState(): void {
    const token = this.getCurrentToken();
    console.log("🔍 Auth Debug Info:", {
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + "..." : null,
      baseURL: BASE_URL,
    });
  }
}

export const energyManagementService = new EnergyManagementService();
