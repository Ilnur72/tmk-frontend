import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { energyService } from "../../../services/energyService";
import { Meter, Workshop } from "../../../types/energy";
import { toast } from "../../../utils/toast";

interface MeterModalProps {
  meter?: Meter | null;
  factoryId: number;
  workshops: Workshop[];
  onClose: (updated?: boolean) => void;
}

const MeterModal: React.FC<MeterModalProps> = ({
  meter,
  factoryId,
  workshops,
  onClose,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: meter?.name || "",
    serial_number: meter?.serial_number || "",
    type:
      meter?.meter_type || ("electricity" as "electricity" | "water" | "gas"),
    level: meter?.level || ("factory_main" as "factory_main" | "workshop"),
    workshop_id: meter?.workshop_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Meter name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Meter name must be at least 3 characters";
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required";
    } else if (formData.serial_number.trim().length < 3) {
      newErrors.serial_number = "Serial number must be at least 3 characters";
    }

    if (formData.level === "workshop" && !formData.workshop_id) {
      newErrors.workshop_id = "Workshop is required for workshop level meters";
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
      const meterData = {
        name: formData.name.trim(),
        serial_number: formData.serial_number.trim(),
        type: formData.type,
        level: formData.level,
        factory_id: factoryId,
        workshop_id:
          formData.level === "workshop"
            ? Number(formData.workshop_id)
            : undefined,
      };

      if (meter) {
        // Update existing meter
        await energyService.updateMeter(meter.id, meterData);
        toast.success("Meter updated successfully");
      } else {
        // Create new meter
        await energyService.createMeter(meterData);
        toast.success("Meter created successfully");
      }
      onClose(true);
    } catch (error: any) {
      console.error("Error saving meter:", error);
      toast.error(meter ? "Failed to update meter" : "Failed to create meter");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear workshop_id if level changes to factory_main
    if (name === "level" && value === "factory_main") {
      setFormData((prev) => ({
        ...prev,
        workshop_id: "",
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {meter ? t("energy.meter.edit") : t("energy.meter.create")}
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
            {/* Meter Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.meter.name")} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter meter name"
                disabled={loading}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Serial Number */}
            <div>
              <label
                htmlFor="serial_number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.meter.serial_number")} *
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.serial_number ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter serial number"
                disabled={loading}
                required
              />
              {errors.serial_number && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.serial_number}
                </p>
              )}
            </div>

            {/* Meter Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.meter.type")} *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              >
                <option value="electricity">
                  {t("energy.meter.electricity")}
                </option>
                <option value="water">{t("energy.meter.water")}</option>
                <option value="gas">{t("energy.meter.gas")}</option>
              </select>
            </div>

            {/* Meter Level */}
            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.meter.level")} *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              >
                <option value="factory_main">
                  {t("energy.meter.factory_main")}
                </option>
                <option value="workshop">{t("energy.meter.workshop")}</option>
              </select>
            </div>

            {/* Workshop Selection (only if level is workshop) */}
            {formData.level === "workshop" && (
              <div>
                <label
                  htmlFor="workshop_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("energy.meter.workshop")} *
                </label>
                <select
                  id="workshop_id"
                  name="workshop_id"
                  value={formData.workshop_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.workshop_id ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={loading}
                  required
                >
                  <option value="">Select workshop</option>
                  {workshops.map((workshop) => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </option>
                  ))}
                </select>
                {errors.workshop_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.workshop_id}
                  </p>
                )}
              </div>
            )}

            {/* Factory ID Display (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factory ID
              </label>
              <input
                type="text"
                value={factoryId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                disabled
                readOnly
              />
            </div>
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

export default MeterModal;
