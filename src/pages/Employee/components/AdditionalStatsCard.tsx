import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AdditionalStatsCardProps {
  title: string;
  value: string;
  description?: string;
  percentage?: string;
  hasChart?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  chartData?: any[];
  chartType?: "pie" | "bar";
}

const AdditionalStatsCard: React.FC<AdditionalStatsCardProps> = ({
  title,
  value,
  description,
  percentage,
  hasChart = false,
  onClick,
  isLoading = false,
  chartData,
  chartType = "pie",
}) => {
  // Default chart data if not provided
  const defaultPieData = [
    { name: "Active", value: 80, color: "#06b6d4" },
    { name: "Inactive", value: 20, color: "#e5e7eb" },
  ];

  const defaultBarData = [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 120 },
    { name: "Mar", value: 80 },
    { name: "Apr", value: 140 },
    { name: "May", value: 90 },
  ];

  const finalChartData =
    chartData || (chartType === "pie" ? defaultPieData : defaultBarData);

  const renderChart = () => {
    if (!hasChart) return null;

    if (chartType === "pie") {
      return (
        <div className="relative flex-none">
          <div className="w-20 h-20 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {finalChartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || "#06b6d4"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {percentage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-medium text-gray-700 text-xs">
                  {percentage}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (chartType === "bar") {
      return (
        <div className="relative flex-none">
          <div className="w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finalChartData}>
                <Bar dataKey="value" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSimpleChart = () => {
    if (hasChart) return null;

    return (
      <div className="mt-4 h-14 bg-gray-50 rounded flex items-center justify-center relative overflow-hidden">
        {/* Simple animated bars */}
        <div className="flex items-end space-x-1 h-8">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className="bg-cyan-400 rounded-t"
              style={{
                width: "4px",
                height: `${Math.random() * 80 + 20}%`,
                animation: `pulse 2s infinite ${index * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-5 ${
        onClick
          ? "cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={hasChart ? "w-1/2" : "flex-1"}>
          <div
            className="text-lg font-medium text-gray-900 leading-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          ></div>
          {description && (
            <div className="mt-1 text-sm text-gray-500 leading-relaxed">
              {description}
            </div>
          )}
          {!hasChart && (
            <div className="mt-2">
              <span className="text-2xl font-bold text-cyan-600">{value}</span>
            </div>
          )}
        </div>

        {hasChart ? (
          renderChart()
        ) : (
          <div className="ml-auto">
            <span className="bg-cyan-100 text-cyan-700 text-sm px-3 py-1 rounded-full font-medium">
              {value}
            </span>
          </div>
        )}
      </div>

      {renderSimpleChart()}
    </div>
  );
};

export default AdditionalStatsCard;
