export interface DashboardData {
  employees_full: number;
  employees_office: number;
  employees_office_man: number;
  employees_office_woman: number;
}

export interface OrganizationStats {
  count: number;
  tashkilot: string;
}

export interface BirthData {
  date: string;
}

export interface AgeGroup {
  label: string;
  color: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface GrowthData {
  current: {
    hired: number;
    terminated: number;
  };
  previous: {
    hired: number;
    terminated: number;
  };
}

export interface AdditionalStats {
  active_inactive: {
    active: number;
    inactive: number;
    activePercent: number;
    inactivePercent: number;
  };
  other_stats: Array<{
    title: string;
    value: number;
    trend?: number;
  }>;
}

// Dashboard API response types
export interface TransportStats {
  total: number;
  online: number;
  moving: number;
  idle: number;
  stopped: number;
  lastUpdate?: string;
}

export interface DriverStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  expiredLicenses: number;
}

export interface FinanceStats {
  totalPrices: number;
  totalSources: number;
  recentChanges: number;
  topChangedMetals?: Array<{
    symbol: string;
    changePercent: number;
    currentPrice: number;
  }>;
}

export interface EnergyTodayConsumption {
  factory_id: number;
  factory_name?: string;
  meter_type: string;
  consumption: number;
  timestamp?: string;
}

export interface EnergyOverview {
  factory_id: number;
  factory_name?: string;
  meter_type: string;
  avg_consumption: string | number;
  max_consumption: string | number;
  min_consumption: string | number;
  total_readings: number;
}

export interface SolarStationKPI {
  stationCode: string;
  stationName?: string;
  dataItemMap?: {
    installed_capacity?: number;
    day_power?: number;
    month_power?: number;
    total_power?: number;
    [key: string]: any;
  };
}

export interface HETImportStats {
  totalReadings: number;
  latestImport: string;
  oldestReading: string;
  newestReading: string;
  meterTypes: Array<{
    type: string;
    count: number;
  }>;
}

export interface FactoryStats {
  total: number;
  data?: any[];
  counts: {
    registrationCount: number;
    constructionCount: number;
    startedCount: number;
  };
}

export interface DashboardOverviewResponse {
  transport?: TransportStats;
  drivers?: DriverStats;
  finance?: FinanceStats;
  energy?: {
    today?: EnergyTodayConsumption[];
    overview?: EnergyOverview[];
  };
  solar?: {
    stationCount?: number;
    totalCapacity?: string;
    stations?: SolarStationKPI[];
  };
  het?: HETImportStats;
  factories?: FactoryStats;
  timestamp?: string;
}

// Analytics Dashboard API Types (v2.0)
export interface AnalyticsTransport {
  total: number;
  online: number;
  moving: number;
  idle: number;
  offline: number;
  onlinePercentage: string;
  movingPercentage: string;
}

export interface AnalyticsDrivers {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  expiredLicenses: number;
  activePercentage: string;
  expiredPercentage: string;
}

export interface AnalyticsEnergy {
  thisMonth: number;
  lastMonth: number;
  change: number;
  changePercentage: string;
  trend: "up" | "down" | "stable";
}

export interface AnalyticsSolar {
  stationCount: number;
  deviceCount: number;
  thisMonthProduction: number;
  lastMonthProduction: number;
  change: number;
  trend: "up" | "down" | "stable";
}

export interface AnalyticsFactories {
  total: number;
  registration: number;
  construction: number;
  started: number;
  thisMonthNew: number;
  lastMonthNew: number;
}

export interface AnalyticsHET {
  totalReadings: number;
  meterTypes: number;
  lastImport: string;
  thisMonthConsumption: number;
  lastMonthConsumption: number;
  changePercentage: string;
  trend: "up" | "down" | "stable";
}

export interface AnalyticsEmployees {
  total: number;
}

export interface AnalyticsFinance {
  totalPrices: number;
  totalSources: number;
  recentChanges: number;
}

export interface DashboardAnalyticsOverview {
  transport: AnalyticsTransport;
  drivers: AnalyticsDrivers;
  energy: AnalyticsEnergy;
  solar: AnalyticsSolar;
  factories: AnalyticsFactories;
  het: AnalyticsHET;
  employees: AnalyticsEmployees;
  finance: AnalyticsFinance;
  timestamp: string;
}
