import React, { useState, useEffect } from "react";
import { meterOperatorService } from "../services/meterOperatorService";
import { toast } from "../../../utils/toast";
import { MeterReading, User } from "../../../types/energy";
import {
  Clock,
  Zap,
  Droplets,
  Flame,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface MyReadingsHistoryProps {
  operatorData: User | null;
}

const MyReadingsHistory: React.FC<MyReadingsHistoryProps> = ({
  operatorData,
}) => {
  // const { t } = useTranslation();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "electricity" | "gas" | "water"
  >("all");

  useEffect(() => {
    fetchMyReadings();
  }, []);

  const fetchMyReadings = async () => {
    try {
      setLoading(true);
      const data = await meterOperatorService.getMyReadings();
      setReadings(data.data);
    } catch (error: any) {
      console.error("Error fetching readings:", error);
      toast.error("Failed to load reading history");
    } finally {
      setLoading(false);
    }
  };

  const filteredReadings = readings.filter((reading) => {
    if (activeTab === "all") return true;
    // Assuming meter object has meter_type property accessible through reading
    return reading.meter?.meter_type === activeTab;
  });

  const getMeterIcon = (type: string) => {
    switch (type) {
      case "electricity":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "water":
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case "gas":
        return <Flame className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUnit = (type: string) => {
    return type === "electricity" ? "kWh" : "m³";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          My Readings History
        </h2>
        <p className="text-gray-600 mt-2">
          View all your submitted meter readings
        </p>
      </div>

      {/* Meter Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              {
                key: "all",
                label: "Barcha o'qishlar",
                icon: "📊",
                count: readings.length,
              },
              {
                key: "electricity",
                label: "Elektr energiya",
                icon: "⚡",
                count: readings.filter(
                  (r) => r.meter?.meter_type === "electricity"
                ).length,
              },
              {
                key: "gas",
                label: "Gaz",
                icon: "🔥",
                count: readings.filter((r) => r.meter?.meter_type === "gas")
                  .length,
              },
              {
                key: "water",
                label: "Suv",
                icon: "💧",
                count: readings.filter((r) => r.meter?.meter_type === "water")
                  .length,
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

      {readings.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No readings found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't submitted any readings yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredReadings.map((reading) => (
              <li key={reading.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getMeterIcon(reading.meter?.meter_type || "unknown")}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {reading.meter?.name || `Meter ${reading.meter_id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reading.meter?.meter_type || "Unknown type"} meter
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {reading.current_reading?.toLocaleString() || "0"}{" "}
                          {getUnit(reading.meter?.meter_type || "electricity")}
                        </p>
                        {reading.consumption && (
                          <p className="text-sm text-gray-500">
                            Consumption:{" "}
                            {reading.consumption?.toLocaleString() || "0"}{" "}
                            {getUnit(
                              reading.meter?.meter_type || "electricity"
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        {reading.is_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Reading Date:{" "}
                        {new Date(reading.reading_date).toLocaleDateString()}
                      </p>
                      {reading.submission_time && (
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Submitted:{" "}
                          {new Date(
                            reading.submission_time
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      {reading.is_late && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Late
                        </span>
                      )}
                    </div>
                  </div>
                  {reading.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{reading.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyReadingsHistory;
