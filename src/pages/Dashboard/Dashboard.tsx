import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Users,
  Factory,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Settings,
  RefreshCw,
  Eye,
  Package,
  Zap,
  MapPin,
  Camera,
  FileText,
  UserCheck,
  Activity,
} from "lucide-react";
import "./Dashboard.css";

interface GeneralStats {
  // Factory & Production
  totalFactories: number;
  activeWorkshops: number;
  totalProduction: number;
  productionGrowth: number;

  // Sales & Finance
  totalSales: number;
  monthlyRevenue: number;
  salesGrowth: number;
  pendingOrders: number;

  // Employees & Partners
  totalEmployees: number;
  activeEmployees: number;
  totalPartners: number;
  newPartners: number;

  // Energy & Utilities
  energyConsumption: number;
  totalMeters: number;
  unverifiedReadings: number;
  energySavings: number;

  // Applications & System
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;

  // Cameras & Security
  activeCameras: number;
  totalCameras: number;
  securityAlerts: number;

  // General System
  systemUptime: number;
  dailyUsers: number;
  notifications: number;
}

interface RecentActivity {
  id: string;
  type:
    | "production"
    | "sales"
    | "employee"
    | "energy"
    | "application"
    | "security";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
}

const GeneralDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - real API integration kerak bo'ladi
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats({
        // Factory & Production
        totalFactories: 12,
        activeWorkshops: 45,
        totalProduction: 15420,
        productionGrowth: 8.5,

        // Sales & Finance
        totalSales: 342150,
        monthlyRevenue: 1250000,
        salesGrowth: 12.3,
        pendingOrders: 28,

        // Employees & Partners
        totalEmployees: 1250,
        activeEmployees: 1180,
        totalPartners: 85,
        newPartners: 7,

        // Energy & Utilities
        energyConsumption: 4750,
        totalMeters: 156,
        unverifiedReadings: 23,
        energySavings: 15.2,

        // Applications & System
        totalApplications: 2150,
        pendingApplications: 45,
        approvedApplications: 1890,
        rejectedApplications: 215,

        // Cameras & Security
        activeCameras: 124,
        totalCameras: 135,
        securityAlerts: 3,

        // General System
        systemUptime: 99.8,
        dailyUsers: 456,
        notifications: 12,
      });

      setRecentActivities([
        {
          id: "1",
          type: "production",
          title: "Yangi ishlab chiqarish buyurtmasi",
          description: "Zavod #3 da 500 dona mahsulot ishlab chiqarildi",
          timestamp: "2 daqiqa oldin",
          status: "success",
        },
        {
          id: "2",
          type: "energy",
          title: "Energiya iste'moli oshdi",
          description: "Bu oydagi energiya iste'moli 15% ga oshdi",
          timestamp: "15 daqiqa oldin",
          status: "warning",
        },
        {
          id: "3",
          type: "employee",
          title: "Yangi xodim qo'shildi",
          description: "Ahmad Karimov ishga qabul qilindi",
          timestamp: "1 soat oldin",
          status: "info",
        },
        {
          id: "4",
          type: "sales",
          title: "Katta sotish shartnomasi",
          description: "500,000$ lik shartnoma imzolandi",
          timestamp: "2 soat oldin",
          status: "success",
        },
        {
          id: "5",
          type: "security",
          title: "Xavfsizlik ogohlantirishi",
          description: "Zavod #1 da harakatni aniqlash tizimi ishga tushdi",
          timestamp: "3 soat oldin",
          status: "error",
        },
      ]);
    } catch (error: any) {
      console.error("Dashboard data loading error:", error);
      setError("Dashboard ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "production":
        return <Factory className="w-4 h-4" />;
      case "sales":
        return <ShoppingCart className="w-4 h-4" />;
      case "employee":
        return <Users className="w-4 h-4" />;
      case "energy":
        return <Zap className="w-4 h-4" />;
      case "application":
        return <FileText className="w-4 h-4" />;
      case "security":
        return <Camera className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Dashboard yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Umumiy Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Barcha tizim ma'lumotlari bir joyda
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yangilash</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {stats.notifications}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Production Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jami Ishlab chiqarish
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalProduction.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />+
                  {stats.productionGrowth}% dan o'tgan oy
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Factory className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Sales Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jami Sotish</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalSales.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />+{stats.salesGrowth}%
                  dan o'tgan oy
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Employees Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jami Xodimlar
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEmployees.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.activeEmployees} faol xodim
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Energy Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Energiya Iste'moli
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.energyConsumption.toLocaleString()} kWh
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 mr-1" />-
                  {stats.energySavings}% tejamkorlik
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Factory & Workshops */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Factory className="w-5 h-5 mr-2" />
              Zavodlar va Sexlar
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jami zavodlar</span>
                <span className="font-semibold">{stats.totalFactories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Faol sexlar</span>
                <span className="font-semibold">{stats.activeWorkshops}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Kutilayotgan buyurtmalar</span>
                <span className="font-semibold text-orange-600">
                  {stats.pendingOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Arizalar
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jami arizalar</span>
                <span className="font-semibold">{stats.totalApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Kutilayotgan</span>
                <span className="font-semibold text-yellow-600">
                  {stats.pendingApplications}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasdiqlangan</span>
                <span className="font-semibold text-green-600">
                  {stats.approvedApplications}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Cameras */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Xavfsizlik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Faol kameralar</span>
                <span className="font-semibold">
                  {stats.activeCameras}/{stats.totalCameras}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Xavfsizlik ogohlantirishlari
                </span>
                <span
                  className={`font-semibold ${
                    stats.securityAlerts > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {stats.securityAlerts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tizim ishlashi</span>
                <span className="font-semibold text-green-600">
                  {stats.systemUptime}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart Placeholder */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Oylik Daromad
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart integration kerak</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              So'nggi Faoliyat
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-full ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partners and Energy Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partners Stats */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Hamkorlar va Foydalanuvchilar
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="p-4 bg-blue-50 rounded-lg mb-2">
                  <Users className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">Jami Hamkorlar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPartners}
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-green-50 rounded-lg mb-2">
                  <Eye className="w-8 h-8 text-green-600 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">Kunlik Foydalanuvchilar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dailyUsers}
                </p>
              </div>
            </div>
          </div>

          {/* Energy Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Energiya Tafsilotlari
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jami hisobgichlar</span>
                <span className="font-semibold">{stats.totalMeters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Tasdiqlanmagan ko'rsatkichlar
                </span>
                <span className="font-semibold text-orange-600">
                  {stats.unverifiedReadings}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Energiya tejamkorligi
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.energySavings}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.energySavings}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralDashboard;
