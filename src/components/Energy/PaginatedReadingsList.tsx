import React, { useState, useEffect } from "react";
import { energyService } from "../../services/energyService";
import { MeterReading, PaginatedResponse } from "../../types/energy";
import { toast } from "../../utils/toast";
import Pagination from "../UI/Pagination";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const PaginatedReadingsList: React.FC = () => {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_prev: false,
  });

  // Pagination parametrlari
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchReadings();
  }, [currentPage, itemsPerPage]);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<MeterReading> =
        await energyService.getAllMeterReadings({
          page: currentPage,
          limit: itemsPerPage,
        });

      setReadings(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error("Error fetching readings:", error);
      toast.error("Failed to load meter readings");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusText = (isVerified: boolean) => {
    return isVerified ? "Tasdiqlangan" : "Tasdiqlanmagan";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Hisoblagich Ko'rsatkichlari
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Barcha hisoblagich ko'rsatkichlarini boshqarish
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hisoblagich
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ko'rsatkich
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sana
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Holat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Izohlar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {readings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Ko'rsatkichlar topilmadi
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hech qanday ko'rsatkich topilmadi.
                  </p>
                </td>
              </tr>
            ) : (
              readings.map((reading) => (
                <tr key={reading.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reading.meter?.name || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reading.meter?.meter_type || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reading.current_reading?.toLocaleString() || "0"}
                    </div>
                    {reading.consumption && (
                      <div className="text-sm text-gray-500">
                        Sarfiyot: {reading.consumption}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reading.reading_date).toLocaleDateString(
                        "uz-UZ"
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(reading.reading_date).toLocaleTimeString(
                        "uz-UZ",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(reading.is_verified)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getStatusText(reading.is_verified)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {reading.notes || "-"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        totalItems={pagination.total_items}
        itemsPerPage={pagination.items_per_page}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        showItemsPerPage={true}
        itemsPerPageOptions={[5, 10, 20, 50]}
      />
    </div>
  );
};

export default PaginatedReadingsList;
