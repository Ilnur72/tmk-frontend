import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { meterOperatorService } from "../services/meterOperatorService";
import { toast } from "../../../utils/toast";
import { Meter, User } from "../../../types/energy";
import { Clock, Zap, Droplets, Flame, Save } from "lucide-react";

interface DailyReadingsProps {
  operatorData: User | null;
}

const DailyReadings: React.FC<DailyReadingsProps> = ({ operatorData }) => {
  const { t } = useTranslation();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [readings, setReadings] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "electricity" | "gas" | "water"
  >("all");

  useEffect(() => {
    fetchOperatorMeters();
  }, [operatorData]);

  const fetchOperatorMeters = async () => {
    try {
      setLoading(true);
      const data = await meterOperatorService.getMyMeters();
      console.log("Meters ma'lumotlari:", data); // Debug
      setMeters(data);

      // Initialize readings state
      const initialReadings: { [key: number]: string } = {};
      data.forEach((meter) => {
        console.log(`Meter ${meter.id}:`, {
          last_reading_value: meter.last_reading_value,
          last_reading_date: meter.last_reading_date,
          latest_reading: meter.latest_reading,
        }); // Debug
        initialReadings[meter.id] = "";
      });
      setReadings(initialReadings);
    } catch (error: any) {
      console.error("Error fetching meters:", error);
      if (error?.response?.status === 401) {
        toast.error(t("meter_operators.readings.session_expired"));
        // Token tozalash va login sahifasiga yo'naltirish
        localStorage.removeItem("meterOperatorAuthToken");
        localStorage.removeItem("meterOperatorToken");
        window.location.reload();
      } else {
        toast.error(t("meter_operators.readings.load_meters_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReadingChange = (meterId: number, value: string) => {
    setReadings((prev) => ({
      ...prev,
      [meterId]: value,
    }));
  };

  const getMeterIcon = (type: string) => {
    switch (type) {
      case "electricity":
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case "water":
        return <Droplets className="h-6 w-6 text-blue-500" />;
      case "gas":
        return <Flame className="h-6 w-6 text-orange-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const filteredMeters = meters.filter((meter) => {
    return activeTab === "all" || meter.meter_type === activeTab;
  });
  console.log("Filtered Meters:", filteredMeters);
  const handleSubmitReading = async (meterId: number) => {
    const readingValue = readings[meterId];

    if (!readingValue || parseFloat(readingValue) <= 0) {
      toast.error(t("meter_operators.readings.enter_valid_reading"));
      return;
    }

    try {
      setSubmitting(true);
      await meterOperatorService.createMyMeterReading({
        meter_id: meterId,
        current_reading: parseFloat(readingValue),
        reading_date: new Date().toISOString(),
        notes: operatorData
          ? `Reading submitted by ${operatorData.first_name} ${operatorData.last_name}`
          : "Reading submitted by operator",
      });

      toast.success(t("meter_operators.readings.reading_submit_success"));
      setReadings((prev) => ({
        ...prev,
        [meterId]: "",
      }));

      // Refresh meters to get latest readings
      fetchOperatorMeters();
    } catch (error: any) {
      console.error("Error submitting reading:", error);
      toast.error(t("meter_operators.readings.reading_submit_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const getMeterTypeColor = (type: string) => {
    switch (type) {
      case "electricity":
        return "bg-yellow-100 text-yellow-800";
      case "water":
        return "bg-blue-100 text-blue-800";
      case "gas":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("meter_operators.readings.title")}
        </h2>
        <p className="text-gray-600">{t("meter_operators.subtitle")}</p>
      </div>

      {/* Meter Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              {
                key: "all",
                label: t("energy_management.readings.filters.all"),
                icon: "📊",
                count: meters.length,
              },
              {
                key: "electricity",
                label: t("energy_management.meters.types.electricity"),
                icon: "⚡",
                count: meters.filter((m) => m.meter_type === "electricity")
                  .length,
              },
              {
                key: "water",
                label: t("energy_management.meters.types.water"),
                icon: "💧",
                count: meters.filter((m) => m.meter_type === "water").length,
              },
              {
                key: "gas",
                label: t("energy_management.meters.types.gas"),
                icon: "🔥",
                count: meters.filter((m) => m.meter_type === "gas").length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {meters.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("meter_operators.meters.no_meters")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("meter_operators.meters.no_meters")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeters.map((meter) => (
            <div
              key={meter.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getMeterIcon(meter.meter_type)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {meter.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMeterTypeColor(
                        meter.meter_type
                      )}`}
                    >
                      {t(`energy.meter.${meter.meter_type}`)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  {t("meter_operators.meters.location")}
                </p>
                <p className="font-medium">{meter.workshop?.name || "N/A"}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("meter_operators.readings.current_reading")}
                    </label>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {`${t("meter_operators.readings.last_reading")}: ${
                        meter.latest_reading ||
                        meter.last_reading_value ||
                        t("meter_operators.readings.no_last_reading")
                      }`}
                      {meter.last_reading_date && (
                        <p className="text-xs text-gray-400">
                          {new Date(
                            meter.last_reading_date
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={readings[meter.id] || ""}
                    onChange={(e) =>
                      handleReadingChange(meter.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t("meter_operators.readings.current_reading")}
                  />
                </div>

                <button
                  onClick={() => handleSubmitReading(meter.id)}
                  disabled={submitting || !readings[meter.id]}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t("meter_operators.readings.save_reading")}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyReadings;
