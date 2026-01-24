import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BirthData } from "../../../types/dashboard";
import { EMPLOYEE_API_URL } from "../../../config/const";
import { Cell, Pie, ResponsiveContainer, PieChart } from "recharts"; // recharts dan import

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const AgeStatistics: React.FC = () => {
  const { t } = useTranslation();
  const [ageData, setAgeData] = useState([
    { label: t("employee.age_17_30"), value: 0, color: "#22b8cf" },
    { label: t("employee.age_31_50"), value: 0, color: "#fd7e14" },
    { label: t("employee.age_50_plus"), value: 0, color: "#ffd600" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgeData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${EMPLOYEE_API_URL}/tugilgan-kunlar/`
        );
        const data = response.data;

        // Debug uchun

        const counts = [0, 0, 0]; // [17-30, 31-50, 50+]

        // API dan kelgan ma'lumotlarni tekshiring
        const birthDataArray = data.month || data || [];

        if (Array.isArray(birthDataArray)) {
          birthDataArray.forEach((person: BirthData) => {
            const age = calculateAge(person.date);

            if (age >= 17 && age <= 30) {
              counts[0]++;
            } else if (age >= 31 && age <= 50) {
              counts[1]++;
            } else if (age >= 51) {
              counts[2]++;
            }
          });
        }

        const total = counts.reduce((a, b) => a + b, 0);

        const percentages = counts.map((count) =>
          total > 0 ? Math.round((count / total) * 100) : 0
        );

        setAgeData([
          {
            label: t("employee.age_17_30"),
            value: percentages[0],
            color: "#22b8cf",
          },
          {
            label: t("employee.age_31_50"),
            value: percentages[1],
            color: "#fd7e14",
          },
          {
            label: t("employee.age_50_plus"),
            value: percentages[2],
            color: "#ffd600",
          },
        ]);
      } catch (error) {
        console.error("Error fetching age data:", error);
        // Test ma'lumotlari
        setAgeData([
          { label: t("employee.age_17_30"), value: 21, color: "#22b8cf" },
          { label: t("employee.age_31_50"), value: 71, color: "#fd7e14" },
          { label: t("employee.age_50_plus"), value: 8, color: "#ffd600" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeData();
  }, [t]);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // 5% dan kichik bo'laklar uchun label yashirish

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
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-5">
        <h2 className="text-lg font-medium text-gray-900 mb-5">
          {t("employee.age_statistics")}
        </h2>
        <div className="h-52 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-gray-400">{t("employee.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-5">
        {t("employee.age_statistics")}
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {ageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {ageData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700 text-sm">{item.label}</span>
            </div>
            <span className="font-medium text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgeStatistics;
