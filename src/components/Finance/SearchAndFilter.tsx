import React from "react";
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

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Қидириш:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder="Металл номи, тури ёки манба номи бўйича қидиринг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label
            htmlFor="sourceFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Манба бойича филтерлаш:
          </label>
          <select
            id="sourceFilter"
            value={selectedSourceFilter}
            onChange={(e) => setSelectedSourceFilter(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">Барча манбалар</option>
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
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
            >
              Барча филтерларни очириш
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {filteredCount} дан {totalCount} та кўрсатилмоқда
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
