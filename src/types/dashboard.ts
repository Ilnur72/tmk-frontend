// Analytics Dashboard API Types (v2.0)
export interface DashboardAnalyticsOverview {
  transport: any;
  drivers: any;
  energy: any;
  solar: any;
  factories: any;
  het: any;
  employees: any;
  finance: any;
  timestamp: string;
}
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
