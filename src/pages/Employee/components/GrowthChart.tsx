import React, { useState, useMemo } from "react";
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
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

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
  date: Date;
}

interface DateRange {
  start: string;
  end: string;
}

// API Service
const apiService = {
  async getEARSDashboard(): Promise<EARSData[]> {
    const response = await axios.get("/employers/EARSDashboard");
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
  0: { full: "Январь", short: "Янв" },
  1: { full: "Февраль", short: "Фев" },
  2: { full: "Март", short: "Мар" },
  3: { full: "Апрель", short: "Апр" },
  4: { full: "Май", short: "Май" },
  5: { full: "Июнь", short: "Июн" },
  6: { full: "Июль", short: "Июл" },
  7: { full: "Август", short: "Авг" },
  8: { full: "Сентябрь", short: "Сен" },
  9: { full: "Октябрь", short: "Окт" },
  10: { full: "Ноябрь", short: "Ноя" },
  11: { full: "Декабрь", short: "Дек" },
};

// Data transformation function
const transformData = (data: EARSData[]): ChartData[] => {
  // Check if data exists and is an array
  if (!data || !Array.isArray(data)) {
    return [];
  }

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
      date: date,
    };
  });
};

// Date filter function
const filterDataByDateRange = (
  data: ChartData[],
  dateRange: DateRange | null
): ChartData[] => {
  // Check if data is valid array
  if (!data || !Array.isArray(data)) return [];
  if (!dateRange || !dateRange.start || !dateRange.end) return data;

  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  return data.filter((item) => {
    const itemDate = item.date;
    return itemDate >= startDate && itemDate <= endDate;
  });
};

