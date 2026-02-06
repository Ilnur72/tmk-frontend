import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import VehicleTracking from "../../components/VehicleTracking/VehicleTracking";

const Techniques: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"tracking" | "analytics">("tracking");

  const tabs = [
    { id: "tracking" as const, name: t("techniques.tabs.tracking"), icon: "🚗" },
    { id: "analytics" as const, name: t("techniques.tabs.analytics"), icon: "📊" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "tracking":
        return <VehicleTracking />;
      case "analytics":
        return (
          <div className="h-[calc(100vh-200px)] w-full">
            <iframe
              src="https://tmk.bgs.uz/metabase/public/dashboard/6ce32ea1-343b-44bd-81b9-81b5d13246f0"
              title="Transport Analytics Dashboard"
              className="w-full h-full border-0 rounded-lg shadow-sm"
              allow="fullscreen"
            />
          </div>
        );
      default:
        return <VehicleTracking />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("techniques.title")}
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  );
};

export default Techniques;
