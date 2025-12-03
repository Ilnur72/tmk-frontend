import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface PriceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: any;
  sourceType?: string;
  sources?: any[];
}

const PriceChartModal: React.FC<PriceChartModalProps> = ({
  isOpen,
  onClose,
  element,
  sourceType = "all",
  sources = [],
}) => {
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  // Modal ochilganda body scroll ni to'xtatish - optimized
  useEffect(() => {
    if (isOpen) {
      // Scroll pozitsiyasini saqlash
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Scroll pozitsiyasini qaytarish
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      // Cleanup
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { t } = useTranslation();
  const months = [
    { value: 1, label: t("finance.month_jan") },
    { value: 2, label: t("finance.month_feb") },
    { value: 3, label: t("finance.month_mar") },
    { value: 4, label: t("finance.month_apr") },
    { value: 5, label: t("finance.month_may") },
    { value: 6, label: t("finance.month_jun") },
    { value: 7, label: t("finance.month_jul") },
    { value: 8, label: t("finance.month_aug") },
    { value: 9, label: t("finance.month_sep") },
    { value: 10, label: t("finance.month_oct") },
    { value: 11, label: t("finance.month_nov") },
    { value: 12, label: t("finance.month_dec") },
  ];

  const years = [2023, 2024, 2025];

  useEffect(() => {
    if (element) {
      // Debug: manba nomlarini tekshirish
      console.log("PriceChartModal - sourceType:", sourceType);
      console.log("PriceChartModal - sources:", sources);
      console.log("PriceChartModal - element:", element);

      const generateMonthlyData = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const data = [];

        for (let day = 1; day <= Math.min(daysInMonth, 20); day += 3) {
          // API dan kelgan manbalar asosida ma'lumot yaratish
          const basePrice: any = {};

          // Qattiq kodlangan fallback manbalar
          const defaultSources = [
            "FastMarkets",
            "ArgusMetals",
            "ShanghaiMetals",
            "LMELondon",
          ];

          // API dan kelgan manbalar
          const apiSourceNames = sources.map((s) => s.name);

          // Barcha manbalar uchun narxlar yaratish
          const allSources = defaultSources.concat(
            apiSourceNames.filter((name) => !defaultSources.includes(name))
          );

          allSources.forEach((sourceName) => {
            const baseValue = sourceName.includes("FastMarkets")
              ? 32000
              : sourceName.includes("Argus")
              ? 35000
              : sourceName.includes("Shanghai")
              ? 17000
              : sourceName.includes("LME")
              ? 42000
              : 30000;

            basePrice[sourceName] = Math.round(
              baseValue + Math.random() * 2000 - 1000
            );
          });

          data.push({
            date: `${selectedYear}-${selectedMonth
              .toString()
              .padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
            ...basePrice,
          });
        }

        return data;
      };

      setPriceHistory(generateMonthlyData());
    }
  }, [element, selectedYear, selectedMonth, sourceType, sources]);

  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
      return "0 " + t("finance.soum");
    }
    return (
      new Intl.NumberFormat("uz-UZ").format(value) + " " + t("finance.soum")
    );
  };

  // Source nomlarini olish
  const getSourceName = (sourceType: string) => {
    if (sourceType === "all") {
      return t("finance.all_sources");
    }
    const foundSource = sources.find((s) => s.name === sourceType);
    if (foundSource) {
      return foundSource.name;
    }
    const sourceNames: { [key: string]: string } = {
      FastMarkets: "FastMarkets",
      ArgusMetals: "Argus Metals",
      ShanghaiMetals: "Shanghai Metals",
      LMELondon: "LME London",
    };
    return sourceNames[sourceType] || sourceType;
  };

  // Filtrlangan ma'lumotlar
  const getFilteredData = () => {
    if (sourceType === "all") {
      return priceHistory;
    }

    // Faqat tanlangan source uchun ma'lumotlarni qaytarish
    return priceHistory.map((item) => {
      // Source nomini moslash - API dan kelgan nom bilan qattiq kodlangan nomni moslash
      let actualSourceKey = sourceType;

      // Argus Metal -> ArgusMetals mapping
      if (sourceType.includes("Argus")) {
        actualSourceKey = "ArgusMetals";
      } else if (sourceType.includes("Shanghai")) {
        actualSourceKey = "ShanghaiMetals";
      } else if (sourceType.includes("LME")) {
        actualSourceKey = "LMELondon";
      } else if (sourceType.includes("FastMarkets")) {
        actualSourceKey = "FastMarkets";
      }

      return {
        date: item.date,
        [sourceType]: item[actualSourceKey] || 0, // original key ni saqlash
        actualValue: item[actualSourceKey] || 0, // debugging uchun
      };
    });
  };

  // Ranglarni olish
  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      FastMarkets: "#3B82F6",
      ArgusMetals: "#10B981",
      ShanghaiMetals: "#F59E0B",
      LMELondon: "#EF4444",
    };
    return colors[source] || "#3B82F6";
  };

  // Framer Motion animatsiya konfiguratsiyasi
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 30,
        stiffness: 400,
        duration: 0.25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.15,
      },
    },
  };

  // Line componentlarini yaratish
  const renderLines = () => {
    if (sourceType === "all") {
      return (
        <>
          <Line
            type="monotone"
            dataKey="FastMarkets"
            stroke="#3B82F6"
            strokeWidth={2}
            name="FastMarkets"
          />
          <Line
            type="monotone"
            dataKey="ArgusMetals"
            stroke="#10B981"
            strokeWidth={2}
            name="Argus Metals"
          />
          <Line
            type="monotone"
            dataKey="ShanghaiMetals"
            stroke="#F59E0B"
            strokeWidth={2}
            name="Shanghai Metals"
          />
          <Line
            type="monotone"
            dataKey="LMELondon"
            stroke="#EF4444"
            strokeWidth={2}
            name="LME London"
          />
        </>
      );
    } else {
      return (
        <Line
          type="monotone"
          dataKey={sourceType}
          stroke={getSourceColor(sourceType)}
          strokeWidth={3}
          name={getSourceName(sourceType)}
        />
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              aria-hidden="true"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl w-full max-w-6xl h-[85vh] flex flex-col"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto flex-1">
                <div className="w-full">
                  <motion.h3
                    className="text-lg leading-6 font-medium text-gray-900 mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {element?.elementName} - {getSourceName(sourceType)}{" "}
                    {t("finance.price_history")}
                  </motion.h3>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label
                          htmlFor="year"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("finance.year")}
                        </label>
                        <select
                          id="year"
                          value={selectedYear}
                          onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                          }
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label
                          htmlFor="month"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("finance.month")}
                        </label>
                        <select
                          id="month"
                          value={selectedMonth}
                          onChange={(e) =>
                            setSelectedMonth(Number(e.target.value))
                          }
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        >
                          {months.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <motion.div
                      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {/* Price History Table */}
                      <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {t("finance.price_history")}
                        </h4>
                        <div
                          className="overflow-y-auto space-y-2 pr-2"
                          style={{ maxHeight: "45vh" }}
                        >
                          {getFilteredData().map((item, index) => (
                            <motion.div
                              key={index}
                              className="bg-gray-50 p-3 rounded-lg text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                              whileHover={{
                                scale: 1.02,
                                backgroundColor: "#f3f4f6",
                              }}
                            >
                              <div className="font-medium text-gray-900 mb-2">
                                {new Date(item.date).toLocaleDateString(
                                  "uz-UZ"
                                )}
                              </div>
                              <div className="space-y-1">
                                {sourceType === "all" ? (
                                  // Barcha sourcelarni ko'rsatish
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-blue-600">
                                        FastMarkets:
                                      </span>
                                      <span>
                                        {formatCurrency(item.FastMarkets)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-green-600">
                                        Argus Metals:
                                      </span>
                                      <span>
                                        {formatCurrency(item.ArgusMetals)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-yellow-600">
                                        Shanghai:
                                      </span>
                                      <span>
                                        {formatCurrency(item.ShanghaiMetals)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-red-600">
                                        LME London:
                                      </span>
                                      <span>
                                        {formatCurrency(item.LMELondon)}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  // Faqat tanlangan sourceни ko'rsatish
                                  <div className="flex justify-between">
                                    <span
                                      style={{
                                        color: getSourceColor(sourceType),
                                      }}
                                    >
                                      {getSourceName(sourceType)}:
                                    </span>
                                    <span className="font-semibold">
                                      {item[sourceType] !== undefined &&
                                      item[sourceType] !== null
                                        ? formatCurrency(item[sourceType])
                                        : t("finance.no_data")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Chart */}
                      <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {t("finance.price_chart")}
                        </h4>
                        <motion.div
                          style={{ height: "45vh", minHeight: "300px" }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getFilteredData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getDate()}-${t(
                                    "finance.day"
                                  )}`;
                                }}
                              />
                              <YAxis
                                tickFormatter={(value) => {
                                  if (
                                    isNaN(value) ||
                                    value === null ||
                                    value === undefined
                                  ) {
                                    return "0";
                                  }
                                  return new Intl.NumberFormat("uz-UZ", {
                                    notation: "compact",
                                  }).format(value);
                                }}
                              />
                              <Tooltip
                                formatter={(value: number) => {
                                  if (
                                    isNaN(value) ||
                                    value === null ||
                                    value === undefined
                                  ) {
                                    return ["Маълумот йўқ", ""];
                                  }
                                  return [formatCurrency(value), ""];
                                }}
                                labelFormatter={(label) => {
                                  const date = new Date(label);
                                  return `${date.getDate()}-${t(
                                    "finance.day"
                                  )}, ${
                                    months.find(
                                      (m) => m.value === date.getMonth() + 1
                                    )?.label
                                  } ${date.getFullYear()}`;
                                }}
                              />
                              <Legend />
                              {renderLines()}
                            </LineChart>
                          </ResponsiveContainer>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("finance.close")}
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PriceChartModal;
