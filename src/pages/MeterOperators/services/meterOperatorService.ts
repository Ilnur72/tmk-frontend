import axios from "axios";
import {
  Meter,
  MeterReading,
  CreateMeterReadingRequest,
  User,
  PaginationParams,
  PaginatedResponse,
} from "../../../types/energy";
import { API_URL } from "../../../config/const";

const BASE_URL = API_URL;

// Separate axios instance for meter operators
const meterOperatorClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor for meter operators only
meterOperatorClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("meterOperatorAuthToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage!");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
meterOperatorClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("Meter operator authentication failed - clearing token");
      // localStorage.removeItem("meterOperatorAuthToken");

      // Redirect to login page by reloading
      // window.location.reload();
    }

    return Promise.reject(error);
  }
);

class MeterOperatorService {
  // ===== AUTHENTICATION =====

  // POST /energy/login - Meter operator login with JWT
  async login(email: string, password: string): Promise<User> {
    const response = await axios.post(`${BASE_URL}/energy/login`, {
      email,
      password,
    });

    // Store JWT access token
    if (response.data.access_token) {
      localStorage.setItem(
        "meterOperatorAuthToken",
        response.data.access_token
      );
    } else {
      console.error("No access_token in response!");
    }

    // Return operator data
    return response.data.operator;
  }

  // Logout
  async logout(): Promise<void> {
    localStorage.removeItem("meterOperatorAuthToken");
    localStorage.removeItem("meterOperatorToken");
  }

  // ===== METER OPERATOR SPECIFIC ENDPOINTS =====

  // GET /energy/meter-operators/my-meters?factoryId=xxx
  async getMyMeters(factoryId?: number): Promise<Meter[]> {
    let url = "/energy/meter-operators/my-meters";
    if (factoryId) {
      url += `?factoryId=${factoryId}`;
    }
    const response = await meterOperatorClient.get(url);
    return response.data;
  }

  // Backend da GET my-readings API si yo'q, shuning uchun readings endpoint dan foydalanish
  async getMyReadings(
    params?: PaginationParams
  ): Promise<PaginatedResponse<MeterReading>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    // Umumiy readings API dan foydalanish
    const response = await meterOperatorClient.get(
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

  // POST /energy/meter-operators/my-readings
  async createMyMeterReading(
    data: CreateMeterReadingRequest
  ): Promise<MeterReading> {
    const response = await meterOperatorClient.post(
      "/energy/meter-operators/my-readings",
      data
    );
    return response.data;
  }

  // Profile API mavjud emas, shuning uchun localStorage dan foydalanish

  // ===== TEST CONNECTION =====
  async testConnection(): Promise<any> {
    const response = await meterOperatorClient.get("/energy/test");
    return response.data;
  }
}

export const meterOperatorService = new MeterOperatorService();
