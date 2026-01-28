import React from "react";
import { useTranslation } from "react-i18next";
import MetabaseDashboard from "../../components/MetabaseDashboard";

const Production: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("production.title")}
        </h1>
      </div>

      <MetabaseDashboard endpoint="/metabase/production" />
    </div>
  );
};

export default Production;
