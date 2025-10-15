import axios from "axios";
import {
  DashboardData,
  Source,
  MetalPrice,
  MetalPriceLog,
  MetalType,
} from "../types/finance";

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get<DashboardData>("/finance/dashboard");
  return response.data;
};

export const fetchSources = async (): Promise<Source[]> => {
  const response = await axios.get<Source[]>("/finance/sources");
  return response.data;
};

export const createMetalPrice = async (data: {
  elementName: string;
  metalType: MetalType;
  currentPrice: number;
  previousPrice?: number;
  currency: string;
  unit?: string;
  sourceId: number;
}): Promise<MetalPrice> => {
  const response = await axios.post<MetalPrice>("/finance/metal-prices", data);
  return response.data;
};

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
  const response = await axios.put<MetalPrice>(
    `/finance/metal-prices/${id}`,
    data
  );
  return response.data;
};

export const createSource = async (data: {
  name: string;
  url: string;
  description?: string;
}): Promise<Source> => {
  const response = await axios.post<Source>("/finance/sources", data);
  return response.data;
};

export const fetchPriceLogs = async (
  metalPriceId: number
): Promise<MetalPriceLog[]> => {
  const response = await axios.get<MetalPriceLog[]>(
    `/finance/price-logs?metalPriceId=${metalPriceId}`
  );
  return response.data;
};