// Get predefined date ranges
const getDateRangeOptions = (data: ChartData[], t: any) => {
  if (!data || !Array.isArray(data) || !data.length) return [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return [
    {
      label: t("growth_chart.last_3_months"),
      value: "last3months",
      start: new Date(currentYear, currentMonth - 2, 1)
        .toISOString()
        .split("T")[0],
      end: new Date(currentYear, currentMonth + 1, 0)
        .toISOString()
        .split("T")[0],
    },
    {
      label: t("growth_chart.last_6_months"),
      value: "last6months",
      start: new Date(currentYear, currentMonth - 5, 1)
        .toISOString()
        .split("T")[0],
      end: new Date(currentYear, currentMonth + 1, 0)
        .toISOString()
        .split("T")[0],
    },
    {
      label: t("growth_chart.last_year"),
      value: "lastyear",
      start: new Date(currentYear - 1, currentMonth, 1)
        .toISOString()
        .split("T")[0],
      end: new Date(currentYear, currentMonth + 1, 0)
        .toISOString()
        .split("T")[0],
    },
    {
      label: t("growth_chart.all_data"),
      value: "all",
      start: "",
      end: "",
    },
  ];
};

// Custom Legend Component
const CustomLegend: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center space-x-6 mb-4">
      <div className="flex items-center">
        <div className="w-4 h-0.5 bg-cyan-500 mr-2"></div>
        <span className="text-sm text-gray-600">
          {t("growth_chart.employee_count")}
        </span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-0.5 border-t-2 border-dashed border-green-500 mr-2"></div>
        <span className="text-sm text-gray-600">
          {t("growth_chart.growth_change")}
        </span>
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

// Custom Tooltip Component
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-sm text-gray-600">Ходимлар:</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {payload[0]?.value?.toLocaleString()}
            </span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Ўсиш:</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  payload[1].value > 0
                    ? "text-green-600"
                    : payload[1].value < 0
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {payload[1].value > 0 ? "+" : ""}
                {payload[1]?.value?.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const EmployeeGrowthChart: React.FC = () => {
  const { t } = useTranslation();
  const { data: earsData, isLoading, error } = useEARSData();

  // State for date filtering
  const [selectedRange, setSelectedRange] = useState<string>("last6months");
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: "",
    end: "",
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Transform and filter data
  const allChartData = useMemo(() => {
    return earsData ? transformData(earsData) : [];
  }, [earsData]);

  const dateRangeOptions = getDateRangeOptions(allChartData, t);

  const filteredChartData = useMemo(() => {
    if (selectedRange === "custom") {
      return filterDataByDateRange(allChartData, customDateRange);
    } else if (selectedRange === "all") {
      return allChartData;
    } else {
      const selectedOption = dateRangeOptions.find(
        (opt) => opt.value === selectedRange
      );
      if (selectedOption) {
        return filterDataByDateRange(allChartData, {
          start: selectedOption.start,
          end: selectedOption.end,
        });
      }
    }
    return allChartData;
  }, [allChartData, selectedRange, customDateRange, dateRangeOptions]);

  // Get current and previous month data from filtered data
  const getCurrentData = () => {
    if (!filteredChartData.length)
      return { employees: 0, growth: 0, month: "Жорий ой" };

    const latest = filteredChartData[filteredChartData.length - 1];
    return {
      employees: latest.employees,
      growth: latest.growth,
      month: "Жорий ой",
    };
  };

  const getPreviousData = () => {
    if (filteredChartData.length < 2)
      return { employees: 0, growth: 0, month: "Аввалги ой" };

    const previous = filteredChartData[filteredChartData.length - 2];
    return {
      employees: previous.employees,
      growth: previous.growth,
      month: "Аввалги ой",
    };
  };

  const currentData = getCurrentData();
  const previousData = getPreviousData();

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setSelectedRange(value);
    if (value === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (field: "start" | "end", value: string) => {
    setCustomDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {t("growth_chart.employee_growth_title")}
          </h2>
          <div className="relative mt-3 sm:mt-0">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select className="pl-10 pr-8 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-56 appearance-none bg-white">
              <option>{t("growth_chart.loading")}</option>
            </select>
          </div>
        </div>

        <div className="h-96 bg-white rounded-lg flex items-center justify-center animate-pulse">
          <p className="text-gray-400">{t("growth_chart.chart_loading")}</p>
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

  const minEmployees =
    filteredChartData.length > 0
      ? Math.min(...filteredChartData.map((d) => d.employees))
      : 0;
  const maxEmployees =
    filteredChartData.length > 0
      ? Math.max(...filteredChartData.map((d) => d.employees))
      : 0;
  const padding = (maxEmployees - minEmployees) * 0.1;

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t("growth_chart.employee_growth_title")}
        </h2>
        <div className="flex flex-col gap-2 mt-3 sm:mt-0">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary w-full sm:w-56 appearance-none bg-white"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="custom">Мусофт сана</option>
            </select>
          </div>

          {/* Custom date picker */}
          {showCustomDatePicker && (
            <div className="flex gap-2 mt-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  handleCustomDateChange("start", e.target.value)
                }
                className="px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Бошланиш"
              />
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => handleCustomDateChange("end", e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Тугаш"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="flex">
          <div>
            <div className="text-lg font-medium text-blue-600 xl:text-xl">
              {t("growth_chart.employees")}:{" "}
              {currentData.employees.toLocaleString()}
              <br />
              {t("growth_chart.growth")}: {currentData.growth > 0 ? "+" : ""}
              {currentData.growth}
            </div>
            <div className="mt-0.5 text-gray-500">{currentData.month}</div>
          </div>
          <div className="mx-4 h-12 w-px border border-dashed border-gray-200 xl:mx-5"></div>
          <div>
            <div className="text-lg font-medium text-gray-500 xl:text-xl">
              {t("growth_chart.employees")}:{" "}
              {previousData.employees.toLocaleString()}
              <br />
              {t("growth_chart.growth")}: {previousData.growth > 0 ? "+" : ""}
              {previousData.growth}
            </div>
            <div className="mt-0.5 text-gray-500">{previousData.month}</div>
          </div>
        </div>
        {filteredChartData.length > 0 && (
          <div className="mt-4 md:mt-0 md:ml-auto">
            <div className="text-sm text-gray-500">
              Кўрсатилган давр: {filteredChartData.length} ой
            </div>
          </div>
        )}
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
              data={filteredChartData}
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
                domain={[
                  minEmployees - padding || 0,
                  maxEmployees + padding || 1000,
                ]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
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

      {/* No data message */}
      {filteredChartData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Танланган давр учун маълумот топилмади
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeGrowthChart;
