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
    <div className="flex flex-col bg-gray-50 h-[calc(100vh-45px)] md:h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-4 px-3 py-2 md:px-6 md:py-3">
          <h1 className="text-sm md:text-xl font-bold text-gray-900">
            {t("techniques.title")}
          </h1>

          {/* Tabs inline with header on mobile */}
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-1 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className={`flex-1 overflow-hidden ${activeTab === "tracking" ? "" : "p-3 md:p-6"}`}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Techniques;
