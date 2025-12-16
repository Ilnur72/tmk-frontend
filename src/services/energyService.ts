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
  PaginationParams,
  PaginatedResponse,
} from "../types/energy";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8085";

// Axios instance with auth header
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
apiClient.interceptors.request.use(
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

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("Authentication failed - clearing token");
      localStorage.removeItem("energyManagementAuthToken");

      // For general energy service, redirect to main auth
      // Check if we're in energy management context
      if (window.location.pathname.includes("/energy-management")) {
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

class EnergyService {
  // ===== TEST ENDPOINT =====
  async testConnection(): Promise<any> {
    const response = await apiClient.get("/energy/test");
    return response.data;
  }

  // ===== AUTHENTICATION ENDPOINTS =====

  // POST /energy/login - Operator login
  async operatorLogin(email: string, password: string): Promise<any> {
    const response = await axios.post(`${BASE_URL}/energy/login`, {
      email,
      password,
    });
    // Store token if provided
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  }

  // ===== ANALYSIS ENDPOINTS =====

  // GET /energy/analysis/today - Bugungi sarflar (barcha zavodlar)
  async getTodayConsumption(): Promise<any> {
    const response = await apiClient.get("/energy/analysis/today");
    return response.data;
  }

  // GET /energy/analysis/factory/{id}/comparison - Zavod taqqoslash (bugun vs kecha)
  async getFactoryComparison(factoryId: number): Promise<any> {
    const response = await apiClient.get(
      `/energy/analysis/factory/${factoryId}/comparison`
    );
    return response.data;
  }

  // GET /energy/analysis/factories-overview - Zavodlar umumiy ko'rinish
  async getFactoriesOverview(period?: number): Promise<any> {
    const params = period ? { period: period.toString() } : {};
    const response = await apiClient.get(
      "/energy/analysis/factories-overview",
      { params }
    );
    return response.data;
  }

  // GET /energy/analysis/top-consumers - Eng ko'p sarflovchilar
  async getTopConsumers(type?: string, period?: number): Promise<any> {
    const params: any = {};
    if (type) params.type = type;
    if (period) params.period = period.toString();
    const response = await apiClient.get("/energy/analysis/top-consumers", {
      params,
    });
    return response.data;
  }

  // ===== WORKSHOP ENDPOINTS - Backend da mavjud =====

  // POST /energy/workshops
  async createWorkshop(data: CreateWorkshopRequest): Promise<Workshop> {
    const response = await apiClient.post("/energy/workshops", data);
    return response.data;
  }

  // GET /energy/workshops/factory/:factoryId
  async getWorkshopsByFactory(factoryId: number): Promise<Workshop[]> {
    const response = await apiClient.get(
      `/energy/workshops/factory/${factoryId}`
    );
    return response.data;
  }

  // GET /energy/workshops
  async getAllWorkshops(): Promise<Workshop[]> {
    const response = await apiClient.get("/energy/workshops");
    return response.data;
  }

  // ===== METER ENDPOINTS - Backend da mavjud =====

  // POST /energy/meters
  async createMeter(data: CreateMeterRequest): Promise<Meter> {
    const response = await apiClient.post("/energy/meters", data);
    return response.data;
  }

  // GET /energy/meters/factory/:factoryId
  async getMetersByFactory(factoryId: number): Promise<Meter[]> {
    const response = await apiClient.get(`/energy/meters/factory/${factoryId}`);
    return response.data;
  }

  // GET /energy/meters/workshop/:workshopId
  async getMetersByWorkshop(workshopId: number): Promise<Meter[]> {
    const response = await apiClient.get(
      `/energy/meters/workshop/${workshopId}`
    );
    return response.data;
  }

  // GET /energy/meters/:meterId/details
  async getMeterDetails(meterId: number): Promise<Meter> {
    const response = await apiClient.get(`/energy/meters/${meterId}/details`);
    return response.data;
  }

  // GET /energy/meters
  async getAllMeters(): Promise<Meter[]> {
    const response = await apiClient.get("/energy/meters");
    return response.data;
  }

  // ===== METER READING ENDPOINTS - Backend da mavjud =====

  // POST /energy/readings
  async createMeterReading(
    data: CreateMeterReadingRequest
  ): Promise<MeterReading> {
    const response = await apiClient.post("/energy/readings", data);
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

    const response = await apiClient.get(
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
    const response = await apiClient.get("/energy/readings/unverified", {
      params,
    });
    return response.data;
  }

  // POST /energy/readings/:readingId/verify
  async verifyReading(readingId: number): Promise<MeterReading> {
    const response = await apiClient.post(
      `/energy/readings/${readingId}/verify`
    );
    return response.data;
  }

  // ===== REPORTS ENDPOINTS - Backend da mavjud =====

  // GET /energy/reports/daily
  async getDailyConsumption(factoryId: number, date: string): Promise<any> {
    const response = await apiClient.get("/energy/reports/daily", {
      params: { factoryId: factoryId.toString(), date },
    });
    return response.data;
  }

  // GET /energy/reports/monthly
  async getMonthlyConsumption(
    factoryId: number,
    year: number,
    month: number
  ): Promise<any> {
    const response = await apiClient.get("/energy/reports/monthly", {
      params: {
        factoryId: factoryId.toString(),
        year: year.toString(),
        month: month.toString(),
      },
    });
    return response.data;
  }

  // ===== METER OPERATOR ENDPOINTS - Backend da mavjud =====

  // POST /energy/meter-operators
  async createMeterOperator(
    data: CreateMeterOperatorRequest
  ): Promise<MeterOperator> {
    const response = await apiClient.post("/energy/meter-operators", data);
    return response.data;
  }

  // GET /energy/meter-operators
  async getMeterOperators(factoryId?: number): Promise<MeterOperator[]> {
    const params = factoryId ? { factoryId: factoryId.toString() } : {};
    const response = await apiClient.get("/energy/meter-operators", { params });
    return response.data;
  }

  // PUT /energy/meter-operators/:operatorId
  async updateMeterOperator(
    operatorId: number,
    data: UpdateMeterOperatorRequest
  ): Promise<MeterOperator> {
    const response = await apiClient.put(
      `/energy/meter-operators/${operatorId}`,
      data
    );
    return response.data;
  }

  // GET /energy/meter-operators/:operatorId/meters
  async getOperatorMeters(operatorId: number): Promise<Meter[]> {
    const response = await apiClient.get(
      `/energy/meter-operators/${operatorId}/meters`
    );
    return response.data;
  }

  // GET /energy/meter-operators/:operatorId/factory
  async getOperatorFactory(operatorId: number): Promise<any> {
    const response = await apiClient.get(
      `/energy/meter-operators/${operatorId}/factory`
    );
    return response.data;
  }

  // POST /energy/meter-operators/my-readings
  async createMyMeterReading(
    data: CreateMeterReadingRequest
  ): Promise<MeterReading> {
    const response = await apiClient.post(
      "/energy/meter-operators/my-readings",
      data
    );
    return response.data;
  }

  // GET /energy/meter-operators/my-meters
  async getMyMeters(): Promise<Meter[]> {
    const response = await apiClient.get("/energy/meter-operators/my-meters");
    return response.data;
  }

  // GET /energy/meter-operators/my-readings with pagination
  async getMyReadings(
    params?: PaginationParams
  ): Promise<PaginatedResponse<MeterReading>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/energy/meter-operators/my-readings?${queryParams.toString()}`
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

  // ===== COMPATIBILITY METHODS (Frontend componentlar uchun) =====

  // Workshop compatibility
  async getWorkshops(factoryId?: number): Promise<Workshop[]> {
    if (factoryId) {
      return this.getWorkshopsByFactory(factoryId);
    }
    return this.getAllWorkshops();
  }

  async getWorkshop(id: number): Promise<Workshop> {
    throw new Error("Get single workshop not implemented in backend yet");
  }

  async updateWorkshop(id: number, data: any): Promise<Workshop> {
    throw new Error("Update workshop not implemented in backend yet");
  }

  async deleteWorkshop(id: number): Promise<void> {
    const response = await apiClient.delete(`/energy/workshops/${id}`);
    return response.data;
  }

  // Meter compatibility
  async getMeters(filters?: any): Promise<Meter[]> {
    if (filters?.factory_id) {
      return this.getMetersByFactory(filters.factory_id);
    }
    return this.getAllMeters();
  }

  async getMeter(id: number): Promise<Meter> {
    return this.getMeterDetails(id);
  }

  async updateMeter(id: number, data: any): Promise<Meter> {
    throw new Error("Update meter not implemented in backend yet");
  }

  async deleteMeter(id: number): Promise<void> {
    const response = await apiClient.delete(`/energy/meters/${id}`);
    return response.data;
  }

  // Meter Reading compatibility with pagination
  async getAllMeterReadings(
    params?: PaginationParams
  ): Promise<PaginatedResponse<MeterReading>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiClient.get(
      `/energy/readings?${queryParams.toString()}`
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

  async getMeterReading(id: number): Promise<MeterReading> {
    throw new Error("Get single meter reading not implemented in backend yet");
  }

  async updateMeterReading(id: number, data: any): Promise<MeterReading> {
    throw new Error("Update meter reading not implemented in backend yet");
  }

  async deleteMeterReading(id: number): Promise<void> {
    throw new Error("Delete meter reading not implemented in backend yet");
  }

  async bulkCreateMeterReadings(
    data: CreateMeterReadingRequest[]
  ): Promise<MeterReading[]> {
    throw new Error(
      "Bulk create meter readings not implemented in backend yet"
    );
  }

  async verifyMeterReading(id: number): Promise<MeterReading> {
    return this.verifyReading(id);
  }

  // Meter Operator compatibility
  async getMeterOperator(id: number): Promise<MeterOperator> {
    throw new Error("Get single meter operator not implemented in backend yet");
  }

  async deleteMeterOperator(id: number): Promise<void> {
    throw new Error("Delete meter operator not implemented in backend yet");
  }

  // Dashboard data - Real API dan ma'lumot olish
  async getDashboardData(factoryId: number): Promise<any> {
    try {
      // Parallel ravishda bir nechta API dan ma'lumot olamiz
      const [todayData, factoryComparison] = await Promise.all([
        this.getTodayConsumption(),
        this.getFactoryComparison(factoryId),
      ]);

      // Real ma'lumotlarni dashboard formatiga o'tkazamiz
      return {
        factory_id: factoryId,
        factory_name: `Factory ${factoryId}`,
        today: {
          total_readings: todayData?.total_readings || 0,
          pending_readings: todayData?.pending_readings || 0,
          late_readings: todayData?.late_readings || 0,
        },
        current_month: {
          electricity: factoryComparison?.today?.electricity || 0,
          water: factoryComparison?.today?.water || 0,
          gas: factoryComparison?.today?.gas || 0,
        },
        previous_month: {
          electricity: factoryComparison?.yesterday?.electricity || 0,
          water: factoryComparison?.yesterday?.water || 0,
          gas: factoryComparison?.yesterday?.gas || 0,
        },
        growth_percentage: {
          electricity: factoryComparison?.growth_percentage?.electricity || 0,
          water: factoryComparison?.growth_percentage?.water || 0,
          gas: factoryComparison?.growth_percentage?.gas || 0,
        },
        recent_alerts: todayData?.alerts || [],
        unverified_readings_count: todayData?.unverified_count || 0,
        total_meters: todayData?.total_meters || 0,
        active_operators: todayData?.active_operators || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to mock data if API fails
      return {
        factory_id: factoryId,
        factory_name: `Factory ${factoryId}`,
        today: { total_readings: 0, pending_readings: 0, late_readings: 0 },
        current_month: { electricity: 0, water: 0, gas: 0 },
        previous_month: { electricity: 0, water: 0, gas: 0 },
        growth_percentage: { electricity: 0, water: 0, gas: 0 },
        recent_alerts: [],
        unverified_readings_count: 0,
        total_meters: 0,
        active_operators: 0,
      };
    }
  }
}

export const energyService = new EnergyService();
