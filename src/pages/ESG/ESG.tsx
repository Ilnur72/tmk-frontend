import React from "react";
import { useTranslation } from "react-i18next";

const ESG: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("sidebar.punkt_esg")}</h1>
      </div>

      <div className="h-[calc(100vh-200px)] w-full">
        <iframe
          src="https://monitor.synterra.uz/dashboard/03ef6c20-02b3-11f1-bddb-03ed83673b88?publicId=d774ebb0-0335-11f1-bddb-03ed83673b88"
          title="ESG Dashboard"
          className="w-full h-full border-0 rounded-lg shadow-sm"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default ESG;
