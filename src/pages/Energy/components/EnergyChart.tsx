import React from "react";
import MetabaseIframe from "../../../components/MetabaseIframe";
import { useTranslation } from "react-i18next";

interface EnergyChartProps {
  factoryId: number;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ factoryId }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-md:p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 {t("energy.energy_chart.title", "Energiya diagrammasi")}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              "energy.energy_chart.description",
              "Energiya iste'molining tarixiy ma'lumotlari va tahlillari",
            )}
          </p>
        </div>

        {/* Metabase Dashboard */}
        <div
          className="relative w-full"
          style={{ height: "calc(100vh - 280px)", minHeight: "600px" }}
        >
          {/** Fetch Metabase dashboard link from backend instead of hardcoding IP */}
          <MetabaseIframe
            title={t("energy.energy_chart.title", "Energiya diagrammasi")}
            apiPath="/metabase-dashboard?name=energy_chart"
          />
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {t(
              "energy.energy_chart.powered_by",
              "Metabase Analytics orqali taqdim etilgan",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyChart;
