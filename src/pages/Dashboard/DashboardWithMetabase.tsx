import React from "react";
import { useTranslation } from "react-i18next";
import MetabaseDashboard from "../../components/MetabaseDashboard";

const DashboardWithMetabase: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("dashboard.page_title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("dashboard.page_description")}
          </p>
        </div>
      </div>

      <MetabaseDashboard endpoint="/metabase/summary" />
    </div>
  );
};

export default DashboardWithMetabase;
