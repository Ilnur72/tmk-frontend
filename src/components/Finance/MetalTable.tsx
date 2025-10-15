import React from "react";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { MetalPrice } from "../../types/finance";

interface MetalTableProps {
  metalPrices: MetalPrice[];
  isLoading: boolean;
  onEdit: (item: MetalPrice) => void;
  onViewDetail: (item: MetalPrice) => void;
  searchQuery?: string;
  selectedSourceFilter?: string;
}

const MetalTable: React.FC<MetalTableProps> = ({
  metalPrices,
  isLoading,
  onEdit,
  onViewDetail,
  searchQuery,
  selectedSourceFilter,
}) => {
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("uz-UZ").format(Number(amount)) + " сўм";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ");
  };

  const clearAllFilters = () => {
    // This would need to be passed down from parent or handled differently
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Юкланмоқда...</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Металл номи
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Жорий нархи
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Охирги нархи
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ўртача нархи
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ўзгариши
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Охирги янгиланиш
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Манба
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Амаллар
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metalPrices.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.elementName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(item.currentPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(item.previousPrice || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(item.averagePrice || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      Number(item.changePercent || 0) >= 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {Number(item.changePercent || 0) >= 0 ? "+" : ""}
                    {Number(item.changePercent || 0).toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a
                    href={item.source?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 hover:underline"
                  >
                    {item.source?.name}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetail(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Тафсилотлар"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Таҳрирлаш"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {metalPrices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery || selectedSourceFilter
              ? "Қидириш натижаси топилмади"
              : "Ҳеч қандай маълумот топилмади"}
          </p>
          {(searchQuery || selectedSourceFilter) && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Барча маълумотларни кўрсатиш
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MetalTable;
