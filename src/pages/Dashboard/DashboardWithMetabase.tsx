import React from "react";
import { useTranslation } from "react-i18next";
import MetabaseDashboard from "../../components/MetabaseDashboard";

const DashboardWithMetabase: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("dashboard.page_title")}
        </h1>
      </div>

      <MetabaseDashboard endpoint="/metabase/summary" />
    </div>
  );
};

export default DashboardWithMetabase;
