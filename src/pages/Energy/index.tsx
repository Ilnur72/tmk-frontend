import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MetabaseDashboard from "./components/MetabaseDashboard";
// Commented out old components - keeping for future use
// import EnergyDashboard from "./EnergyDashboard";
// import WorkshopsList from "./components/WorkshopsList";
// import MetersList from "./components/MetersList";
// import MeterReadingsList from "./components/MeterReadingsList";
// Import other components here when ready
// import EnergyReports from './components/EnergyReports';

const Energy: React.FC = () => {
  const { t } = useTranslation();
  const [factoryId] = useState(83); // Using existing factory ID from database (83-161)
  const [activeTab, setActiveTab] = useState("diagramma");

  // New tabs - only Diagramma for now, old tabs commented out
  const tabs = [
    { id: "diagramma", name: "Diagramma", icon: "📊" },
    // Commented out old tabs - keeping for future use
    // { id: "dashboard", name: t("energy.dashboard"), icon: "📊" },
    // { id: "workshops", name: t("energy.workshops"), icon: "🏭" },
    // { id: "meters", name: t("energy.meters"), icon: "⚡" },
    // { id: "readings", name: t("energy.readings"), icon: "📋" },
    // { id: "reports", name: t("energy.reports"), icon: "📈" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "diagramma":
        return <MetabaseDashboard />;
      // Commented out old cases - keeping for future use
      // case "dashboard":
      //   return <EnergyDashboard />;
      // case "workshops":
      //   return <WorkshopsList factoryId={factoryId} />;
      // case "meters":
      //   return <MetersList factoryId={factoryId} />;
      // case "readings":
      //   return <MeterReadingsList factoryId={factoryId} />;
      // case "reports":
      //   return (
      //     <div className="p-6">
      //       <div className="text-center">
      //         <h3 className="text-lg font-medium text-gray-900 mb-2">
      //           {t("energy.reports")}
      //         </h3>
      //         <p className="text-gray-500">
      //           Energy reports and analytics coming soon...
      //         </p>
      //       </div>
      //     </div>
      //   );
      default:
        return <MetabaseDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 max-md:px-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 max-md:text-2xl">
              {t("energy.title")}
            </h1>
            <p className="mt-2 text-gray-600 max-md:text-sm">
              Monitor energy consumption and view analytics across your
              facilities
            </p>
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

export default Energy;
