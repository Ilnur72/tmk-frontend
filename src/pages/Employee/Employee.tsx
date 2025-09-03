import React from "react";
import { List } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import StatCard from "./components/StatCard";
import GrowthsChart from "./components/GrowthChart";
import GenderStatistics from "./components/GenderStatistics";
import AgeStatistics from "./components/AgeStatistics";
import AdditionalStatsCard from "./components/AdditionalStatsCard";

// Types
interface EmployeeData {
  employees_full: number;
  employees_office: number;
  employees_office_man: number;
  employees_office_woman: number;
}

interface OrganizationData {
  count: number;
  tashkilot: string;
}

interface BirthData {
  date: string;
}

interface InternshipData {
  еxpiration: string;
  еxpiration_days: string;
}

interface DashboardApiResponse {
  employees_full: number;
  employees_office: number;
  employees_office_man: number;
  employees_office_woman: number;
}

interface BirthDataResponse {
  month: BirthData[];
}

// API Service
const EMPLOYEE_API_URL = "http://84.54.118.39:8444/1c";

const apiService = {
  async getDashboardData(): Promise<DashboardApiResponse> {
    const response = await axios.get(`${EMPLOYEE_API_URL}/dashboard/`);
    return response.data;
  },

  async getOrganizationStats(): Promise<OrganizationData[]> {
    const response = await axios.get(
      `${EMPLOYEE_API_URL}/tashkilot-statistika/`
    );
    return response.data;
  },

  async getBirthData(): Promise<BirthDataResponse> {
    const response = await axios.get(`${EMPLOYEE_API_URL}/tugilgan-kunlar/`);
    return response.data;
  },

  async getInternshipData(): Promise<InternshipData[]> {
    const response = await axios.get(`/employers/internship`);
    return response.data;
  },
};

// Custom hooks using React Query
const useDashboardData = () => {
  return useQuery<DashboardApiResponse>({
    queryKey: ["dashboard"],
    queryFn: apiService.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // gcTime o'rniga cacheTime
  });
};

const useOrganizationStats = () => {
  return useQuery<OrganizationData[]>({
    queryKey: ["organizationStats"],
    queryFn: apiService.getOrganizationStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

const useBirthData = () => {
  return useQuery<BirthDataResponse>({
    queryKey: ["birthData"],
    queryFn: apiService.getBirthData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

const useInternshipData = () => {
  return useQuery<InternshipData[]>({
    queryKey: ["internshipData"],
    queryFn: apiService.getInternshipData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Using React Query hooks
  const {
    data: employeeData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData();

  const {
    data: organizationData = [],
    isLoading: isOrgLoading,
    error: orgError,
  } = useOrganizationStats();

  const {
    data: birthData,
    isLoading: isBirthLoading,
    error: birthError,
  } = useBirthData();

  const {
    data: internshipData = [],
    isLoading: isInternshipLoading,
    error: internshipError,
  } = useInternshipData();

  // Combined loading state
  const isLoading =
    isDashboardLoading || isOrgLoading || isBirthLoading || isInternshipLoading;

  // Combined error state
  const error = dashboardError || orgError || birthError || internshipError;

  // Calculate total employees including all branches
  const totalEmployees = employeeData
    ? employeeData.employees_office +
      (organizationData.length > 0
        ? organizationData.reduce(
            (sum: number, org: OrganizationData) => sum + org.count,
            0
          )
        : 0)
    : 0;

  // Handler for internship card click
  const handleInternshipClick = () => {
    navigate("/employers/internships");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 max-sm:pt-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <button className="transition duration-200 border shadow-sm items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 bg-primary border-primary hover:bg-opacity-80 text-white m-2 mb-2 mr-1 inline-block">
            Комбинат ҳақида умумий маълумот
          </button>
          <button className="transition duration-200 border shadow-sm items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 bg-primary border-primary hover:bg-opacity-80 text-white m-2 mb-2 mr-1 inline-block">
            Ходимлар онлайн маълумоти
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Ma'lumotlarni yuklashda xatolik yuz berdi:{" "}
            {(error as Error).message}
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-medium text-gray-900">
            Комбинат ҳақида умумий маълумот
          </h2>
          <a
            href="employers/branches"
            className="flex items-center text-blue-600 hover:text-blue-700 gap-2"
          >
            Барча филиаллар ҳақида маълумот
            <List className="h-5 w-5" />
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Жами ходимлар"
            value={totalEmployees}
            description="Комбинатда жами ходимлар сони"
            isLoading={isLoading}
          />
          <StatCard
            title="Марказий корхона"
            value={employeeData?.employees_office || 0}
            description="Марказий корхона"
            isLoading={isLoading}
          />
          <StatCard
            title="Филиал 1"
            value={organizationData[2]?.count || 0}
            description={
              organizationData[2]?.tashkilot || "Филиал 1 Ангрен кони"
            }
            isLoading={isLoading}
          />
          <StatCard
            title="Филиал 2"
            value={organizationData[3]?.count || 0}
            description={
              organizationData[3]?.tashkilot || "Филиал 2 Олмалиқ кони"
            }
            isLoading={isLoading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-1">
            <GrowthsChart />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AgeStatistics />
            <GenderStatistics />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <AdditionalStatsCard
            title="Фаол/нофаол<br />ходимлар"
            value="13500"
            description="Ишда 13 300 Таътилда, касалликда, декретда 200"
            percentage="98%/2%"
            hasChart={true}
          />
          <AdditionalStatsCard
            title="Амалиёт муддати<br />тугайдиганлар"
            value={internshipData.length.toString()}
            description="Амалиёт муддати якин тугайдиган ходимлар"
            hasChart={false}
            isLoading={isInternshipLoading}
            onClick={handleInternshipClick}
          />
          <AdditionalStatsCard
            title="Бошқа турдаги<br />статистика"
            value="1450"
            percentage="45%"
            hasChart={true}
          />
          <AdditionalStatsCard
            title="Бошқа турдаги<br />статистика"
            value="180"
            hasChart={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
