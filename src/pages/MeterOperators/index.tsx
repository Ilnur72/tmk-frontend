import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OperatorLogin from "./components/OperatorLogin";
import DailyReadings from "./components/DailyReadings";
import MyReadingsHistory from "./components/MyReadingsHistory";
import LanguageSwitcher from "../../components/UI/LanguageSwitcher";
import { meterOperatorService } from "./services/meterOperatorService";
import { User } from "../../types/energy";

const MeterOperators: React.FC = () => {
  const { t } = useTranslation();
  const [operatorData, setOperatorData] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("meterOperatorAuthToken")
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily-readings");

  // Operator ma'lumotlarini yuklash
  useEffect(() => {
    const loadOperatorData = () => {
      const token = localStorage.getItem("meterOperatorAuthToken");
      const operatorId = localStorage.getItem("meterOperatorToken");

      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      // Token bor bo'lsa, localStorage dan ma'lumot olish
      if (operatorId) {
        setOperatorData({ id: parseInt(operatorId) } as User);
      }

      setLoading(false);
    };

    if (isLoggedIn) {
      loadOperatorData();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleLogin = (userData: User) => {
    setOperatorData(userData);
    setIsLoggedIn(true);
    // Token service tomonidan allaqachon saqlangan
    // User ID ni ham saqlaymiz
    if (userData.id) {
      localStorage.setItem("meterOperatorToken", userData.id.toString());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("meterOperatorToken");
    localStorage.removeItem("meterOperatorAuthToken");
    setOperatorData(null);
    setIsLoggedIn(false);
  };

  // Loading holati
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login form
  if (!isLoggedIn) {
    return <OperatorLogin onLogin={handleLogin} />;
  }

  // Operator-specific tabs
  const tabs = [
    {
      id: "daily-readings",
      name: t("meter_operators.readings.title"),
      icon: "📝",
    },
    {
      id: "my-history",
      name: t("meter_operators.readings_history.title"),
      icon: "📋",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "daily-readings":
        return <DailyReadings operatorData={operatorData} />;
      case "my-history":
        return <MyReadingsHistory operatorData={operatorData} />;
      default:
        return <DailyReadings operatorData={operatorData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 max-md:px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 max-md:text-2xl">
              {t("meter_operators.title")}
            </h1>
            <p className="mt-2 text-gray-600 max-md:text-sm">
              {t("meter_operators.subtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {operatorData && (
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {operatorData.first_name} {operatorData.last_name}
                </p>
                <p className="text-sm text-gray-500">{operatorData.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t("meter_operators.common.logout")}
            </button>
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

export default MeterOperators;
