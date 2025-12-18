import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Zap,
  Droplets,
  Flame,
} from "lucide-react";
import { energyService } from "../../../services/energyService";
import { Meter, Workshop } from "../../../types/energy";
import { toast } from "../../../utils/toast";
import MeterModal from "../../Energy/components/MeterModal";

interface MetersListProps {
  factoryId?: number | null;
}

const MetersList: React.FC<MetersListProps> = ({ factoryId }) => {
  const { t } = useTranslation();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "all" | "electricity" | "gas" | "water"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let metersData, workshopsData;

      if (factoryId) {
        // Admin or specific factory access
        [metersData, workshopsData] = await Promise.all([
          energyService.getMetersByFactory(factoryId),
          energyService.getWorkshopsByFactory(factoryId),
        ]);
      } else {
        // Admin access - get all data
        [metersData, workshopsData] = await Promise.all([
          energyService.getAllMeters(),
          energyService.getAllWorkshops(),
        ]);
      }

      setMeters(metersData);
      setWorkshops(workshopsData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load meters data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMeter(null);
    setIsModalOpen(true);
  };

  const handleEdit = (meter: Meter) => {
    setEditingMeter(meter);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await energyService.deleteMeter(id);
      toast.success("Meter deleted successfully");
      fetchData();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting meter:", error);
      toast.error("Failed to delete meter");
    }
  };

  const handleModalClose = (updated?: boolean) => {
    setIsModalOpen(false);
    setEditingMeter(null);
    if (updated) {
      fetchData();
    }
  };

  const getMeterIcon = (type: string) => {
    switch (type) {
      case "electricity":
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case "water":
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case "gas":
        return <Flame className="w-5 h-5 text-orange-600" />;
      default:
        return <Zap className="w-5 h-5 text-gray-600" />;
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

  const filteredMeters = meters.filter((meter) => {
    const matchesSearch =
      meter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.workshop?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || meter.meter_type === filterType;
    const matchesLevel = filterLevel === "all" || meter.level === filterLevel;
    const matchesTab = activeTab === "all" || meter.meter_type === activeTab;

    return matchesSearch && matchesType && matchesLevel && matchesTab;
  });

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
            {t("energy.meter.list")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("energy.meter.total")}: {meters.length}
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
              ? "Please select a specific factory to create meters"
              : ""
          }
        >
          <Plus className="w-4 h-4" />
          <span>{t("energy.meter.create")}</span>
        </button>
      </div>

      {/* Meter Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              {
                key: "all",
                label: "Barcha schetchiklar",
                icon: "📊",
                count: meters.length,
              },
              {
                key: "electricity",
                label: "Elektr energiya",
                icon: "⚡",
                count: meters.filter((m) => m.meter_type === "electricity")
                  .length,
              },
              {
                key: "gas",
                label: "Gaz",
                icon: "🔥",
                count: meters.filter((m) => m.meter_type === "gas").length,
              },
              {
                key: "water",
                label: "Suv",
                icon: "💧",
                count: meters.filter((m) => m.meter_type === "water").length,
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t("energy.meter.type")} - All</option>
            <option value="electricity">{t("energy.meter.electricity")}</option>
            <option value="water">{t("energy.meter.water")}</option>
            <option value="gas">{t("energy.meter.gas")}</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t("energy.meter.level")} - All</option>
            <option value="factory_main">
              {t("energy.meter.factory_main")}
            </option>
            <option value="workshop">{t("energy.meter.workshop")}</option>
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>{t("energy.common.filter")}</span>
          </button>
        </div>
      </div>

      {/* Meters Grid */}
      {filteredMeters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">{t("energy.common.no_data")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => (
            <div
              key={meter.id}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  {getMeterIcon(meter.meter_type)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {meter.name || "N/A"}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getMeterTypeColor(
                          meter.meter_type
                        )}`}
                      >
                        {t(`energy.meter.${meter.meter_type}`)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {t(`energy.meter.${meter.level}`)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(meter)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(meter.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meter Details */}
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-medium">{meter.id}</span>
                </div>
                {meter.workshop && (
                  <div className="flex justify-between">
                    <span>{t("energy.meter.workshop")}:</span>
                    <span className="font-medium">{meter.workshop.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t("energy.meter.latest_reading")}:</span>
                  <span className="font-medium">
                    {meter.latest_reading
                      ? `${meter.latest_reading} ${
                          meter.meter_type === "electricity" ? "kWh" : "m³"
                        }`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("energy.common.created_at")}:</span>
                  <span className="font-medium">
                    {new Date(meter.created_at).toLocaleDateString()}
                  </span>
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
              {t("energy.meter.delete")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("energy.meter.delete_confirm")}
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

      {/* Meter Modal */}
      {isModalOpen && factoryId && (
        <MeterModal
          meter={editingMeter}
          factoryId={factoryId}
          workshops={workshops}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default MetersList;
