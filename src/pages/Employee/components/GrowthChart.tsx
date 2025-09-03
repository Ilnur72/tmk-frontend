import React from "react";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Types
interface EARSData {
  employes: number;
  month: string;
}

interface ChartData {
  month: string;
  monthShort: string;
  employees: number;
  growth: number;
}

// API Service
const apiService = {
  async getEARSDashboard(): Promise<EARSData[]> {
    const response = await axios.get(
      "/employers/EARSDashboard"
    );
    return response.data;
  },
};

// Custom hook for EARS data
const useEARSData = () => {
  return useQuery<EARSData[]>({
    queryKey: ["earsDashboard"],
    queryFn: apiService.getEARSDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Month names mapping
const monthNames: { [key: number]: { full: string; short: string } } = {
  0: { full: "Январь", short: "Jan" },
  1: { full: "Февраль", short: "Feb" },
  2: { full: "Март", short: "Mar" },
  3: { full: "Апрель", short: "Apr" },
  4: { full: "Май", short: "May" },
  5: { full: "Июнь", short: "Jun" },
  6: { full: "Июль", short: "Jul" },
  7: { full: "Август", short: "Aug" },
  8: { full: "Сентябрь", short: "Sep" },
  9: { full: "Октябрь", short: "Oct" },
  10: { full: "Ноябрь", short: "Nov" },
  11: { full: "Декабрь", short: "Dec" },
};

// Data transformation function
const transformData = (data: EARSData[]): ChartData[] => {
  // Sort by date (oldest first for proper growth calculation)
  const sortedData = [...data].sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  return sortedData.map((item, index) => {
    const date = new Date(item.month);
    const monthIndex = date.getMonth();
    const previousEmployees =
      index > 0 ? sortedData[index - 1].employes : item.employes;
    const growth = item.employes - previousEmployees;

    return {
      month: monthNames[monthIndex].full,
      monthShort: monthNames[monthIndex].short,
      employees: item.employes,
      growth: growth,
    };
  });
};

// Custom Legend Component
const CustomLegend: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-6 mb-4">
      <div className="flex items-center">
        <div className="w-4 h-0.5 bg-cyan-500 mr-2"></div>
        <span className="text-sm text-gray-600">Ходимлар сони</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-0.5 border-t-2 border-dashed border-green-500 mr-2"></div>
        <span className="text-sm text-gray-600">Ўсиш (+/-)</span>
      </div>
    </div>
  );
};

// Custom Dot Component
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
  const { data: earsData, isLoading, error } = useEARSData();

  // Transform data for chart
  const chartData = earsData ? transformData(earsData) : [];

  // Get current and previous month data
  const getCurrentData = () => {
    if (!chartData.length)
      return { employees: 0, growth: 0, month: "Жорий ой" };

    const latest = chartData[chartData.length - 1];
    return {
      employees: latest.employees,
      growth: latest.growth,
      month: "Жорий ой",
    };
  };

  const getPreviousData = () => {
    if (chartData.length < 2)
      return { employees: 0, growth: 0, month: "Аввалги ой" };

    const previous = chartData[chartData.length - 2];
    return {
      employees: previous.employees,
      growth: previous.growth,
      month: "Аввалги ой",
    };
  };

  const currentData = getCurrentData();
  const previousData = getPreviousData();

  if (isLoading) {
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
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-56"
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="h-96 bg-red-50 rounded-lg flex items-center justify-center">
          <p className="text-red-500">Маълумотларни юклашда хатолик юз берди</p>
        </div>
      </div>
    );
  }

  const minEmployees = Math.min(...chartData.map((d) => d.employees));
  const maxEmployees = Math.max(...chartData.map((d) => d.employees));
  const padding = (maxEmployees - minEmployees) * 0.1;

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
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-56"
            placeholder="Сана танланг"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="flex">
          <div>
            <div className="text-lg font-medium text-blue-600 xl:text-xl">
              Ходимлар: {currentData.employees.toLocaleString()}
              <br />
              Ўсиш: {currentData.growth > 0 ? "+" : ""}
              {currentData.growth}
            </div>
            <div className="mt-0.5 text-gray-500">{currentData.month}</div>
          </div>
          <div className="mx-4 h-12 w-px border border-dashed border-gray-200 xl:mx-5"></div>
          <div>
            <div className="text-lg font-medium text-gray-500 xl:text-xl">
              Ходимлар: {previousData.employees.toLocaleString()}
              <br />
              Ўсиш: {previousData.growth > 0 ? "+" : ""}
              {previousData.growth}
            </div>
            <div className="mt-0.5 text-gray-500">{previousData.month}</div>
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
                tickFormatter={(value) => value.toLocaleString()}
                domain={[minEmployees - padding, maxEmployees + padding]}
              />
              <Line
                type="monotone"
                dataKey="employees"
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
                dataKey="growth"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={<CustomDot />}
                activeDot={{
                  r: 5,
                  fill: "#10b981",
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
