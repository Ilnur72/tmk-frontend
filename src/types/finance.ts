export interface Source {
  id: number;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum MetalType {
  STEEL = "steel",
  IRON = "iron",
  COPPER = "copper",
  ALUMINUM = "aluminum",
  ZINC = "zinc",
  LEAD = "lead",
  NICKEL = "nickel",
}

export interface MetalPrice {
  id: number;
  elementName: string;
  metalType: MetalType;
  currentPrice: number;
  previousPrice?: number;
  averagePrice?: number;
  changePercent?: number;
  currency: string;
  unit?: string;
  isActive: boolean;
  sourceId: number;
  source: Source;
  createdAt: string;
  updatedAt: string;
}

export interface MetalPriceLog {
  id: number;
  oldPrice: number;
  newPrice: number;
  changePercent?: number;
  changeReason?: string;
  metalPriceId: number;
  sourceId: number;
  source?: Source;
  metalPrice?: MetalPrice;
  createdAt: string;
}

export interface DashboardData {
  metalPrices: MetalPrice[];
  statistics: {
    totalMetals: number;
    avgPriceChange: number;
    topGainers: MetalPrice[];
    topLosers: MetalPrice[];
  };
}
