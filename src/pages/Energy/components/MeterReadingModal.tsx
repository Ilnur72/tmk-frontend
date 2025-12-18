import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { energyService } from "../../../services/energyService";
import { MeterReading, Meter } from "../../../types/energy";
import { toast } from "../../../utils/toast";

interface MeterReadingModalProps {
  reading?: MeterReading | null;
  meters: Meter[];
  onClose: (updated?: boolean) => void;
}

const MeterReadingModal: React.FC<MeterReadingModalProps> = ({
  reading,
  meters,
  onClose,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    meter_id: reading?.meter_id || "",
    value: reading?.current_reading || "",
    reading_date: reading?.reading_date
      ? reading.reading_date.split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: reading?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.meter_id) {
      newErrors.meter_id = "Meter is required";
    }

    if (!formData.value || Number(formData.value) < 0) {
      newErrors.value = "Valid reading value is required";
    }

    if (!formData.reading_date) {
      newErrors.reading_date = "Reading date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const readingData = {
        meter_id: Number(formData.meter_id),
        value: Number(formData.value),
        reading_date: formData.reading_date,
        notes: formData.notes.trim() || undefined,
      };

      if (reading) {
        // Update existing reading
        await energyService.updateMeterReading(reading.id, readingData);
        toast.success("Reading updated successfully");
      } else {
        // Create new reading
        const createData = {
          meter_id: Number(formData.meter_id),
          current_reading: Number(formData.value),
          reading_date: formData.reading_date,
          notes: formData.notes.trim() || undefined,
        };
        await energyService.createMeterReading(createData);
        toast.success("Reading created successfully");
      }
      onClose(true);
    } catch (error: any) {
      console.error("Error saving reading:", error);
      toast.error(
        reading ? "Failed to update reading" : "Failed to create reading"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getSelectedMeter = () => {
    return meters.find((m) => m.id.toString() === formData.meter_id);
  };

  const getUnit = () => {
    const meter = getSelectedMeter();
    return meter?.meter_type === "electricity" ? "kWh" : "m³";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {reading ? t("energy.reading.edit") : t("energy.reading.create")}
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Meter Selection */}
            <div>
              <label
                htmlFor="meter_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.meter.name")} *
              </label>
              <select
                id="meter_id"
                name="meter_id"
                value={formData.meter_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.meter_id ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading || !!reading}
                required
              >
                <option value="">Select meter</option>
                {meters.map((meter) => (
                  <option key={meter.id} value={meter.id}>
                    {meter.name || "N/A"} (
                    {t(`energy.meter.${meter.meter_type}`)})
                  </option>
                ))}
              </select>
              {errors.meter_id && (
                <p className="mt-1 text-sm text-red-600">{errors.meter_id}</p>
              )}
            </div>

            {/* Reading Value */}
            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.reading.value")} *{" "}
                {formData.meter_id && `(${getUnit()})`}
              </label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.value ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter reading value"
                min="0"
                step="0.01"
                disabled={loading}
                required
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
            </div>

            {/* Reading Date */}
            <div>
              <label
                htmlFor="reading_date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.reading.reading_date")} *
              </label>
              <input
                type="date"
                id="reading_date"
                name="reading_date"
                value={formData.reading_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reading_date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
                required
              />
              {errors.reading_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.reading_date}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.reading.notes")}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any notes or observations"
                disabled={loading}
              />
            </div>

            {/* Previous Reading Info */}
            {formData.meter_id && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Selected Meter:</strong>{" "}
                  {getSelectedMeter()?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong>{" "}
                  {getSelectedMeter() &&
                    t(`energy.meter.${getSelectedMeter()!.meter_type}`)}
                </p>
                {getSelectedMeter()?.latest_reading && (
                  <p className="text-sm text-gray-600">
                    <strong>Latest Reading:</strong>{" "}
                    {getSelectedMeter()!.latest_reading?.toLocaleString() ||
                      "0"}{" "}
                    {getUnit()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              {t("energy.common.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                t("energy.common.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeterReadingModal;
