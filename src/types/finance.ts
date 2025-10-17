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
  elementName: string; // backward compatibility uchun
  metalType: MetalType; // backward compatibility uchun
  currentPrice: number;
  previousPrice?: number;
  averagePrice?: number;
  changePercent?: number;
  currency: string;
  unit?: string; // backward compatibility uchun
  isActive: boolean;
  sourceId: number;
  source: Source;
  elementId?: number; // yangi relational structure uchun
  element?: Element; // yangi relational structure uchun
  priceLogs?: MetalPriceLog[]; // yangi relational structure uchun
  createdAt: string;
  updatedAt: string;
}

// Yangi Element interface (backend relational structure uchun)
export interface Element {
  id: number;
  name: string; // Backend Entity da name field
  symbol: string; // Backend Entity da symbol field
  metalType: MetalType;
  description?: string; // Backend Entity da description field
  atomicWeight?: number; // Backend Entity da atomicWeight field
  atomicNumber?: number; // Backend Entity da atomicNumber field
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metalPrices?: MetalPrice[];
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
