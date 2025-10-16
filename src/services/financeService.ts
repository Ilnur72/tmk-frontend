import axios from "axios";
import {
  DashboardData,
  Source,
  MetalPrice,
  MetalPriceLog,
  MetalType,
} from "../types/finance";

// Barcha elementlar va ularning narxlarini olish
export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get<DashboardData>("/finance/dashboard");
  return response.data;
};

// Yangi API: Barcha elementlarni olish
export const fetchElements = async (): Promise<MetalPrice[]> => {
  const response = await axios.get<MetalPrice[]>("/finance/elements");
  return response.data;
};

// Yangi API: Bitta elementni olish
export const fetchElement = async (id: number): Promise<MetalPrice> => {
  const response = await axios.get<MetalPrice>(`/finance/elements/${id}`);
  return response.data;
};

export const fetchSources = async (): Promise<Source[]> => {
  const response = await axios.get<Source[]>("/finance/sources");
  return response.data;
};

// Yangi API: Element qo'shish
export const createElement = async (data: {
  elementName: string;
  metalType: MetalType;
  currentPrice: number;
  previousPrice?: number;
  currency: string;
  unit?: string;
  sourceId: number;
}): Promise<MetalPrice> => {
  const response = await axios.post<MetalPrice>("/finance/elements", data);
  return response.data;
};

// Eski API (backward compatibility uchun)
export const createMetalPrice = async (data: {
  elementName: string;
  metalType: MetalType;
  currentPrice: number;
  previousPrice?: number;
  currency: string;
  unit?: string;
  sourceId: number;
}): Promise<MetalPrice> => {
  return createElement(data);
};

// Yangi API: Elementni yangilash
export const updateElement = async ({
  id,
  data,
}: {
  id: number;
  data: {
    elementName: string;
    metalType: MetalType;
    currentPrice: number;
    previousPrice?: number;
    currency: string;
    unit?: string;
    sourceId: number;
  };
}): Promise<MetalPrice> => {
  const response = await axios.put<MetalPrice>(`/finance/elements/${id}`, data);
  return response.data;
};

// Eski API (backward compatibility uchun)
export const updateMetalPrice = async ({
  id,
  data,
}: {
  id: number;
  data: {
    elementName: string;
    metalType: MetalType;
    currentPrice: number;
    previousPrice?: number;
    currency: string;
    unit?: string;
    sourceId: number;
  };
}): Promise<MetalPrice> => {
  return updateElement({ id, data });
};

export const createSource = async (data: {
  name: string;
  url: string;
  description?: string;
}): Promise<Source> => {
  const response = await axios.post<Source>("/finance/sources", data);
  return response.data;
};

// Yangi API: Elementni o'chirish
export const deleteElement = async (id: number): Promise<void> => {
  await axios.delete(`/finance/elements/${id}`);
};

export const fetchPriceLogs = async (
  metalPriceId: number
): Promise<MetalPriceLog[]> => {
  const response = await axios.get<MetalPriceLog[]>(
    `/finance/price-logs?metalPriceId=${metalPriceId}`
  );
  return response.data;
};
