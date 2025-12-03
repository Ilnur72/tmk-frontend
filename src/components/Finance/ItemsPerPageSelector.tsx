import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between bg-white shadow rounded-lg p-4 mt-4">
      <div className="text-sm text-gray-500">
        {t("finance.total_items", { count: totalItems })}
      </div>
      <div className="flex items-center space-x-2">
        <label
          htmlFor="itemsPerPage"
          className="text-sm font-medium text-gray-700"
        >
          {t("finance.per_page")}
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md"
        >
          <option value={5}>{t("finance.n_items", { count: 5 })}</option>
          <option value={10}>{t("finance.n_items", { count: 10 })}</option>
          <option value={20}>{t("finance.n_items", { count: 20 })}</option>
          <option value={50}>{t("finance.n_items", { count: 50 })}</option>
          <option value={100}>{t("finance.n_items", { count: 100 })}</option>
        </select>
      </div>
    </div>
  );
};

export default ItemsPerPageSelector;
