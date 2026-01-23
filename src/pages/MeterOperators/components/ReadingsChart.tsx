import React from "react";
import { useTranslation } from "react-i18next";
import MetabaseIframe from "../../../components/MetabaseIframe";

interface ReadingsChartProps {
  operatorData: any;
}

const ReadingsChart: React.FC<ReadingsChartProps> = ({ operatorData }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 max-md:p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-semibold text-gray-900">
            📊{" "}
            {t(
              "meter_operators.readings_chart.title",
              "Ko'rsatkichlar diagrammasi",
            )}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              "meter_operators.readings_chart.description",
              "Hisoblagichlar ko'rsatkichlarining tarixiy ma'lumotlari",
            )}
          </p>
        </div>

        {/* Metabase Dashboard */}
        <div
          className="relative w-full"
          style={{ height: "calc(100vh - 280px)", minHeight: "600px" }}
        >
          <MetabaseIframe
            title={t(
              "meter_operators.readings_chart.title",
              "Ko'rsatkichlar diagrammasi",
            )}
            apiPath="/metabase-dashboard?name=readings_chart"
          />
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {t(
              "meter_operators.readings_chart.powered_by",
              "Metabase Analytics orqali taqdim etilgan",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingsChart;
