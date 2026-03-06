import React from "react";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Source } from "../../types/finance";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSourceFilter: string;
  setSelectedSourceFilter: (sourceId: string) => void;
  sources: Source[];
  filteredCount: number;
  totalCount: number;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSourceFilter,
  setSelectedSourceFilter,
  sources,
  filteredCount,
  totalCount,
}) => {
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSourceFilter("");
  };

  const { t } = useTranslation();
  return (
    <div className="bg-white shadow rounded-lg p-3 mb-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            {t("finance.search")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder={t("finance.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 text-xs md:text-sm shadow-sm border-gray-300 rounded-md py-1.5"
            />
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label
            htmlFor="sourceFilter"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            {t("finance.filter_by_source")}
          </label>
          <select
            id="sourceFilter"
            value={selectedSourceFilter}
            onChange={(e) => setSelectedSourceFilter(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm text-xs md:text-sm border-gray-300 rounded-md py-1.5 w-full md:w-auto"
          >
            <option value="">{t("finance.all_sources")}</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(selectedSourceFilter || searchQuery) && (
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs"
            >
              {t("finance.clear_all_filters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilter;
