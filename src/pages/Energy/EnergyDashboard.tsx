import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { energyService } from "../../services/energyService";
import { EnergyDashboardData } from "../../types/energy";
import { toast } from "../../utils/toast";

interface EnergyDashboardProps {
  factoryId?: number;
}

const EnergyDashboard: React.FC<EnergyDashboardProps> = ({ factoryId }) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] =
    useState<EnergyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "electricity" | "gas" | "water"
  >("all");

  const fetchDashboardData = useCallback(async () => {
    if (!factoryId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await energyService.getDashboardData(factoryId);

      setDashboardData(data);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [factoryId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-red-500";
    if (growth < 0) return "text-green-500";
    return "text-gray-500";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return "↗️";
    if (growth < 0) return "↘️";
    return "➡️";
  };

  const getFilteredMetersCount = () => {
    if (!dashboardData || !dashboardData.meters) return 0;
    // Filter actual meters data by meter_type
    const filteredMeters = dashboardData.meters.filter(
      (meter: any) => activeTab === "all" || meter.meter_type === activeTab
    );
    return filteredMeters.length;
  };

  const getFilteredReadingsCount = () => {
    if (!dashboardData) return 0;
    // Mock data - real implementation would filter from actual readings
    const readingsByType = {
      electricity: Math.floor(dashboardData.unverified_readings_count * 0.5),
      gas: Math.floor(dashboardData.unverified_readings_count * 0.3),
      water: Math.floor(dashboardData.unverified_readings_count * 0.2),
    };
    return readingsByType[activeTab as keyof typeof readingsByType] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("energy.common.no_data")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">
          {t("energy.dashboard")}
        </h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("energy.common.refresh")}
        </button>
      </div>

      {/* Meter Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: "all", label: "Barcha", icon: "📊" },
              { key: "electricity", label: "Elektr energiya", icon: "⚡" },
              { key: "gas", label: "Gaz", icon: "🔥" },
              { key: "water", label: "Suv", icon: "💧" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filtered Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Meters by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {activeTab === "all"
                  ? "Jami schetchiklar"
                  : activeTab === "electricity"
                  ? "Elektr schetchiklari"
                  : activeTab === "gas"
                  ? "Gaz schetchiklari"
                  : "Suv schetchiklari"}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {activeTab === "all"
                  ? dashboardData.total_meters
                  : getFilteredMetersCount()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">
                {activeTab === "all"
                  ? "📊"
                  : activeTab === "electricity"
                  ? "⚡"
                  : activeTab === "gas"
                  ? "🔥"
                  : "💧"}
              </span>
            </div>
          </div>
        </div>

        {/* Active Operators */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("energy.operator.active")}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {dashboardData.active_operators}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Unverified Readings by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {activeTab === "all"
                  ? "Jami tasdiqlanmagan o'qishlar"
                  : activeTab === "electricity"
                  ? "Elektr: tasdiqlanmagan"
                  : activeTab === "gas"
                  ? "Gaz: tasdiqlanmagan"
                  : "Suv: tasdiqlanmagan"}
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {activeTab === "all"
                  ? dashboardData.unverified_readings_count
                  : getFilteredReadingsCount()}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Electricity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("energy.meter.electricity")}
            </h3>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("energy.report.current_month")}
              </span>
              <span className="font-semibold">
                {formatNumber(dashboardData.current_month.electricity)} kWh
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("energy.report.previous_month")}
              </span>
              <span className="text-gray-500">
                {formatNumber(dashboardData.previous_month.electricity)} kWh
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {t("energy.report.growth")}
              </span>
              <span
                className={`font-semibold ${getGrowthColor(
                  dashboardData.growth_percentage.electricity
                )}`}
              >
                {getGrowthIcon(dashboardData.growth_percentage.electricity)}
                {Math.abs(dashboardData.growth_percentage.electricity).toFixed(
                  1
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("energy.meter.water")}
            </h3>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("energy.report.current_month")}
              </span>
              <span className="font-semibold">
                {formatNumber(dashboardData.current_month.water)} m³
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("energy.report.previous_month")}
              </span>
              <span className="text-gray-500">
                {formatNumber(dashboardData.previous_month.water)} m³
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {t("energy.report.growth")}
              </span>
              <span
                className={`font-semibold ${getGrowthColor(
                  dashboardData.growth_percentage.water
                )}`}
              >
                {getGrowthIcon(dashboardData.growth_percentage.water)}
                {Math.abs(dashboardData.growth_percentage.water).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Gas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("energy.meter.gas")}
            </h3>
            <div className="p-2 bg-orange-100 rounded-full">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("energy.report.current_month")}
              </span>
              <span className="font-semibold">
                {formatNumber(dashboardData.current_month.gas)} m³
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {t("energy.report.previous_month")}
              </span>
              <span className="text-gray-500">
                {formatNumber(dashboardData.previous_month.gas)} m³
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {t("energy.report.growth")}
              </span>
              <span
                className={`font-semibold ${getGrowthColor(
                  dashboardData.growth_percentage.gas
                )}`}
              >
                {getGrowthIcon(dashboardData.growth_percentage.gas)}
                {Math.abs(dashboardData.growth_percentage.gas).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">
              {t("energy.reading.create")}
            </span>
          </div>
        </button>

        <button className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">
              {t("energy.reading.verify")}
            </span>
          </div>
        </button>

        <button className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900">
              {t("energy.report.generate")}
            </span>
          </div>
        </button>

        <button className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium text-gray-900">
              {t("energy.common.export")}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default EnergyDashboard;
