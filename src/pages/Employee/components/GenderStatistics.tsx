import { useEffect, useState } from "react";
import { EMPLOYEE_API_URL } from "../../../config/const ";
import axios from "axios";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const GenderStatistics: React.FC = () => {
  const [genderData, setGenderData] = useState([
    { label: "Эркак киши", value: 0, color: "#3b82f6" },
    { label: "Аёл киши", value: 0, color: "#f59e0b" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${EMPLOYEE_API_URL}/dashboard/`);
        const data = response.data;
        const manPercent = Math.round(
          (data.employees_office_man / data.employees_office) * 100
        );
        const womanPercent = 100 - manPercent;

        setGenderData([
          { label: "Эркак киши", value: manPercent, color: "#3b82f6" },
          { label: "Аёл киши", value: womanPercent, color: "#f59e0b" },
        ]);
      } catch (error) {
        console.error("Error fetching gender data:", error);
        // Set default values on error
        setGenderData([
          { label: "Эркак киши", value: 95, color: "#3b82f6" },
          { label: "Аёл киши", value: 5, color: "#f59e0b" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenderData();
  }, []);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-medium text-gray-900 mb-5">
          Гендер статистикаси
        </h2>
        <div className="h-52 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-gray-400">Юкланмоқда...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Гендер статистикаси
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
