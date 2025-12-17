import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WorkshopsManagement from "./components/WorkshopsManagement";
import MetersManagement from "./components/MetersManagement";
import ReadingsManagement from "./components/ReadingsManagement";
import OperatorsManagement from "./components/OperatorsManagement";
import AdminLogin from "./components/AdminLogin";
import LanguageSwitcher from "../../components/UI/LanguageSwitcher";
import { User } from "../../types/energy";

// JWT token decode utility
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};

const EnergyManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("workshops");
  const [factoryId, setFactoryId] = useState<number | null>(null);
  const [adminData, setAdminData] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("energyManagementAuthToken")
  );

  // Token dan factory_id ni olish
  useEffect(() => {
    const token = localStorage.getItem("energyManagementAuthToken");
    if (token) {
      const decoded = decodeToken(token);

      if (decoded && decoded.factory_id) {
        setFactoryId(decoded.factory_id);
      } else if (decoded && decoded.factoryId) {
        setFactoryId(decoded.factoryId);
      } else {
        console.warn("⚠️ Factory ID not found in token");
      }
    }
  }, [isLoggedIn]);

  const handleLogin = (userData: User) => {
    setAdminData(userData);
    setIsLoggedIn(true);

    // Login dan keyin factory_id ni tokendan olish
    setTimeout(() => {
      const token = localStorage.getItem("energyManagementAuthToken");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && (decoded.factory_id || decoded.factoryId)) {
          setFactoryId(decoded.factory_id || decoded.factoryId);
        }
      }
    }, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("energyManagementAuthToken");
    setAdminData(null);
    setIsLoggedIn(false);
  };

  // If not logged in, show admin login form
  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Management tabs for admins
  const tabs = [
    {
      id: "workshops",
      name: t("energy_management.navigation.workshops"),
      icon: "🏭",
    },
    {
      id: "meters",
      name: t("energy_management.navigation.meters"),
      icon: "⚡",
    },
    {
      id: "readings",
      name: t("energy_management.navigation.readings"),
      icon: "📊",
    },
    {
      id: "operators",
      name: t("energy_management.navigation.operators"),
      icon: "👥",
    },
  ];

  const renderTabContent = () => {
    // Agar factory ID tokendan olinmagan bo'lsa, loading ko'rsatamiz
    if (!factoryId) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Factory ma'lumotlari yuklanmoqda...
            </h3>
            <p className="text-gray-500">Tokendan factory ID olinmoqda</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "workshops":
        return <WorkshopsManagement factoryId={factoryId} />;
      case "meters":
        return <MetersManagement factoryId={factoryId} />;
      case "readings":
        return <ReadingsManagement factoryId={factoryId} />;
      case "operators":
        return <OperatorsManagement factoryId={factoryId} />;
      default:
        return <WorkshopsManagement factoryId={factoryId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 max-md:px-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 max-md:text-2xl">
                {t("energy_management.title")}
              </h1>
              <p className="mt-2 text-gray-600 max-md:text-sm">
                {t("energy_management.subtitle")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {adminData && (
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {adminData.first_name} {adminData.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("energy_management.common.status")}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("energy_management.common.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="px-6 max-md:px-4">
          <nav className="flex space-x-8 max-md:space-x-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="flex items-center space-x-2">
                  <span className="max-md:hidden">{tab.icon}</span>
                  <span>{tab.name}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
};

export default EnergyManagement;
