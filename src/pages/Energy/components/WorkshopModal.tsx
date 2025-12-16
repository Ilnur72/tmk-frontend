import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { energyService } from "../../../services/energyService";
import { Workshop } from "../../../types/energy";
import { toast } from "../../../utils/toast";

interface WorkshopModalProps {
  workshop?: Workshop | null;
  factoryId: number;
  onClose: (updated?: boolean) => void;
}

const WorkshopModal: React.FC<WorkshopModalProps> = ({
  workshop,
  factoryId,
  onClose,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: workshop?.name || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Workshop name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Workshop name must be at least 3 characters";
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
      if (workshop) {
        // Update existing workshop
        await energyService.updateWorkshop(workshop.id, {
          name: formData.name.trim(),
        });
        toast.success("Workshop updated successfully");
      } else {
        // Create new workshop
        await energyService.createWorkshop({
          name: formData.name.trim(),
          factory_id: factoryId,
        });
        toast.success("Workshop created successfully");
      }
      onClose(true);
    } catch (error: any) {
      console.error("Error saving workshop:", error);
      toast.error(
        workshop ? "Failed to update workshop" : "Failed to create workshop"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {workshop ? t("energy.workshop.edit") : t("energy.workshop.create")}
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
            {/* Workshop Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("energy.workshop.name")} *
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
                placeholder="Enter workshop name"
                disabled={loading}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

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

export default WorkshopModal;
