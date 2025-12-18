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
import { API_URL } from "../../../config/const";

const BASE_URL = API_URL;
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

  // GET verified readings - using main API with filter
  async getVerifiedReadings(
    factoryId: number,
    params?: { page?: number; limit?: number; meterId?: number }
  ): Promise<PaginatedResponse<MeterReading>> {
    return this.getAllReadings(factoryId, {
      ...params,
      verified: true,
    });
  }

  // GET unverified readings - using main API with filter
  async getUnverifiedReadings(
    factoryId: number,
    params?: { page?: number; limit?: number; meterId?: number }
  ): Promise<PaginatedResponse<MeterReading>> {
    return this.getAllReadings(factoryId, {
      ...params,
      verified: false,
    });
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
  async getAllMeters(factoryId?: number | null): Promise<Meter[]> {
    try {
      if (factoryId) {
        // Factory-specific request
        const response = await energyManagementClient.get(
          `/energy/meters/factory/${factoryId}`
        );
        return response.data;
      } else {
        // Admin access - get all meters
        const response = await energyManagementClient.get("/energy/meters");
        return response.data;
      }
    } catch (error) {
      // Fallback to general meters endpoint and filter by factory
      try {
        const response = await energyManagementClient.get("/energy/meters");
        const allMeters = response.data;
        // Filter by factory_id if needed
        if (factoryId) {
          return Array.isArray(allMeters)
            ? allMeters.filter((meter) => meter.factory_id === factoryId)
            : [];
        }
        return Array.isArray(allMeters) ? allMeters : [];
      } catch (fallbackError) {
        return [];
      }
    }
  }

  // GET /energy/readings - Get all readings for factory with filters
  async getAllReadings(
    factoryId?: number | null,
    filters?: {
      verified?: boolean;
      meterId?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<MeterReading>> {
    try {
      const params: any = {};

      // Add factoryId filter only if provided (admin access may not need it)
      if (factoryId) {
        params.factoryId = factoryId.toString();
      }

      // Add filters if provided
      if (filters?.verified !== undefined) {
        params.verified = filters.verified.toString();
      }
      if (filters?.meterId) {
        params.meterId = filters.meterId.toString();
      }
      if (filters?.page) {
        params.page = filters.page.toString();
      }
      if (filters?.limit) {
        params.limit = filters.limit.toString();
      }

      const response = await energyManagementClient.get("/energy/readings", {
        params,
      });

      // Check for new API format: {data, total, page, limit, filters}
      if (
        response.data &&
        typeof response.data === "object" &&
        response.data.data
      ) {
        return {
          data: response.data.data,
          pagination: {
            current_page: response.data.page || 1,
            total_pages: Math.ceil(
              (response.data.total || 0) / (response.data.limit || 20)
            ),
            total_items: response.data.total || 0,
            items_per_page: response.data.limit || 20,
            has_next:
              (response.data.page || 1) <
              Math.ceil(
                (response.data.total || 0) / (response.data.limit || 20)
              ),
            has_prev: (response.data.page || 1) > 1,
          },
        };
      }

      // Fallback: if backend returns array format
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
    } catch (error: any) {
      // Fallback: get all meters and their readings
      try {
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
      } catch (fallbackError) {
        return {
          data: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            items_per_page: 20,
            has_next: false,
            has_prev: false,
          },
        };
      }
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
    // Debug logs removed for production
  }
}

export const energyManagementService = new EnergyManagementService();
