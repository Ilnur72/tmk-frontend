import React from "react";
import { useTranslation } from "react-i18next";

const Sales: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("sales.title")}</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">{t("sales.under_development")}</p>
      </div>
    </div>
  );
};

export default Sales;
