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
import { energyManagementService } from "../services/energyManagementService";
import { MeterReading, Meter, Factory } from "../../../types/energy";
import { toast } from "../../../utils/toast";
import axios from "axios";
import MeterReadingModal from "../../Energy/components/MeterReadingModal";
import BulkReadingModal from "../../Energy/components/BulkReadingModal";
import Pagination from "../../../components/UI/Pagination";

interface MeterReadingsListProps {
  factoryId?: number | null;
  operatorId?: number;
}

const MeterReadingsList: React.FC<MeterReadingsListProps> = ({
  factoryId,
  operatorId,
}) => {
  const { t } = useTranslation();
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [allReadings, setAllReadings] = useState<MeterReading[]>([]); // Store all readings for counts
  const [meters, setMeters] = useState<Meter[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMeter, setFilterMeter] = useState<string>("all");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [filterFactory, setFilterFactory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "all" | "electricity" | "gas" | "water"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<MeterReading | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    factoryId,
    operatorId,
    itemsPerPage,
    searchTerm,
    filterMeter,
    filterVerified,
    filterFactory,
    activeTab,
  ]);

  // Reset to first page when filters change (not when page changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterMeter, filterVerified, filterFactory, activeTab]);

  const fetchFactories = async (): Promise<Factory[]> => {
    try {
      const response = await axios.get("/factory/marker");
      return response.data;
    } catch (error) {
      console.error("Error fetching factories:", error);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch meters and factories
      const [metersData, factoriesData] = await Promise.all([
        energyManagementService.getAllMeters(factoryId),
        fetchFactories(),
      ]);
      setMeters(metersData);
      setFactories(factoriesData);

      // Prepare filters for server-side filtering (only supported filters)
      const serverFilters: any = {};

      // Add meter filter (supported by backend)
      if (filterMeter !== "all") {
        serverFilters.meterId = parseInt(filterMeter);
      }

      // Add verified filter (supported by backend)
      if (filterVerified === "verified") {
        serverFilters.verified = true;
      } else if (filterVerified === "unverified") {
        serverFilters.verified = false;
      }

      // Get all readings by fetching multiple pages if needed
      // This is because server doesn't support search, operatorId, and meter type filters
      let allReadingsData: MeterReading[] = [];
      let currentPageForFetch = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const readingsResponse = await energyManagementService.getAllReadings(
          factoryId,
          {
            ...serverFilters,
            limit: 100, // Fetch in batches of 100
            page: currentPageForFetch,
          }
        );

        allReadingsData = [...allReadingsData, ...readingsResponse.data];

        // Check if there are more pages
        hasMoreData = readingsResponse.pagination.has_next;
        currentPageForFetch++;

        // Safety check to prevent infinite loops
        if (currentPageForFetch > 100) {
          console.warn(
            "Too many pages, stopping fetch to prevent infinite loop"
          );
          break;
        }
      }

      // Apply client-side filters for unsupported server filters
      if (
        searchTerm ||
        operatorId ||
        activeTab !== "all" ||
        filterFactory !== "all"
      ) {
        allReadingsData = allReadingsData.filter((reading) => {
          const meterName = getMeterName(reading.meter_id);
          const meterType = getMeterType(reading.meter_id);

          // Search filter (client-side)
          const matchesSearch =
            !searchTerm ||
            meterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reading.current_reading?.toString().includes(searchTerm);

          // Operator filter (client-side)
          const matchesOperator =
            !operatorId || reading.operator?.id === operatorId;

          // Meter type filter (client-side)
          const matchesTab = activeTab === "all" || meterType === activeTab;

          // Factory filter (client-side)
          const meter = meters.find((m) => m.id === reading.meter_id);
          const matchesFactory =
            filterFactory === "all" ||
            (meter && meter.factory_id.toString() === filterFactory);

          return (
            matchesSearch && matchesOperator && matchesTab && matchesFactory
          );
        });
      }

      // Store filtered data and pagination info
      const totalFilteredItems = allReadingsData.length;
      const totalFilteredPages = Math.ceil(totalFilteredItems / itemsPerPage);

      // Store all filtered data for pagination
      setAllReadings(allReadingsData);
      setTotalPages(totalFilteredPages);
      setTotalItems(totalFilteredItems);
    } catch (error: any) {
      toast.error("Failed to load readings data");
    } finally {
      setLoading(false);
    }
  };

  // Separate effect for pagination to avoid infinite loops
  useEffect(() => {
    if (allReadings.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedReadings = allReadings.slice(
        startIndex,
        startIndex + itemsPerPage
      );
      setReadings(paginatedReadings);
    }
  }, [allReadings, currentPage, itemsPerPage]);

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
      await energyManagementService.verifyReading(id);
      toast.success("Reading verified successfully");
      fetchData();
    } catch (error: any) {
      toast.error("Failed to verify reading");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await energyManagementService.deleteMeterReading(id);
      toast.success("Reading deleted successfully");
      fetchData();
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error("Failed to delete reading");
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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
    const meter_type = getMeterType(meterId);
    return meter_type === "electricity" ? "kWh" : "m³";
  };

  // Use server-side filtered and paginated readings directly
  const filteredReadings = readings;

  // Use server pagination info
  const filteredPagination = {
    current_page: currentPage,
    total_pages: totalPages,
    total_items: totalItems,
    items_per_page: itemsPerPage,
    has_next: currentPage < totalPages,
    has_prev: currentPage > 1,
  };

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
            {t("energy.reading.total")}: {totalItems}
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

      {/* Readings Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              {
                key: "all",
                label: "Barcha o'qishlar",
                icon: "📊",
                count: allReadings.length,
              },
              {
                key: "electricity",
                label: "Elektr energiya",
                icon: "⚡",
                count: allReadings.filter(
                  (r) => getMeterType(r.meter_id) === "electricity"
                ).length,
              },
              {
                key: "gas",
                label: "Gaz",
                icon: "🔥",
                count: allReadings.filter(
                  (r) => getMeterType(r.meter_id) === "gas"
                ).length,
              },
              {
                key: "water",
                label: "Suv",
                icon: "💧",
                count: allReadings.filter(
                  (r) => getMeterType(r.meter_id) === "water"
                ).length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setCurrentPage(1); // Reset to first page when changing tabs
                }}
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

          <select
            value={filterFactory}
            onChange={(e) => setFilterFactory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Factories</option>
            {Array.from(new Set(meters.map((meter) => meter.factory_id)))
              .sort()
              .map((factoryId) => {
                const factory = factories.find((f) => f.id === factoryId);
                return (
                  <option key={factoryId} value={factoryId.toString()}>
                    {factory ? factory.name : `Factory ${factoryId}`}
                  </option>
                );
              })}
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

          {/* Pagination */}
          <Pagination
            currentPage={filteredPagination.current_page}
            totalPages={filteredPagination.total_pages}
            totalItems={filteredPagination.total_items}
            itemsPerPage={filteredPagination.items_per_page}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            itemsPerPageOptions={[5, 10, 20, 50]}
          />
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
