import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
}) => {
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Agar sahifalar kam bo'lsa, barchasini ko'rsatish
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Ko'proq sahifalar bo'lsa, smart pagination
      const sidePages = Math.floor((maxVisiblePages - 3) / 2); // 3 = first + last + current

      // Har doim 1-sahifani qo'shish
      pages.push(1);

      let startPage = Math.max(2, currentPage - sidePages);
      let endPage = Math.min(totalPages - 1, currentPage + sidePages);

      // Boshlanish nuqtasini sozlash
      if (currentPage <= sidePages + 2) {
        endPage = Math.min(maxVisiblePages - 1, totalPages - 1);
      }

      // Tugash nuqtasini sozlash
      if (currentPage >= totalPages - sidePages - 1) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 2);
      }

      // Ellipsis qo'shish (boshlanish)
      if (startPage > 2) {
        pages.push(-1); // -1 = ellipsis
      }

      // O'rta sahifalarni qo'shish
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Ellipsis qo'shish (tugash)
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 = ellipsis
      }

      // Har doim oxirgi sahifani qo'shish
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-white">
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Ko'rsatish:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">ta element</span>
        </div>
      )}

      {/* Items info */}
      <div className="text-sm text-gray-700">
        {totalItems > 0 ? (
          <>
            <span className="font-medium">{startItem}</span>
            {" - "}
            <span className="font-medium">{endItem}</span>
            {" / "}
            <span className="font-medium">{totalItems}</span>
            {" ta natija"}
          </>
        ) : (
          "Natijalar topilmadi"
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {pageNumbers.map((page, index) => {
              if (page === -1 || page === -2) {
                // Ellipsis
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    page === currentPage
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
