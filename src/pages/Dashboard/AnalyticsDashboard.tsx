import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Factory,
  Zap,
  Sun,
  Truck,
  UserCheck,
  DollarSign,
  Database,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import axios from "../../config/axios";
import TrendIndicator from "../../components/UI/TrendIndicator";
import type { DashboardAnalyticsOverview } from "../../types/dashboard";

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = React.useRef(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard overview and employees data in parallel
      const [dashboardRes, employeesRes] = await Promise.allSettled([
        axios.get<{ success: boolean; data: DashboardAnalyticsOverview }>(
          "/dashboard/overview",
        ),
        axios.get<{ data?: { employees_full?: number } }>(
          "/employers/dashboard",
        ),
      ]);

      const dashboardData =
        dashboardRes.status === "fulfilled" && dashboardRes.value.data?.success
          ? dashboardRes.value.data.data
          : null;

      const employeesData =
        employeesRes.status === "fulfilled"
          ? employeesRes.value.data?.data
          : null;

      if (!dashboardData) {
        throw new Error("Ma'lumot yuklanmadi");
      }

      // Merge employees data from /employers/dashboard
      if (employeesData && employeesData.employees_full !== undefined) {
        dashboardData.employees.total = employeesData.employees_full;
      }

      setData(dashboardData);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      setError("Dashboard ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent double fetch in React 18 StrictMode (development only)
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    loadDashboard();

    // Auto-refresh har 30 sekundda
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Dashboard yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                TMK Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Direktor uchun analitik ko'rsatkichlar
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Oxirgi yangilanish:{" "}
                {new Date(data.timestamp).toLocaleTimeString("uz-UZ")}
              </span>
              <button
                onClick={loadDashboard}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Yangilash</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Transport */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                TRANSPORT
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {data.transport.online}
                </span>
                <span className="text-sm text-gray-500">
                  / {data.transport.total}
                </span>
              </div>
              <p className="text-sm text-gray-600">Online transportlar</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">Online:</span>
                <span className="text-sm font-semibold text-green-600">
                  {data.transport.onlinePercentage}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Harakatda:</span>
                <span className="text-sm font-semibold text-blue-600">
                  {data.transport.movingPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Energy */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                ENERGIYA
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {data.energy.thisMonth.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">kWh</span>
              </div>
              <p className="text-sm text-gray-600">Shu oyda iste'mol</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">O'tgan oy:</span>
                <span className="text-sm text-gray-600">
                  {data.energy.lastMonth.toLocaleString()} kWh
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">O'zgarish:</span>
                <TrendIndicator
                  value={data.energy.change}
                  trend={data.energy.trend}
                />
              </div>
            </div>
          </div>

          {/* Solar */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Sun className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">QUYOSH</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {data.solar.thisMonthProduction.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">kWh</span>
              </div>
              <p className="text-sm text-gray-600">Shu oyda ishlab chiqarish</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">Stansiyalar:</span>
                <span className="text-sm font-semibold">
                  {data.solar.stationCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">O'zgarish:</span>
                <TrendIndicator
                  value={data.solar.change}
                  trend={data.solar.trend}
                />
              </div>
            </div>
          </div>

          {/* Factories */}
          <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Factory className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                ZAVODLAR
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {data.factories.total}
                </span>
                <span className="text-xs text-gray-500">jami</span>
              </div>
              <p className="text-sm text-gray-600">Barcha zavodlar</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">Ishga tushgan:</span>
                <span className="text-sm font-semibold text-green-600">
                  {data.factories.started}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Shu oyda yangi:</span>
                <span className="text-sm font-semibold text-blue-600">
                  +{data.factories.thisMonthNew}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Drivers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                HAYDOVCHILAR
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {data.drivers.active}
                </span>
                <span className="text-sm text-gray-500">
                  / {data.drivers.total}
                </span>
              </div>
              <p className="text-sm text-gray-600">Faol haydovchilar</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">Faol:</span>
                <span className="text-sm font-semibold text-green-600">
                  {data.drivers.activePercentage}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Guvohnoma tugaydi:
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {data.drivers.expiredLicenses}
                </span>
              </div>
            </div>
          </div>

          {/* Finance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">MOLIYA</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {data.finance.totalPrices}
                </span>
                <span className="text-xs text-gray-500">narx</span>
              </div>
              <p className="text-sm text-gray-600">Metal narxlari</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">Manbalar:</span>
                <span className="text-sm font-semibold">
                  {data.finance.totalSources}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Oxirgi o'zgarishlar:
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  {data.finance.recentChanges}
                </span>
              </div>
            </div>
          </div>

          {/* HET */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Database className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                HET IMPORT
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {data.het.totalReadings.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">o'qish</span>
              </div>
              <p className="text-sm text-gray-600">Jami o'qishlar</p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">
                  Shu oylik iste'mol:
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {data.het.thisMonthConsumption.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">O'tgan oylik:</span>
                <span className="text-sm font-semibold text-gray-600">
                  {data.het.lastMonthConsumption.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">O'zgarish:</span>
                <span
                  className={`text-sm font-semibold flex items-center ${
                    data.het.trend === "down"
                      ? "text-green-600"
                      : data.het.trend === "up"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {data.het.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  ) : data.het.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : null}
                  {data.het.changePercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">
                  Hisobgich turlari:
                </span>
                <span className="text-sm font-semibold">
                  {data.het.meterTypes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Oxirgi import:</span>
                <span className="text-sm text-gray-600">
                  {new Date(data.het.lastImport).toLocaleDateString("uz-UZ")}
                </span>
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-full">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                XODIMLAR
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {data.employees.total}
                </span>
                <span className="text-xs text-gray-500">jami</span>
              </div>
              <p className="text-sm text-gray-600">Barcha xodimlar</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500 col-span-2">
                  VPN tizimidan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Factory Status Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Zavodlar Holati
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {data.factories.registration}
              </div>
              <p className="text-sm text-gray-600 mt-2">Ro'yxatdan o'tish</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {data.factories.construction}
              </div>
              <p className="text-sm text-gray-600 mt-2">Qurilish jarayonida</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {data.factories.started}
              </div>
              <p className="text-sm text-gray-600 mt-2">Ishga tushgan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
