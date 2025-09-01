import { useEffect, useState } from "react";
import PieChart from "./PieChart";
import { EMPLOYEE_API_URL } from "../../../config/const ";
import axios from "axios";

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

  return <PieChart title="Гендер статистикаси" data={genderData} />;
};

export default GenderStatistics;