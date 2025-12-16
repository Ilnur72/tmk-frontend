import axios from 'axios';
import { 
  Workshop, 
  Meter, 
  MeterReading, 
  MeterOperator,
  CreateWorkshopRequest,
  CreateMeterRequest,
  CreateMeterReadingRequest,
  CreateMeterOperatorRequest,
  UpdateMeterOperatorRequest
} from '../types/energy';
import { API_URL } from '../config/const';

const BASE_URL = API_URL || 'http://localhost:8085';

// Axios instance with auth header
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class EnergyService {
  // ===== TEST ENDPOINT =====
  async testConnection(): Promise<any> {
    const response = await apiClient.get('/energy/test');
    return response.data;
  }

  // ===== WORKSHOP ENDPOINTS =====
  
  // POST /energy/workshops - Yaratish (admin/editor)
  async createWorkshop(data: CreateWorkshopRequest): Promise<Workshop> {
    const response = await apiClient.post('/energy/workshops', data);
    return response.data;
  }

  // GET /energy/workshops/factory/:factoryId - Factory bo'yicha workshops
  async getWorkshopsByFactory(factoryId: number): Promise<Workshop[]> {
    const response = await apiClient.get(`/energy/workshops/factory/${factoryId}`);
    return response.data;
  }

  // GET /energy/workshops - Barcha workshops
  async getAllWorkshops(): Promise<Workshop[]> {
    const response = await apiClient.get('/energy/workshops');
    return response.data;
  }

  // ===== METER ENDPOINTS =====

  // POST /energy/meters - Yaratish (admin/editor)
  async createMeter(data: CreateMeterRequest): Promise<Meter> {
    const response = await apiClient.post('/energy/meters', data);
    return response.data;
  }

  // GET /energy/meters/factory/:factoryId - Factory bo'yicha meterlar
  async getMetersByFactory(factoryId: number): Promise<Meter[]> {
    const response = await apiClient.get(`/energy/meters/factory/${factoryId}`);
    return response.data;
  }

  // GET /energy/meters/workshop/:workshopId - Workshop bo'yicha meterlar
  async getMetersByWorkshop(workshopId: number): Promise<Meter[]> {
    const response = await apiClient.get(`/energy/meters/workshop/${workshopId}`);
    return response.data;
  }

  // GET /energy/meters/:meterId/details - Meter detallari
  async getMeterDetails(meterId: number): Promise<Meter> {
    const response = await apiClient.get(`/energy/meters/${meterId}/details`);
    return response.data;
  }

  // GET /energy/meters - Barcha meterlar
  async getAllMeters(): Promise<Meter[]> {
    const response = await apiClient.get('/energy/meters');
    return response.data;
  }

  // ===== METER READING ENDPOINTS =====

  // POST /energy/readings - Meter reading yaratish
  async createMeterReading(data: CreateMeterReadingRequest): Promise<MeterReading> {
    const response = await apiClient.post('/energy/readings', data);
    return response.data;
  }

  // GET /energy/readings/meter/:meterId - Meter bo'yicha readinglar
  async getMeterReadings(meterId: number): Promise<MeterReading[]> {
    const response = await apiClient.get(`/energy/readings/meter/${meterId}`);
    return response.data;
  }

  // GET /energy/readings/unverified - Tasdiqlanmagan readinglar
  async getUnverifiedReadings(factoryId?: number): Promise<MeterReading[]> {
    const params = factoryId ? { factoryId: factoryId.toString() } : {};
    const response = await apiClient.get('/energy/readings/unverified', { params });
    return response.data;
  }

  // POST /energy/readings/:readingId/verify - Reading tasdiqlash
  async verifyReading(readingId: number): Promise<MeterReading> {
    const response = await apiClient.post(`/energy/readings/${readingId}/verify`);
    return response.data;
  }

  // ===== REPORTS ENDPOINTS =====

  // GET /energy/reports/daily - Kunlik hisobot
  async getDailyConsumption(factoryId: number, date: string): Promise<any> {
    const response = await apiClient.get('/energy/reports/daily', {
      params: { factoryId: factoryId.toString(), date }
    });
    return response.data;
  }

  // GET /energy/reports/monthly - Oylik hisobot
  async getMonthlyConsumption(factoryId: number, year: number, month: number): Promise<any> {
    const response = await apiClient.get('/energy/reports/monthly', {
      params: { 
        factoryId: factoryId.toString(), 
        year: year.toString(), 
        month: month.toString() 
      }
    });
    return response.data;
  }

  // ===== METER OPERATOR ENDPOINTS =====

  // POST /energy/meter-operators - Operator yaratish (admin)
  async createMeterOperator(data: CreateMeterOperatorRequest): Promise<MeterOperator> {
    const response = await apiClient.post('/energy/meter-operators', data);
    return response.data;
  }

  // GET /energy/meter-operators - Operatorlar ro'yxati
  async getMeterOperators(factoryId?: number): Promise<MeterOperator[]> {
    const params = factoryId ? { factoryId: factoryId.toString() } : {};
    const response = await apiClient.get('/energy/meter-operators', { params });
    return response.data;
  }

  // PUT /energy/meter-operators/:operatorId - Operator yangilash
  async updateMeterOperator(operatorId: number, data: UpdateMeterOperatorRequest): Promise<MeterOperator> {
    const response = await apiClient.put(`/energy/meter-operators/${operatorId}`, data);
    return response.data;
  }

  // GET /energy/meter-operators/:operatorId/meters - Operator meterlari
  async getOperatorMeters(operatorId: number): Promise<Meter[]> {
    const response = await apiClient.get(`/energy/meter-operators/${operatorId}/meters`);
    return response.data;
  }

  // GET /energy/meter-operators/:operatorId/factory - Operator factory ma'lumotlari  
  async getOperatorFactory(operatorId: number): Promise<any> {
    const response = await apiClient.get(`/energy/meter-operators/${operatorId}/factory`);
    return response.data;
  }

  // ===== OPERATOR SPECIFIC ENDPOINTS (Authenticated) =====

  // POST /energy/meter-operators/my-readings - O'z readingini kiritish
  async createMyMeterReading(data: CreateMeterReadingRequest): Promise<MeterReading> {
    const response = await apiClient.post('/energy/meter-operators/my-readings', data);
    return response.data;
  }

  // GET /energy/meter-operators/my-meters - O'z meterlarini olish
  async getMyMeters(): Promise<Meter[]> {
    const response = await apiClient.get('/energy/meter-operators/my-meters');
    return response.data;
  }

  // ===== COMPATIBILITY METHODS FOR EXISTING COMPONENTS =====

  // Workshop compatibility methods
  async getWorkshops(factoryId?: number): Promise<Workshop[]> {
    if (factoryId) {
      return this.getWorkshopsByFactory(factoryId);
    }
    return this.getAllWorkshops();
  }

  async updateWorkshop(id: number, data: any): Promise<Workshop> {
    throw new Error('Update workshop not implemented in backend yet');
  }

  async deleteWorkshop(id: number): Promise<void> {
    throw new Error('Delete workshop not implemented in backend yet');
  }

  async getWorkshop(id: number): Promise<Workshop> {
    throw new Error('Get single workshop not implemented in backend yet');
  }

  // Meter compatibility methods
  async getMeters(filters?: any): Promise<Meter[]> {
    if (filters?.factory_id) {
      return this.getMetersByFactory(filters.factory_id);
    }
    return this.getAllMeters();
  }

  async updateMeter(id: number, data: any): Promise<Meter> {
    throw new Error('Update meter not implemented in backend yet');
  }

  async deleteMeter(id: number): Promise<void> {
    throw new Error('Delete meter not implemented in backend yet');
  }

  async getMeter(id: number): Promise<Meter> {
    return this.getMeterDetails(id);
  }

  // Meter Reading compatibility methods (overload)
  async getAllMeterReadings(filters?: any): Promise<MeterReading[]> {
    if (filters?.meter_id) {
      return this.getMeterReadings(filters.meter_id);
    }
    // Return empty array for now since backend doesn't have general endpoint
    return [];
  }

  async updateMeterReading(id: number, data: any): Promise<MeterReading> {
    throw new Error('Update meter reading not implemented in backend yet');
  }

  async deleteMeterReading(id: number): Promise<void> {
    throw new Error('Delete meter reading not implemented in backend yet');
  }

  async getMeterReading(id: number): Promise<MeterReading> {
    throw new Error('Get single meter reading not implemented in backend yet');
  }

  async bulkCreateMeterReadings(data: CreateMeterReadingRequest[]): Promise<MeterReading[]> {
    throw new Error('Bulk create meter readings not implemented in backend yet');
  }

  async verifyMeterReading(id: number): Promise<MeterReading> {
    return this.verifyReading(id);
  }

  // Meter Operator compatibility methods
  async getMeterOperator(id: number): Promise<MeterOperator> {
    throw new Error('Get single meter operator not implemented in backend yet');
  }

  async deleteMeterOperator(id: number): Promise<void> {
    throw new Error('Delete meter operator not implemented in backend yet');
  }

  // Dashboard data for compatibility
  async getDashboardData(factoryId: number): Promise<any> {
    // Mock data since backend doesn't have dashboard endpoint yet
    return {
      factory_id: factoryId,
      factory_name: `Factory ${factoryId}`,
      today: {
        total_readings: 0,
        pending_readings: 0,
        late_readings: 0,
      },
      current_month: {
        electricity: 0,
        water: 0,
        gas: 0,
      },
      previous_month: {
        electricity: 0,
        water: 0,
        gas: 0,
      },
      growth_percentage: {
        electricity: 0,
        water: 0,
        gas: 0,
      },
      recent_alerts: [],
      unverified_readings_count: 0,
      total_meters: 0,
      active_operators: 0,
    };
  }
}

export const energyService = new EnergyService();