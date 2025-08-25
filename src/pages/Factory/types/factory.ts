export interface FactoryInterface {
  id: number;
  name: string;
  enterprise_name?: string;
  project_goal?: string;
  region?: string;
  work_persent?: number;
  status: "REGISTRATION" | "CONSTRUCTION" | "STARTED";
  importance: "HIGH" | "AVERAGE" | "LOW";
  category?: string;
  coords?: [number, number] | string;
  images?: string | string[];
  custom_fields?: Record<string, string>;
  project_values?: {
    [key: string]: string | { child: Record<string, string> };
  };
  factoryParams?: FactoryParam[];
  cameras?: CameraType[];
  sort_num?: number;
}

export interface FactoryParam {
  id: number;
  status: 0 | 1 | 2;
  param?: {
    name: string;
  };
  latestLog?: {
    value: string;
    date_update: string;
  };
}

export interface CameraType {
  id: number;
  brand?: string;
  model: string;
  ip_address: string;
  stream_link?: string;
  has_ptz: boolean;
  status: "active" | "inactive" | "maintenance" | "broken";
}

export interface PTZCommand {
  cameraId: number;
  type?: string;
  zoom: string;
  pan?: string;
  tilt?: string;
  xml: string;
  ip: string;
}

export interface FactoryCounts {
  registrationCount: number;
  constructionCount: number;
  startedCount: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ParameterData {
  factoryId: number;
  paramId: number;
  paramName: string;
  paramType: string;
  factoryParamId: number;
  status: number | string;
}

export interface CustomField {
  key: string;
  value: string;
}

export interface ProjectValue {
  key: string;
  amount: string;
}