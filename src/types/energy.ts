// Energy module types

// Factory Structure (Root level - no organization)
export interface Factory {
  id: number;
  name: string;
  description?: string;
  address?: string;
  manager_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workshop {
  id: number;
  name: string;
  description?: string;
  factory_id: number;
  factory?: Factory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Meter {
  id: number;
  name: string;
  serial_number: string;
  meter_type: "electricity" | "water" | "gas";
  level: "factory_main" | "workshop";
  factory_id: number;
  workshop_id?: number;
  workshop?: Workshop;
  latest_reading?: string | number; // Backend dan string yoki number keladi
  last_reading_value?: number;
  last_reading_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MeterReading {
  id: number;
  meter_id: number;
  current_reading: number;
  previous_value?: number;
  consumption?: number;
  reading_date: string; // Actual reading date
  scheduled_date?: string; // Scheduled reading date
  notes?: string;
  recorded_by: number;
  operator?: MeterOperator;
  is_verified: boolean;
  is_late: boolean; // Reading submitted late
  submission_time?: string; // When the reading was actually submitted
  meter?: Meter;
  created_at: string;
  updated_at: string;
}

// Daily Reading Schedule
export interface ReadingSchedule {
  id: number;
  factory_id: number;
  operator_id: number;
  meter_ids: number[];
  scheduled_time: string; // Daily reading time (HH:mm)
  is_active: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// User Management (Simplified for single organization)
export type UserRole = "admin" | "factory_manager" | "meter_operator";

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  factory_id?: number; // Only factory_id needed
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface MeterOperator extends User {
  role: "meter_operator";
  factory_id: number;
  factory?: Factory;
  assigned_meters: number[];
  daily_reading_time?: string; // Kunlik o'qish vaqti (HH:mm format)
  notification_enabled: boolean;
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Analytics and Reporting
export interface ConsumptionAnalytics {
  factory_id: number;
  period: {
    start_date: string;
    end_date: string;
  };
  total_consumption: {
    electricity: number;
    water: number;
    gas: number;
  };
  daily_average: {
    electricity: number;
    water: number;
    gas: number;
  };
  comparison_with_previous: {
    electricity: { value: number; percentage: number };
    water: { value: number; percentage: number };
    gas: { value: number; percentage: number };
  };
  by_workshop: Array<{
    workshop_id: number;
    workshop_name: string;
    consumption: {
      electricity: number;
      water: number;
      gas: number;
    };
  }>;
}

export interface EnergyDashboardData {
  factory_id: number;
  factory_name: string;
  today: {
    total_readings: number;
    pending_readings: number;
    late_readings: number;
  };
  current_month: {
    electricity: number;
    water: number;
    gas: number;
  };
  previous_month: {
    electricity: number;
    water: number;
    gas: number;
  };
  growth_percentage: {
    electricity: number;
    water: number;
    gas: number;
  };
  recent_alerts: Array<{
    type: "late_reading" | "unusual_consumption" | "meter_offline";
    message: string;
    severity: "low" | "medium" | "high";
    created_at: string;
  }>;
  unverified_readings_count: number;
  total_meters: number;
  active_operators: number;
  meters?: Meter[]; // Optional meters array for filtering
}

// Daily Reports
export interface DailyConsumptionReport {
  date: string;
  factory_id: number;
  total_consumption: {
    electricity: number;
    water: number;
    gas: number;
  };
  by_meter: Array<{
    meter_id: number;
    meter_name: string;
    type: "electricity" | "water" | "gas";
    current_reading: number;
    previous_reading: number;
    consumption: number;
    reading_time?: string;
    is_verified: boolean;
  }>;
}

// Form types (Simplified)
export interface CreateFactoryRequest {
  name: string;
  description?: string;
  address?: string;
  manager_id?: number;
}

export interface UpdateFactoryRequest extends Partial<CreateFactoryRequest> {
  is_active?: boolean;
}

export interface CreateWorkshopRequest {
  name: string;
  description?: string;
  factory_id: number;
}

export interface UpdateWorkshopRequest extends Partial<CreateWorkshopRequest> {
  is_active?: boolean;
}

export interface CreateMeterRequest {
  name: string;
  serial_number: string;
  type: "electricity" | "water" | "gas";
  level: "factory_main" | "workshop";
  factory_id: number;
  workshop_id?: number;
}

export interface CreateMeterReadingRequest {
  meter_id: number;
  current_reading: number;
  reading_date: string;
  notes?: string;
}

// User Management Requests (Simplified)
export interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  role: UserRole;
  factory_id?: number; // Only factory_id needed
}

export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  factory_id?: number;
  is_active?: boolean;
}

export interface CreateMeterOperatorRequest extends CreateUserRequest {
  role: "meter_operator";
  factory_id: number;
  assigned_meters: number[];
  daily_reading_time?: string;
  notification_enabled: boolean;
}

export interface UpdateMeterOperatorRequest extends UpdateUserRequest {
  assigned_meters?: number[];
  daily_reading_time?: string;
  notification_enabled?: boolean;
}

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  permissions: string[];
}

// Filter types
export interface MeterFilters {
  factory_id?: number;
  workshop_id?: number;
  type?: "electricity" | "water" | "gas";
  level?: "factory_main" | "workshop";
}

export interface MeterReadingFilters {
  meter_id?: number;
  start_date?: string;
  end_date?: string;
  is_verified?: boolean;
}

export interface ConsumptionReportFilters {
  factory_id: number;
  start_date: string;
  end_date: string;
  type?: "electricity" | "water" | "gas";
}

export interface MeterOperatorFilters {
  factory_id?: number;
}

// Reading Schedule and Notifications
export interface CreateReadingScheduleRequest {
  factory_id: number;
  operator_id: number;
  meter_ids: number[];
  scheduled_time: string;
  notifications_enabled: boolean;
}

export interface UpdateReadingScheduleRequest
  extends Partial<CreateReadingScheduleRequest> {
  is_active?: boolean;
}

export interface ReadingReminder {
  id: number;
  operator_id: number;
  scheduled_date: string;
  meters_count: number;
  completed_count: number;
  status: "pending" | "partial" | "completed" | "overdue";
  created_at: string;
}

// Analytics Filters (Simplified)
export interface AnalyticsFilters {
  factory_id?: number;
  start_date: string;
  end_date: string;
  meter_type?: "electricity" | "water" | "gas";
  comparison_period?:
    | "previous_month"
    | "previous_year"
    | "same_month_last_year";
}
