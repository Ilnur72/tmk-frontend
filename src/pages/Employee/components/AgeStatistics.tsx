import axios from "axios";
import { useEffect, useState } from "react";
import { BirthData } from "../../../types/dashboard";
import { EMPLOYEE_API_URL } from "../../../config/const ";
import PieChart from "./PieChart";

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
  const [ageData, setAgeData] = useState([
    { label: "17 - 30 ёш", value: 0, color: "#22b8cf" },
    { label: "31 - 50 ёш", value: 0, color: "#fd7e14" },
    { label: ">= 50 ёш", value: 0, color: "#ffd600" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgeData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${EMPLOYEE_API_URL}/tugilgan-kunlar/`);
        const data = response.data;
        const today = new Date();
        const counts = [0, 0, 0]; // [17-30, 31-50, 50+]

        data.month.forEach((person: BirthData) => {
          const age = calculateAge(person.date);

          if (age >= 17 && age <= 30) {
            counts[0]++;
          } else if (age >= 31 && age <= 50) {
            counts[1]++;
          } else if (age >= 51) {
            counts[2]++;
          }
        });

        const total = counts.reduce((a, b) => a + b, 0);
        const percentages = counts.map((count) =>
          total > 0 ? Math.round((count / total) * 100) : 0
        );

        setAgeData([
          { label: "17 - 30 ёш", value: percentages[0], color: "#22b8cf" },
          { label: "31 - 50 ёш", value: percentages[1], color: "#fd7e14" },
          { label: ">= 50 ёш", value: percentages[2], color: "#ffd600" },
        ]);
      } catch (error) {
        console.error("Error fetching age data:", error);
        // Set default values on error
        setAgeData([
          { label: "17 - 30 ёш", value: 45, color: "#22b8cf" },
          { label: "31 - 50 ёш", value: 35, color: "#fd7e14" },
          { label: ">= 50 ёш", value: 20, color: "#ffd600" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-medium text-gray-900 mb-5">
          Ходимларни ёшлар бўйича статистикаси
        </h2>
        <div className="h-52 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-gray-400">Юкланмоқда...</p>
        </div>
      </div>
    );
  }

  return (
    <PieChart title="Ходимларни ёшлар бўйича статистикаси" data={ageData} />
  );
};

export default AgeStatistics;
