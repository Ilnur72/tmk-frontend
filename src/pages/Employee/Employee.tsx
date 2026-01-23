import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { List } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import StatCard from "./components/StatCard";
import GrowthsChart from "./components/GrowthChart";
import GenderStatistics from "./components/GenderStatistics";
import AgeStatistics from "./components/AgeStatistics";
import AdditionalStatsCard from "./components/AdditionalStatsCard";
import { API_URL } from "../../config/const";

// Types
interface AttendanceData {
  id: number;
  full_name: string;
  department: string;
  status?: string;
  time?: string;
}

interface AttendanceObject {
  id: number;
  name: string;
  employee_count: number;
}

interface AttendanceStats {
  total_employees: number;
  not_arrived: number;
  arrived: number;
  late: number;
  currently_in: number;
  left: number;
}

interface AttendanceResponse {
  active_object: number | null;
  active_status: string;
  counts: AttendanceStats;
  data: AttendanceData[];
  objects: AttendanceObject[];
  success: boolean;
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

interface PassportData {
  еxpiration_date: number;
  coming_soon: number;
}

interface LanguageSkill {
  name: string;
  level: string;
}

interface LanguageData {
  name: string;
  branch: string;
  position: string;
  department: string;
  langs: LanguageSkill[];
}

interface DashboardApiResponse {
  employees_full: number;
  employees_office: number;
  employees_office_man: number;
  employees_office_woman: number;
  fired: number;
  hired: number;
}

interface BirthDataResponse {
  month: BirthData[];
}

// API Service

const apiService = {
  async getDashboardData(): Promise<DashboardApiResponse> {
    const response = await axios.get(`/employers/dashboard/`);
    return response.data;
  },

  async getOrganizationStats(): Promise<OrganizationData[]> {
    const response = await axios.get(
      `${API_URL}/employers/tashkilot-statistika/`,
    );
    return response.data;
  },

  async getBirthData(): Promise<BirthDataResponse> {
    const response = await axios.get(`/employers/datehb`);
    return response.data;
  },

  async getInternshipData(): Promise<InternshipData[]> {
    const response = await axios.get(`/employers/internship`);
    return response.data;
  },

  async getPassportData(): Promise<PassportData> {
    const response = await axios.get(`/employers/passport`);
    return response.data;
  },
  async getLanguageData(): Promise<LanguageData[]> {
    const response = await axios.get(`/employers/langs`);
    return response.data;
  },

  async getAttendanceToken(): Promise<string> {
    try {
      const response = await axios.post(
        "https://citynet.synterra.uz/api/login",
        { phone: "998901234567" },
      );
      return response.data.token;
    } catch (error) {
      // Return current token as fallback
      return "5|aKv2AVPkCToZH8DzSAbix8UCMAomD2Sqil6wjzQAc53a5535";
    }
  },

  async getAttendanceData(
    status: string,
    token: string,
  ): Promise<AttendanceResponse> {
    const response = await axios.get(
      `https://citynet.synterra.uz/api/reports/today-tmk?status=${status}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },
};

// Custom hooks using React Query
const useDashboardData = () => {
  const didFetchRef = React.useRef(false);
  return useQuery<DashboardApiResponse>({
    queryKey: ["dashboard"],
    queryFn: apiService.getDashboardData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: (() => {
      if (didFetchRef.current) return false;
      didFetchRef.current = true;
      return true;
    })(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

const useOrganizationStats = () => {
  const didFetchRef = React.useRef(false);
  return useQuery<OrganizationData[]>({
    queryKey: ["organizationStats"],
    queryFn: apiService.getOrganizationStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: (() => {
      if (didFetchRef.current) return false;
      didFetchRef.current = true;
      return true;
    })(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

const useBirthData = () => {
  const didFetchRef = React.useRef(false);
  return useQuery<BirthDataResponse>({
    queryKey: ["birthData"],
    queryFn: apiService.getBirthData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: (() => {
      if (didFetchRef.current) return false;
      didFetchRef.current = true;
      return true;
    })(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

const useInternshipData = () => {
  const didFetchRef = React.useRef(false);
  return useQuery<InternshipData[]>({
    queryKey: ["internshipData"],
    queryFn: apiService.getInternshipData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: (() => {
      if (didFetchRef.current) return false;
      didFetchRef.current = true;
      return true;
    })(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

const usePassportData = () => {
  const didFetchRef = React.useRef(false);
  return useQuery<PassportData>({
    queryKey: ["passportData"],
    queryFn: apiService.getPassportData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: (() => {
      if (didFetchRef.current) return false;
      didFetchRef.current = true;
      return true;
    })(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

const useLanguageData = () => {
  const didFetchRef = React.useRef(false);
  return useQuery<LanguageData[]>({
    queryKey: ["languageData"],
    queryFn: apiService.getLanguageData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: (() => {
      if (didFetchRef.current) return false;
      didFetchRef.current = true;
      return true;
    })(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [attendanceToken, setAttendanceToken] = useState<string>(
    "5|aKv2AVPkCToZH8DzSAbix8UCMAomD2Sqil6wjzQAc53a5535",
  );
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);
  const [attendanceObjects, setAttendanceObjects] = useState<
    AttendanceObject[]
  >([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const didFetchAttendanceRef = React.useRef(false);

  // Fetch attendance data
  useEffect(() => {
    // Prevent double fetch in React 18 StrictMode
    if (didFetchAttendanceRef.current) return;
    didFetchAttendanceRef.current = true;

    const fetchAttendanceData = async () => {
      try {
        setIsLoadingAttendance(true);
        // Fetch with 'all' status to get counts
        const response = await apiService.getAttendanceData(
          "all",
          attendanceToken,
        );
        if (response.success) {
          setAttendanceStats(response.counts);
          setAttendanceObjects(response.objects);
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          const newToken = await apiService.getAttendanceToken();
          setAttendanceToken(newToken);
          const retryResponse = await apiService.getAttendanceData(
            "all",
            newToken,
          );
          if (retryResponse.success) {
            setAttendanceStats(retryResponse.counts);
            setAttendanceObjects(retryResponse.objects);
          }
        }
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    fetchAttendanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Ensure organizationData is an array
  const orgDataArray = Array.isArray(organizationData) ? organizationData : [];

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: _birthData, // TODO: Use birth data for birth analytics
    isLoading: isBirthLoading,
    error: birthError,
  } = useBirthData();

  const {
    data: internshipData = [],
    isLoading: isInternshipLoading,
    error: internshipError,
  } = useInternshipData();

  const {
    data: passportData,
    isLoading: isPassportLoading,
    error: passportError,
  } = usePassportData();

  const {
    data: languageData = [],
    isLoading: isLanguageLoading,
    error: languageError,
  } = useLanguageData();

  // Combined loading state
  const isLoading =
    isDashboardLoading ||
    isOrgLoading ||
    isBirthLoading ||
    isInternshipLoading ||
    isPassportLoading ||
    isLanguageLoading;

  // Combined error state
  const error =
    dashboardError ||
    orgError ||
    birthError ||
    internshipError ||
    passportError ||
    languageError;

  // Handler for internship card click
  const handleInternshipClick = () => {
    navigate("/employers/internships");
  };

  // Handler for language card click
  const handleLanguageClick = () => {
    navigate("/employers/languages");
  };

  // Calculate passport chart data
  const getPassportChartData = () => {
    if (!passportData) return [];

    const total = passportData.еxpiration_date;
    const comingSoon = passportData.coming_soon;
    const normal = total - comingSoon;

    return [
      {
        name: t("employee_dashboard.passport_normal"),
        value: normal,
        color: "#10b981",
      },
      {
        name: t("employee_dashboard.passport_expiring_soon"),
        value: comingSoon,
        color: "#ef4444",
      },
    ];
  };

  // Calculate language statistics
  const getLanguageStats = () => {
    if (!languageData || !Array.isArray(languageData) || !languageData.length)
      return { totalEmployees: 0, languages: [] };

    const languageCount: { [key: string]: number } = {};

    languageData.forEach((employee) => {
      employee.langs.forEach((lang) => {
        languageCount[lang.name] = (languageCount[lang.name] || 0) + 1;
      });
    });

    const sortedLanguages = Object.entries(languageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      totalEmployees: languageData.length,
      languages: sortedLanguages,
    };
  };

  const languageStats = getLanguageStats();

  // Get language chart data
  const getLanguageChartData = () => {
    const stats = getLanguageStats();
    return stats.languages.map(([name, count], index) => ({
      name,
      value: count,
      color: index === 0 ? "#06b6d4" : index === 1 ? "#10b981" : "#f59e0b",
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 max-sm:pt-12">
      <div className="w-full px-2 sm:px-2 lg:px-2">
        <div className="text-center mb-8">
          <button className="transition duration-200 border shadow-sm items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 bg-primary border-primary hover:bg-opacity-80 text-white m-2 mb-2 mr-1 inline-block">
            {t("employee_dashboard.general_info")}
          </button>
          <button
            onClick={() => navigate("/employers/today-attendance")}
            className="transition duration-200 border shadow-sm items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 bg-primary border-primary hover:bg-opacity-80 text-white m-2 mb-2 mr-1 inline-block"
          >
            {t("employee_dashboard.online_info")}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {t("employee_dashboard.load_error")}: {(error as Error).message}
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-medium text-gray-900">
            {t("employee_dashboard.today_attendance_status")}
          </h2>
          <a
            href="employers/branches"
            className="flex items-center text-blue-600 hover:text-blue-700 gap-2"
          >
            {t("employee_dashboard.all_branches_info")}
            <List className="h-5 w-5" />
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t("employee_dashboard.total_employees")}
            value={employeeData?.employees_full || 0}
            description={t("employee_dashboard.total_employees_desc")}
            isLoading={isLoading}
          />
          <StatCard
            title={t("employee_dashboard.central_office")}
            value={employeeData?.employees_office || 0}
            description={t("employee_dashboard.central_office")}
            isLoading={isLoading}
          />
          {attendanceObjects.length > 0 ? (
            attendanceObjects.map((obj) => (
              <StatCard
                key={obj.id}
                title={obj.name}
                value={obj.employee_count || 0}
                description={obj.name}
                isLoading={isLoadingAttendance}
              />
            ))
          ) : orgDataArray.length > 0 ? (
            orgDataArray.map((org, index) => (
              <StatCard
                key={org.tashkilot || index}
                title={org.tashkilot || `Филиал ${index + 1}`}
                value={org.count || 0}
                description={org.tashkilot || `Филиал ${index + 1}`}
                isLoading={isLoading}
              />
            ))
          ) : (
            <>
              <StatCard
                title={t("employee_dashboard.branch1")}
                value={0}
                description={t("employee_dashboard.branch1_desc")}
                isLoading={isLoading}
              />
              <StatCard
                title={t("employee_dashboard.branch2")}
                value={0}
                description={t("employee_dashboard.branch2_desc")}
                isLoading={isLoading}
              />
            </>
          )}
        </div>

        {/* Attendance Stats Section */}
        <div className="mb-8">
          {/* <h2 className="text-lg font-medium text-gray-900 mb-4">
            Бугунги даволат ҳолати
          </h2> */}

          {/* Detailed Attendance Data */}
          {/* {selectedStatus !== "all" && (
            <div className="mt-4 bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {selectedStatus === "not_arrived" && "Келмаган ходимлар"}
                  {selectedStatus === "arrived" && "Келган ходимлар"}
                  {selectedStatus === "currently_in" && "Ҳозир ишда бўлганлар"}
                  {selectedStatus === "left" && "Кетган ходимлар"}
                </h3>
                <button
                  onClick={() => setSelectedStatus("all")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Ёпиш
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        №
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ф.И.О
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Бўлим
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingAttendance ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : attendanceData.length > 0 ? (
                      attendanceData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.department || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Маълумот топилмади
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )} */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* <AdditionalStatsCard
            title={t("employee_dashboard.active_inactive")}
            value="13500"
            description={t("employee_dashboard.active_inactive_desc")}
            percentage="98%"
            hasChart={true}
            chartType="pie"
            chartData={[
              {
                name: t("employee_dashboard.active"),
                value: 98,
                color: "#10b981",
              },
              {
                name: t("employee_dashboard.inactive"),
                value: 2,
                color: "#ef4444",
              },
            ]}
          /> */}
          <AdditionalStatsCard
            title={t("employee_dashboard.internship_expiring")}
            value={(internshipData?.length || 0).toString()}
            description={t("employee_dashboard.internship_expiring_desc")}
            percentage={
              internshipData && internshipData.length > 0
                ? `${Math.min(100, internshipData.length)}%`
                : "0%"
            }
            hasChart={true}
            chartType="pie"
            chartData={[
              {
                name: "Tugaydi",
                value: internshipData?.length || 0,
                color: "#ef4444",
              },
              {
                name: "Normal",
                value: Math.max(0, 100 - (internshipData?.length || 0)),
                color: "#10b981",
              },
            ]}
            isLoading={isInternshipLoading}
            onClick={handleInternshipClick}
          />
          <AdditionalStatsCard
            title={t("employee_dashboard.passport_expiring")}
            value={passportData?.еxpiration_date?.toString() || "0"}
            description={t("employee_dashboard.passport_expiring_desc", {
              count: passportData?.coming_soon || 0,
            })}
            percentage={
              passportData && passportData.еxpiration_date
                ? `${Math.round(
                    (passportData.coming_soon / passportData.еxpiration_date) *
                      100,
                  )}%`
                : "0%"
            }
            hasChart={true}
            chartType="pie"
            chartData={getPassportChartData()}
            isLoading={isPassportLoading}
            // onClick={handlePassportClick}
          />
          <AdditionalStatsCard
            title={t("employee_dashboard.knows_languages")}
            value={(languageStats.totalEmployees || 0).toString()}
            description={t("employee_dashboard.most_common_language", {
              lang:
                languageStats.languages[0]?.[0] ||
                t("employee_dashboard.no_data"),
              count: languageStats.languages[0]?.[1] || 0,
            })}
            hasChart={true}
            chartType="pie"
            chartData={getLanguageChartData()}
            isLoading={isLanguageLoading}
            onClick={handleLanguageClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
