import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { energyService } from "../../../services/energyService";
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

  useEffect(() => {
    fetchOperatorMeters();
  }, [operatorData]);

  const fetchOperatorMeters = async () => {
    try {
      setLoading(true);
      const data = await energyService.getMyMeters();
      setMeters(data);

      // Initialize readings state
      const initialReadings: { [key: number]: string } = {};
      data.forEach((meter) => {
        initialReadings[meter.id] = "";
      });
      setReadings(initialReadings);
    } catch (error: any) {
      console.error("Error fetching meters:", error);
      toast.error("Failed to load your meters");
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

  const handleSubmitReading = async (meterId: number) => {
    const readingValue = readings[meterId];

    if (!readingValue || parseFloat(readingValue) <= 0) {
      toast.error("Please enter a valid reading");
      return;
    }

    try {
      setSubmitting(true);
      await energyService.createMyMeterReading({
        meter_id: meterId,
        current_reading: parseFloat(readingValue),
        reading_date: new Date().toISOString(),
        notes: operatorData
          ? `Reading submitted by ${operatorData.first_name} ${operatorData.last_name}`
          : "Reading submitted by operator",
      });

      toast.success("Reading submitted successfully");
      setReadings((prev) => ({
        ...prev,
        [meterId]: "",
      }));

      // Refresh meters to get latest readings
      fetchOperatorMeters();
    } catch (error: any) {
      console.error("Error submitting reading:", error);
      toast.error("Failed to submit reading");
    } finally {
      setSubmitting(false);
    }
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
          Daily Meter Readings
        </h2>
        <p className="text-gray-600">
          Submit today's readings for your assigned meters
        </p>
      </div>

      {meters.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No meters assigned
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any meters assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meters.map((meter) => (
            <div
              key={meter.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getMeterIcon(meter.meter_type)}
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {meter.name || "N/A"}
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
                <p className="text-sm text-gray-500 mb-1">Workshop</p>
                <p className="font-medium">{meter.workshop?.name || "N/A"}</p>
              </div>

              {meter.latest_reading && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Last Reading</p>
                  <p className="font-medium">
                    {meter.latest_reading || "Ҳали қиймат киритилмаган"}
                  </p>
                  {meter.last_reading_date && (
                    <p className="text-xs text-gray-400">
                      {new Date(meter.last_reading_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Reading
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={readings[meter.id] || ""}
                    onChange={(e) =>
                      handleReadingChange(meter.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter reading..."
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
                      Submit Reading
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
