import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface DashboardApiResponse {
  employees_full: number;
  employees_office: number;
  employees_office_man: number;
  employees_office_woman: number;
  fired: number;
  hired: number;
}

const GenderStatistics: React.FC = () => {
  const { t } = useTranslation();

  // Use the same queryKey as Employee.tsx to share cache
  const { data, isLoading } = useQuery<DashboardApiResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await axios.get(`/employers/dashboard/`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const genderData = useMemo(() => {
    if (!data) {
      return [
        { label: t("employee.male"), value: 95, color: "#3b82f6" },
        { label: t("employee.female"), value: 5, color: "#f59e0b" },
      ];
    }

    const manPercent = Math.round(
      (data.employees_office_man / data.employees_office) * 100,
    );
    const womanPercent = 100 - manPercent;

    return [
      { label: t("employee.male"), value: manPercent, color: "#3b82f6" },
      { label: t("employee.female"), value: womanPercent, color: "#f59e0b" },
    ];
  }, [data, t]);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 5) return null; // Kichik bo'laklar uchun label ko'rsatmaslik

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-5">
        <h2 className="text-lg font-medium text-gray-900 mb-5">
          {t("employee.gender_statistics")}
        </h2>
        <div className="h-52 bg-white rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-gray-400">{t("employee.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        {t("employee.gender_statistics")}
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-4">
        {genderData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="flex-1 truncate text-gray-700">{item.label}</span>
            <span className="font-medium text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderStatistics;
