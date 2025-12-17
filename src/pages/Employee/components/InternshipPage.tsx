import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useScrollToTop, scrollToTop } from "../../../hooks/useScrollToTop";
import { useTranslation } from "react-i18next";

// Types
interface InternshipData {
  еxpiration: string;
  еxpiration_days: string;
}

// API Service
const apiService = {
  async getInternshipData(): Promise<InternshipData[]> {
    const response = await axios.get("/employers/internship");    
    return response.data;
  },
};

// Custom hook
const useInternshipData = () => {
  return useQuery<InternshipData[]>({
    queryKey: ["internshipData"],
    queryFn: apiService.getInternshipData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

const InternshipPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: internshipData = [], isLoading, error } = useInternshipData();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global scroll to top hook
  useScrollToTop([currentPage, searchTerm]);

  // Filter data based on search
  const filteredData = internshipData.filter((item) =>
    item.еxpiration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    scrollToTop();
  };

  const handleBack = () => {
    navigate("/employers");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="w-full px-2 sm:px-2 lg:px-2">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="w-full px-2 sm:px-2 lg:px-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">
                {t("internship.error_loading_data")}
              </p>
              <button
                onClick={handleBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("internship.back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 max-sm:pt-10">
      <div className="w-full px-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              {t("internship.back")}
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              {t("internship.page_title")}
            </h1>
            <div className="w-24 hidden sm:block"></div>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("internship.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {searchTerm && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Тозалаш
                </button>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Жами</div>
              <div className="text-blue-900 text-xl font-bold">
                {internshipData.length}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">
                Филтрланган
              </div>
              <div className="text-yellow-900 text-xl font-bold">
                {filteredData.length}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">
                Саҳифадаги
              </div>
              <div className="text-purple-900 text-xl font-bold">
                {currentData.length}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Items per page selector */}
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-sm text-gray-700">
              Жами {totalItems} дан {startIndex + 1}-
              {Math.min(endIndex, totalItems)} кўрсатилмоқда
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Саҳифада:</span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="pr-8 pl-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    №
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("internship.internship_period")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("internship.remaining_days")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.еxpiration}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span
                          className={`text-sm font-medium ${
                            parseInt(item.еxpiration_days) <= 30
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {item.еxpiration_days} {t("internship.days")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-primary bg-opacity-10 border-primary text-primary"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="text-sm text-gray-700">
                Саҳифа {currentPage} / {totalPages}
              </div>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 text-lg mt-4">
                {searchTerm
                  ? "Қидирув натижаси топилмади"
                  : "Ҳеч қандай маълумот топилмади"}
              </p>
              {searchTerm && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Филтрни тозалаш
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipPage;
