import React, { useState } from "react";
import WorkshopsManagement from "./components/WorkshopsManagement";
import MetersManagement from "./components/MetersManagement";
import ReadingsManagement from "./components/ReadingsManagement";
import OperatorsManagement from "./components/OperatorsManagement";
import AdminLogin from "./components/AdminLogin";
import { User } from "../../types/energy";

const EnergyManagement: React.FC = () => {
  // const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("workshops");
  const [factoryId] = useState(83); // Using existing factory ID
  const [adminData, setAdminData] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("energyManagementAuthToken")
  );

  const handleLogin = (userData: User) => {
    setAdminData(userData);
    setIsLoggedIn(true);
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
    { id: "workshops", name: "Workshops Management", icon: "🏭" },
    { id: "meters", name: "Meters Management", icon: "⚡" },
    { id: "readings", name: "Readings Management", icon: "📋" },
    { id: "operators", name: "Operators Management", icon: "👥" },
  ];

  const renderTabContent = () => {
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
        <div className="px-6 py-4 max-md:px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 max-md:text-2xl">
              Energy Management System
            </h1>
            <p className="mt-2 text-gray-600 max-md:text-sm">
              Manage workshops, meters, readings, and operators for energy
              monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {adminData && (
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {adminData.first_name} {adminData.last_name}
                </p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
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

export default EnergyManagement;
