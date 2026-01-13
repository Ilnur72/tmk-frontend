import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useScrollToTop, scrollToTop } from "../../../hooks/useScrollToTop";
import { useTranslation } from "react-i18next";

// Types
interface LanguageSkill {
  name: string;
  level: string;
}

interface LanguageData {
  name: string;
  branch: string;
  position: string;
  department: string;
  langs: LanguageSkill[];
}

// API Service
const apiService = {
  async getLanguageData(): Promise<LanguageData[]> {
    const response = await axios.get("/employers/langs");
    return response.data;
  },
};

// Custom hook
const useLanguageData = () => {
  return useQuery<LanguageData[]>({
    queryKey: ["languageData"],
    queryFn: apiService.getLanguageData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Helper function to get level color
const getLevelColor = (level: string): string => {
  if (level.includes("свободно")) return "bg-green-100 text-green-800";
  if (level.includes("объясняться")) return "bg-yellow-100 text-yellow-800";
  if (level.includes("Читает")) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
};

// Helper function to get level priority for sorting
const getLevelPriority = (level: string): number => {
  if (level.includes("свободно")) return 3;
  if (level.includes("объясняться")) return 2;
  if (level.includes("Читает")) return 1;
  return 0;
};

const LanguagePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: languageData = [], isLoading, error } = useLanguageData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Global scroll to top hook - route o'zgarganda va filterlar o'zgarganda scroll qiladi
  useScrollToTop([currentPage, searchTerm, filterLanguage, filterLevel]);

  // Get unique languages for filter
  const uniqueLanguages = Array.from(
    new Set(
      languageData.flatMap((employee) =>
        employee.langs.map((lang) => lang.name)
      )
    )
  ).sort();

  // Get unique levels for filter
  const uniqueLevels = Array.from(
    new Set(
      languageData.flatMap((employee) =>
        employee.langs.map((lang) => lang.level)
      )
    )
  ).sort((a, b) => getLevelPriority(b) - getLevelPriority(a));

  // Filter data based on search and filters
  const filteredData = languageData.filter((employee) => {
    // Search filter
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Language filter
    if (filterLanguage !== "all") {
      const hasLanguage = employee.langs.some(
        (lang) => lang.name === filterLanguage
      );
      if (!hasLanguage) return false;
    }

    // Level filter
    if (filterLevel !== "all") {
      const hasLevel = employee.langs.some(
        (lang) => lang.level === filterLevel
      );
      if (!hasLevel) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    scrollToTop(); // Manual scroll
  };

  // Calculate statistics
  const getLanguageStatistics = () => {
    const languageCount: { [key: string]: number } = {};
    const levelCount: { [key: string]: number } = {};

    languageData.forEach((employee) => {
      employee.langs.forEach((lang) => {
        languageCount[lang.name] = (languageCount[lang.name] || 0) + 1;
        levelCount[lang.level] = (levelCount[lang.level] || 0) + 1;
      });
    });

    return { languageCount, levelCount };
  };

  const { languageCount, levelCount } = getLanguageStatistics();

  const handleBack = () => {
    navigate("/employers");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterLanguage("all");
    setFilterLevel("all");
    setCurrentPage(1);
    // useScrollToTop hook avtomatik scroll qiladi
  };

  // Generate page numbers for pagination
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
                Маълумотларни юклашда хатолик юз берди
              </p>
              <button
                onClick={handleBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Орқага қайтиш
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-sm:pt-10">
      <div className="w-full px-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Орқага қайтиш
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
              Чет тилларини биладиган ходимлар
            </h1>
            <div className="w-24 hidden sm:block"></div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ходим исми, лавозим ёки бўлимни қидириш..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тил танланг:
                </label>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="all">
                    Барча тиллар ({uniqueLanguages.length})
                  </option>
                  {uniqueLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang} ({languageCount[lang] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Даража танланг:
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="all">
                    Барча даражалар ({uniqueLevels.length})
                  </option>
                  {uniqueLevels.map((level) => (
                    <option key={level} value={level}>
                      {level} ({levelCount[level] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm ||
                filterLanguage !== "all" ||
                filterLevel !== "all") && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    Тозалаш
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">
                Жами ходимлар
              </div>
              <div className="text-blue-900 text-xl font-bold">
                {languageData.length}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 text-sm font-medium">
                Энг кўп тил
              </div>
              <div className="text-green-900 text-lg font-bold">
                {Object.entries(languageCount).sort(
                  ([, a], [, b]) => b - a
                )[0]?.[0] || "Нет"}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">
                Филтр натижаси
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Ходим исми
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Филиал
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Лавозим
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Бўлим
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Тиллар ва даража
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((employee, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {employee.name}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {employee.branch}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 leading-tight">
                        {employee.position}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 leading-tight">
                        {employee.department}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {employee.langs.map((lang, langIndex) => (
                          <div
                            key={langIndex}
                            className="flex flex-col gap-1 min-w-0"
                          >
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {lang.name}
                              </span>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                                lang.level
                              )}`}
                            >
                              {lang.level}
                            </span>
                          </div>
                        ))}
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
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 text-lg mt-4">
                {searchTerm || filterLanguage !== "all" || filterLevel !== "all"
                  ? "Қидирув натижаси топилмади"
                  : "Ҳеч қандай маълумот топилмади"}
              </p>
              {(searchTerm ||
                filterLanguage !== "all" ||
                filterLevel !== "all") && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Барча филтрларни тозалаш
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguagePage;
