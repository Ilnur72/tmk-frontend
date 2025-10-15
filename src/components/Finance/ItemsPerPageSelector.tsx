import React from "react";

interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems: number;
}

const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  return (
    <div className="flex items-center justify-between bg-white shadow rounded-lg p-4 mt-4">
      <div className="text-sm text-gray-500">Жами {totalItems} та элемент</div>

      <div className="flex items-center space-x-2">
        <label
          htmlFor="itemsPerPage"
          className="text-sm font-medium text-gray-700"
        >
          Саҳифада:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
        >
          <option value={5}>5 та</option>
          <option value={10}>10 та</option>
          <option value={20}>20 та</option>
          <option value={50}>50 та</option>
          <option value={100}>100 та</option>
        </select>
      </div>
    </div>
  );
};

export default ItemsPerPageSelector;
