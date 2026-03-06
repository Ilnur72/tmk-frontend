import React from "react";
import { useTranslation } from "react-i18next";

const ESG: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-[calc(100vh-45px)] md:h-screen max-md:pt-[45px]">
      <iframe
        src="https://monitor.synterra.uz/dashboard/03ef6c20-02b3-11f1-bddb-03ed83673b88?publicId=d774ebb0-0335-11f1-bddb-03ed83673b88"
        title="ESG Dashboard"
        className="w-full h-full border-0"
        allow="fullscreen"
      />
    </div>
  );
};

export default ESG;
