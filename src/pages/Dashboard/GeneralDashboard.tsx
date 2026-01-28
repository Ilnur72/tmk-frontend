import React, { useState, useEffect } from "react";
import axios from "../../config/axios";
import type { DashboardAnalyticsOverview } from "../../types/dashboard";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Factory,
  Zap,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Eye,
  Settings,
  Bell,
} from "lucide-react";

interface DashboardStats {
  totalEmployees: number;
  totalFactories: number;
  totalEnergy: number;
  totalRevenue: number;
  totalOrders: number;
  totalAlerts: number;
  monthlyGrowth: {
    employees: number;
    revenue: number;
    energy: number;
    orders: number;
  };
  recentActivities: any[];
  topFactories: any[];
  energyConsumption: any[];
  salesData: any[];
}

const GeneralDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const didFetchRef = React.useRef(false);

  useEffect(() => {
    // Prevent double fetch in React 18 StrictMode (development only)
    if (didFetchRef.current && selectedPeriod === "month") return;
    didFetchRef.current = true;

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const res = await axios.get<{
        success: boolean;
        data: DashboardAnalyticsOverview;
      }>("/dashboard/overview");
      const data = res.data?.data;

      if (!data) {
        throw new Error("Ma'lumot yuklanmadi");
      }

      // Map analytics data to state
      const mapped: DashboardStats = {
        totalEmployees: data.employees.total,
        totalFactories: data.factories.total,
        totalEnergy: data.het?.thisMonthConsumption || 0,
        totalRevenue: data.finance.totalSources,
        totalOrders: data.transport.moving,
        totalAlerts: data.drivers.expiredLicenses,
        monthlyGrowth: {
          employees: 0,
          revenue: data.finance.recentChanges,
          energy: parseFloat(data.het?.changePercentage || "0") || 0,
          orders: 0,
        },
        recentActivities: [],
        topFactories: [],
        energyConsumption: [],
        salesData: [],
      };

      setStats(mapped);
    } catch (error) {
      console.error("Dashboard ma'lumotlarini yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Umumiy Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Barcha tizim ma'lumotlarining umumiy ko'rinishi
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Hafta</option>
            <option value="month">Oy</option>
            <option value="quarter">Chorak</option>
            <option value="year">Yil</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Jami Xodimlar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Жами ходимлар</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalEmployees.toLocaleString()}
              </p>
              <p
                className={`text-sm flex items-center mt-1 ${
                  stats.monthlyGrowth.employees >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.monthlyGrowth.employees >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stats.monthlyGrowth.employees)}% дан ўтган ой
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Jami Zavodlar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Жами заводлар</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalFactories}
              </p>
              <p className="text-sm text-gray-500 mt-1">Барча фаол заводлар</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Factory className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Energiya Iste'moli */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Энергия истеъмоли
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalEnergy > 0
                  ? `${stats.totalEnergy.toLocaleString()} kVt·s`
                  : "Маълумот йўқ"}
              </p>
              {stats.totalEnergy > 0 && (
                <p
                  className={`text-sm flex items-center mt-1 ${
                    stats.monthlyGrowth.energy > 0
                      ? "text-red-600"
                      : stats.monthlyGrowth.energy < 0
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  {stats.monthlyGrowth.energy > 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : stats.monthlyGrowth.energy < 0 ? (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  ) : null}
                  {Math.abs(stats.monthlyGrowth.energy).toFixed(1)}% дан ўтган
                  ой
                </p>
              )}
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Jami Daromad */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Жами даромад</p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p
                className={`text-sm flex items-center mt-1 ${
                  stats.monthlyGrowth.revenue >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.monthlyGrowth.revenue >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(stats.monthlyGrowth.revenue)}% дан ўтган ой
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Buyurtmalar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Буюртмалар</h3>
            <ShoppingCart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalOrders}
            </p>
            <p className="text-sm text-gray-600 mt-2">Жами буюртмалар</p>
            <p className="text-sm text-green-600 mt-1">
              +{stats.monthlyGrowth.orders}% ўсиш
            </p>
          </div>
        </div>

        {/* Ogohlantirishlar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Огоҳлантиришлар
            </h3>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-600">
              {stats.totalAlerts}
            </p>
            <p className="text-sm text-gray-600 mt-2">Фаол огоҳлантиришлар</p>
            <button className="text-sm text-blue-600 hover:text-blue-800 mt-2">
              Барчасини кўриш
            </button>
          </div>
        </div>

        {/* Tezkor harakatlar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Тезкор харакатлар
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Eye className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm">Ҳисоботларни кўриш</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Settings className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm">Созламалар</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Bell className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm">Билдиришнома</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eng yaxshi zavodlar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Енг яхши заводлар
          </h3>
          <div className="space-y-4">
            {stats.topFactories.map((factory, index) => (
              <div
                key={factory.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{factory.name}</p>
                    <p className="text-sm text-gray-500">
                      {factory.production.toLocaleString()} бирлик
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {factory.efficiency}%
                  </p>
                  <p className="text-xs text-gray-500">Самарадорлик</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energiya iste'moli grafigi */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Энергия истеъмоли (6 ой)
          </h3>
          <div className="space-y-4">
            {stats.energyConsumption.slice(-3).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">
                      {data.electricity.toLocaleString()} кВт
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">
                      {data.water.toLocaleString()} м³
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm">
                      {data.gas.toLocaleString()} м³
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Сўнгги фаолият
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Барчасини кўриш
          </button>
        </div>
        <div className="space-y-4">
          {stats.recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between py-3 border-b last:border-b-0"
            >
              <div className="flex items-start">
                <div
                  className={`w-2 h-2 rounded-full mr-3 mt-2 ${
                    activity.type === "order"
                      ? "bg-green-500"
                      : activity.type === "energy"
                        ? "bg-yellow-500"
                        : activity.type === "employee"
                          ? "bg-blue-500"
                          : activity.type === "alert"
                            ? "bg-red-500"
                            : "bg-purple-500"
                  }`}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralDashboard;
