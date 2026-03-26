import React from "react";
import MetabaseDashboard from "../../components/MetabaseDashboard";

const DashboardWithMetabase: React.FC = () => {
  return (
    <div className="h-full w-full">
      <MetabaseDashboard endpoint="/metabase/summary" />
    </div>
  );
};

export default DashboardWithMetabase;
