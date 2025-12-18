import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit3, Trash2, Search, Filter } from "lucide-react";
import { energyService } from "../../../services/energyService";
import { Workshop } from "../../../types/energy";
import { toast } from "../../../utils/toast";
import WorkshopModal from "../../Energy/components/WorkshopModal";

interface WorkshopsListProps {
  factoryId?: number | null;
}

const WorkshopsList: React.FC<WorkshopsListProps> = ({ factoryId }) => {
  const { t } = useTranslation();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchWorkshops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryId]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      let data;

      if (factoryId) {
        // Admin or specific factory access
        data = await energyService.getWorkshopsByFactory(factoryId);
      } else {
        // Admin access - get all workshops
        data = await energyService.getAllWorkshops();
      }

      setWorkshops(data);
    } catch (error: any) {
      console.error("Error fetching workshops:", error);
      toast.error("Failed to load workshops");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorkshop(null);
    setIsModalOpen(true);
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await energyService.deleteWorkshop(id);
      toast.success("Workshop deleted successfully");
      fetchWorkshops();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting workshop:", error);

      // Check if it's a "not implemented" error
      if (error.message && error.message.includes("not implemented")) {
        toast.error(
          "Workshop o'chirish funksiyasi hali backend da ishlab chiqilmagan"
        );
      } else {
        toast.error("Failed to delete workshop");
      }

      setDeleteConfirm(null); // Close the confirmation dialog even if deletion fails
    }
  };

  const handleModalClose = (updated?: boolean) => {
    setIsModalOpen(false);
    setEditingWorkshop(null);
    if (updated) {
      fetchWorkshops();
    }
  };

  const filteredWorkshops = workshops.filter((workshop) =>
    workshop.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 max-md:text-xl">
            {t("energy.workshop.list")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("energy.workshop.total")}: {workshops.length}
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!factoryId}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            factoryId
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          title={
            !factoryId
              ? "Please select a specific factory to create workshops"
              : ""
          }
        >
          <Plus className="w-4 h-4" />
          <span>{t("energy.workshop.create")}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t("energy.common.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>{t("energy.common.filter")}</span>
          </button>
        </div>
      </div>

      {/* Workshops Grid */}
      {filteredWorkshops.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">{t("energy.common.no_data")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {workshop.name || "N/A"}
                  </h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>ID: {workshop.id}</p>
                    <p>
                      {t("energy.common.created_at")}:{" "}
                      {new Date(workshop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(workshop)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(workshop.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Workshop Stats - placeholder for future metrics */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("energy.meter.total")}:
                  </span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("energy.workshop.delete")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("energy.workshop.delete_confirm")}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("energy.common.cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("energy.common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workshop Modal */}
      {isModalOpen && factoryId && (
        <WorkshopModal
          workshop={editingWorkshop}
          factoryId={factoryId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default WorkshopsList;
