import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";

// Types
interface ChartData {
  month: string;
  monthShort: string;
  hired: number;
  resigned: number;
}

// Mock data based on the chart image
const mockChartData: ChartData[] = [
  { month: "Январь", monthShort: "Jan", hired: 180, resigned: 320 },
  { month: "Февраль", monthShort: "Feb", hired: 240, resigned: 380 },
  { month: "Март", monthShort: "Mar", hired: 250, resigned: 420 },
  { month: "Апрель", monthShort: "Apr", hired: 200, resigned: 550 },
  { month: "Май", monthShort: "May", hired: 480, resigned: 320 },
  { month: "Июнь", monthShort: "Jun", hired: 450, resigned: 350 },
  { month: "Июль", monthShort: "Jul", hired: 1040, resigned: 450 },
  { month: "Август", monthShort: "Aug", hired: 1020, resigned: 800 },
  { month: "Сентябрь", monthShort: "Sep", hired: 980, resigned: 720 },
  { month: "Октябрь", monthShort: "Oct", hired: 1100, resigned: 650 },
  { month: "Ноябрь", monthShort: "Nov", hired: 950, resigned: 1200 },
  { month: "Декабрь", monthShort: "Dec", hired: 1050, resigned: 1100 },
];

// Custom Legend Component
const CustomLegend: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-6 mb-4">
      <div className="flex items-center">
        <div className="w-4 h-0.5 bg-cyan-500 mr-2"></div>
        <span className="text-sm text-gray-600">Қабул қилинган</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-400 mr-2"></div>
        <span className="text-sm text-gray-600">Бўшаган</span>
      </div>
    </div>
  );
};

// Custom Dot Component for the line chart
const CustomDot: React.FC<any> = (props) => {
  const { cx, cy, fill } = props;
  if (cx === undefined || cy === undefined) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={fill}
      stroke="#fff"
      strokeWidth={2}
      style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
    />
  );
};

const EmployeeGrowthChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState({
    hired: 56,
    resigned: 12,
    currentMonth: "Жорий ой",
  });
  const [previousData, setPreviousData] = useState({
    hired: 30,
    resigned: 3,
    previousMonth: "Аввалги ой",
  });

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChartData(mockChartData);

      // Calculate current and previous month data
      const currentMonth = new Date().getMonth();
      const currentMonthData = mockChartData[currentMonth];
      const previousMonthData =
        mockChartData[currentMonth > 0 ? currentMonth - 1 : 11];

      setCurrentData({
        hired: currentMonthData?.hired || 56,
        resigned: currentMonthData?.resigned || 12,
        currentMonth: "Жорий ой",
      });

      setPreviousData({
        hired: previousMonthData?.hired || 30,
        resigned: previousMonthData?.resigned || 3,
        previousMonth: "Аввалги ой",
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Ходимлар сонини ўсиши
          </h2>
          <div className="relative mt-3 sm:mt-0">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-56"
              placeholder="Сана танланг"
            />
          </div>
        </div>

        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-gray-400">График юкланмоқда...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Ходимлар сонини ўсиши
        </h2>
        <div className="relative mt-3 sm:mt-0">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-56"
            placeholder="Сана танланг"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="flex">
          <div>
            <div className="text-lg font-medium text-blue-600 xl:text-xl">
              Қабул қилинган {currentData.hired}
              <br />
              Бўшаган {currentData.resigned}
            </div>
            <div className="mt-0.5 text-gray-500">
              {currentData.currentMonth}
            </div>
          </div>
          <div className="mx-4 h-12 w-px border border-dashed border-gray-200 xl:mx-5"></div>
          <div>
            <div className="text-lg font-medium text-gray-500 xl:text-xl">
              Қабул қилинган {previousData.hired}
              <br />
              Бўшаган {previousData.resigned}
            </div>
            <div className="mt-0.5 text-gray-500">
              {previousData.previousMonth}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <CustomLegend />
        <div
          className="h-96 w-full"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.9), transparent 80px, transparent calc(100% - 80px), rgba(255,255,255,0.9))",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="monthShort"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                tickFormatter={(value) => `$${value}`}
                domain={[0, 1200]}
                ticks={[0, 200, 400, 600, 800, 1000, 1200]}
              />
              <Line
                type="monotone"
                dataKey="hired"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{
                  r: 5,
                  fill: "#06b6d4",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="resigned"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={<CustomDot />}
                activeDot={{
                  r: 5,
                  fill: "#9ca3af",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gradient overlays for the fade effect */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default EmployeeGrowthChart;
