export interface Factory {
  id: number;
  name: string;
  images: string | null;
  work_persent: number;
  status: string;
  factoryParams?: FactoryParam[];
  coords?: string;
  custom_fields?: Record<string, any>;
  project_values?: Record<string, any>;
}

export interface FactoryParam {
  id: number;
  param: {
    id: number;
    name: string;
    type: string;
  };
  status: number;
  visible: boolean;
  latestLog?: {
    value: string;
    izoh: string;
  };
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