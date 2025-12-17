import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Clock,
} from "lucide-react";
import { energyService } from "../../../services/energyService";
import { MeterReading, Meter } from "../../../types/energy";
import { toast } from "../../../utils/toast";
import MeterReadingModal from "./MeterReadingModal";
import BulkReadingModal from "./BulkReadingModal";

interface MeterReadingsListProps {
  factoryId: number;
  operatorId?: number;
}

const MeterReadingsList: React.FC<MeterReadingsListProps> = ({
  factoryId,
  operatorId,
}) => {
  const { t } = useTranslation();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMeter, setFilterMeter] = useState<string>("all");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<MeterReading | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryId, operatorId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (operatorId) {
        // If operatorId is provided, fetch operator-specific data
        const [metersData, operatorReadings] = await Promise.all([
          energyService.getMyMeters(),
          energyService.getMyReadings(),
        ]);
        setReadings(operatorReadings.data);
        setMeters(metersData);
      } else {
        // Fetch all factory data for admin users
        const [metersData] = await Promise.all([
          energyService.getMetersByFactory(factoryId),
        ]);

        // Get readings from each meter
        let allReadings: MeterReading[] = [];
        for (const meter of metersData) {
          try {
            const meterReadings = await energyService.getMeterReadings(
              meter.id
            );
            allReadings = [...allReadings, ...meterReadings.data];
          } catch (error) {
          }
        }

        setReadings(allReadings);
        setMeters(metersData);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load readings data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  const handleBulkCreate = () => {
    setIsBulkModalOpen(true);
  };

  const handleEdit = (reading: MeterReading) => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleVerify = async (id: number) => {
    try {
      await energyService.verifyMeterReading(id);
      toast.success("Reading verified successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error verifying reading:", error);
      toast.error("Failed to verify reading");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await energyService.deleteMeterReading(id);
      toast.success("Reading deleted successfully");
      fetchData();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error("Error deleting reading:", error);
      toast.error("Failed to delete reading");
    }
  };

  const handleModalClose = (updated?: boolean) => {
    setIsModalOpen(false);
    setIsBulkModalOpen(false);
    setEditingReading(null);
    if (updated) {
      fetchData();
    }
  };

  const getMeterName = (meterId: number) => {
    const meter = meters.find((m) => m.id === meterId);
    return meter ? meter.name : `Meter ${meterId}`;
  };

  const getMeterType = (meterId: number) => {
    const meter = meters.find((m) => m.id === meterId);
    return meter ? meter.meter_type : "unknown";
  };

  const getUnit = (meterId: number) => {
    const type = getMeterType(meterId);
    return type === "electricity" ? "kWh" : "m³";
  };

  const filteredReadings = readings.filter((reading) => {
    const meterName = getMeterName(reading.meter_id);
    const matchesSearch =
      meterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.current_reading?.toString().includes(searchTerm);
    const matchesMeter =
      filterMeter === "all" || reading.meter_id.toString() === filterMeter;
    const matchesVerified =
      filterVerified === "all" ||
      (filterVerified === "verified" && reading.is_verified) ||
      (filterVerified === "unverified" && !reading.is_verified);
    const matchesOperator = !operatorId || reading.operator?.id === operatorId;

    return matchesSearch && matchesMeter && matchesVerified && matchesOperator;
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
            {t("energy.reading.list")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("energy.reading.total")}: {readings.length}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleBulkCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="max-md:hidden">
              {t("energy.reading.bulk_create")}
            </span>
            <span className="md:hidden">Bulk</span>
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t("energy.reading.create")}</span>
          </button>
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
            value={filterMeter}
            onChange={(e) => setFilterMeter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Meters</option>
            {meters.map((meter) => (
              <option key={meter.id} value={meter.id}>
                {meter.name || "N/A"}
              </option>
            ))}
          </select>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="verified">{t("energy.reading.verified")}</option>
            <option value="unverified">{t("energy.reading.unverified")}</option>
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>{t("energy.common.filter")}</span>
          </button>
        </div>
      </div>

      {/* Readings Table */}
      {filteredReadings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">{t("energy.common.no_data")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("energy.meter.name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("energy.reading.value")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("energy.reading.consumption")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("energy.reading.reading_date")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("energy.common.status")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("energy.common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {getMeterName(reading.meter_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {reading.meter_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reading.current_reading?.toLocaleString() || "0"}{" "}
                        {getUnit(reading.meter_id)}
                      </div>
                      {reading.previous_value && (
                        <div className="text-sm text-gray-500">
                          Previous:{" "}
                          {reading.previous_value?.toLocaleString() || "0"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reading.consumption
                          ? `${
                              reading.consumption?.toLocaleString() || "0"
                            } ${getUnit(reading.meter_id)}`
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reading.reading_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(reading.reading_date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reading.is_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {reading.is_verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t("energy.reading.verified")}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            {t("energy.reading.unverified")}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!reading.is_verified && (
                          <button
                            onClick={() => handleVerify(reading.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t("energy.reading.verify")}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(reading)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(reading.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("energy.reading.delete")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("energy.reading.delete_confirm")}
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

      {/* Reading Modal */}
      {isModalOpen && (
        <MeterReadingModal
          reading={editingReading}
          meters={meters}
          onClose={handleModalClose}
        />
      )}

      {/* Bulk Reading Modal */}
      {isBulkModalOpen && (
        <BulkReadingModal meters={meters} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default MeterReadingsList;
