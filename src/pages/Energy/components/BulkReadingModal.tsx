import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Trash2 } from "lucide-react";
import { energyService } from "../../../services/energyService";
import { Meter, CreateMeterReadingRequest } from "../../../types/energy";
import { toast } from "../../../utils/toast";

interface BulkReadingModalProps {
  meters: Meter[];
  onClose: (updated?: boolean) => void;
}

interface ReadingEntry {
  id: string;
  meter_id: string;
  value: string;
  reading_date: string;
  notes: string;
}

const BulkReadingModal: React.FC<BulkReadingModalProps> = ({
  meters,
  onClose,
}) => {
  const { t } = useTranslation();
  const [readings, setReadings] = useState<ReadingEntry[]>([
    {
      id: "1",
      meter_id: "",
      value: "",
      reading_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addReading = () => {
    const newReading: ReadingEntry = {
      id: Date.now().toString(),
      meter_id: "",
      value: "",
      reading_date: new Date().toISOString().split("T")[0],
      notes: "",
    };
    setReadings([...readings, newReading]);
  };

  const removeReading = (id: string) => {
    if (readings.length > 1) {
      setReadings(readings.filter((r) => r.id !== id));
    }
  };

  const updateReading = (
    id: string,
    field: keyof ReadingEntry,
    value: string
  ) => {
    setReadings(
      readings.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

    // Clear error when user starts typing
    const errorKey = `${id}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    readings.forEach((reading, index) => {
      if (!reading.meter_id) {
        newErrors[`${reading.id}_meter_id`] = `Meter is required for reading ${
          index + 1
        }`;
      }

      if (!reading.value || Number(reading.value) < 0) {
        newErrors[
          `${reading.id}_value`
        ] = `Valid value is required for reading ${index + 1}`;
      }

      if (!reading.reading_date) {
        newErrors[
          `${reading.id}_reading_date`
        ] = `Date is required for reading ${index + 1}`;
      }

      // Check for duplicate meters
      const duplicateMeters = readings.filter(
        (r) => r.meter_id === reading.meter_id && r.meter_id !== ""
      );
      if (duplicateMeters.length > 1) {
        newErrors[
          `${reading.id}_meter_id`
        ] = `Meter already selected in another reading`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const readingData: CreateMeterReadingRequest[] = readings.map(
        (reading) => ({
          meter_id: Number(reading.meter_id),
          current_reading: Number(reading.value),
          reading_date: reading.reading_date,
          notes: reading.notes.trim() || undefined,
        })
      );

      await energyService.bulkCreateMeterReadings(readingData);
      toast.success(`${readings.length} readings created successfully`);
      onClose(true);
    } catch (error: any) {
      console.error("Error creating bulk readings:", error);
      toast.error("Failed to create readings");
    } finally {
      setLoading(false);
    }
  };

  const getMeterName = (meterId: string) => {
    const meter = meters.find((m) => m.id.toString() === meterId);
    return meter ? meter.name : "";
  };

  const getUnit = (meterId: string) => {
    const meter = meters.find((m) => m.id.toString() === meterId);
    return meter?.meter_type === "electricity" ? "kWh" : "m³";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("energy.reading.bulk_create")}
          </h2>
          <button
            onClick={() => onClose()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Add multiple meter readings at once. Each reading will be saved
                individually. Make sure to select different meters for each
                entry.
              </p>
            </div>

            {/* Readings List */}
            <div className="space-y-4">
              {readings.map((reading, index) => (
                <div
                  key={reading.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Reading #{index + 1}
                    </h3>
                    {readings.length > 1 && (
                      <button
                        onClick={() => removeReading(reading.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Meter Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("energy.meter.name")} *
                      </label>
                      <select
                        value={reading.meter_id}
                        onChange={(e) =>
                          updateReading(reading.id, "meter_id", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`${reading.id}_meter_id`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                      >
                        <option value="">Select meter</option>
                        {meters.map((meter) => (
                          <option key={meter.id} value={meter.id}>
                            {meter.name || "N/A"} (
                            {t(`energy.meter.${meter.meter_type}`)})
                          </option>
                        ))}
                      </select>
                      {errors[`${reading.id}_meter_id`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`${reading.id}_meter_id`]}
                        </p>
                      )}
                    </div>

                    {/* Reading Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("energy.reading.value")} *{" "}
                        {reading.meter_id && `(${getUnit(reading.meter_id)})`}
                      </label>
                      <input
                        type="number"
                        value={reading.value}
                        onChange={(e) =>
                          updateReading(reading.id, "value", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`${reading.id}_value`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter value"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                      {errors[`${reading.id}_value`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`${reading.id}_value`]}
                        </p>
                      )}
                    </div>

                    {/* Reading Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("energy.reading.reading_date")} *
                      </label>
                      <input
                        type="date"
                        value={reading.reading_date}
                        onChange={(e) =>
                          updateReading(
                            reading.id,
                            "reading_date",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`${reading.id}_reading_date`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                      />
                      {errors[`${reading.id}_reading_date`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`${reading.id}_reading_date`]}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("energy.reading.notes")}
                      </label>
                      <input
                        type="text"
                        value={reading.notes}
                        onChange={(e) =>
                          updateReading(reading.id, "notes", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter notes (optional)"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Meter Info */}
                  {reading.meter_id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Selected:</strong>{" "}
                        {getMeterName(reading.meter_id)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              onClick={addReading}
              className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors w-full justify-center"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Reading</span>
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 mt-6 pt-6 border-t">
            <button
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              {t("energy.common.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating {readings.length} readings...
                </div>
              ) : (
                `Create ${readings.length} Readings`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkReadingModal;
