import React from "react";
import {
  CurrencyDollarIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface GroupedElement {
  elementName: string;
  metalType: string;
  sources: Record<
    string,
    {
      currentPrice: number;
      previousPrice?: number;
      changePercent?: number;
      currency: string;
      sourceUrl?: string;
      id: number;
    }
  >;
  averagePrice: number;
  changePercent: number;
  lastUpdated: string;
}

interface MetalTableProps {
  metalPrices: GroupedElement[];
  isLoading: boolean;
  onPriceUpdate: (item: any, sourceName: string, sourceData: any) => void;
  onViewDetail: (item: any) => void;
  onDelete: (item: any) => void;
  onRowClick: (element: any) => void;
  onSourceClick?: (element: any, sourceType: string) => void;
  searchQuery?: string;
  selectedSourceFilter?: string;
  sources: any[];
}

const MetalTable: React.FC<MetalTableProps> = ({
  metalPrices,
  isLoading,
  onPriceUpdate,
  onViewDetail,
  onDelete,
  onRowClick,
  onSourceClick,
  searchQuery,
  selectedSourceFilter,
  sources,
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
  console.log("MetalTable - metalPrices:", metalPrices);
  // Manbalar ro'yxatini olish
  const sourceNames = sources.map((s) => s.name);

  // Debug: ma'lumotlarni tekshirish (development uchun)
  if (process.env.NODE_ENV === "development") {
    console.log("MetalTable - metalPrices:", metalPrices);
    console.log("MetalTable - sources:", sources);
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
              {sourceNames.map((sourceName) => (
                <th
                  key={sourceName}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {sourceName}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ўзгариши
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Охирги янгиланиш
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Амаллар
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metalPrices.map((item, index) => (
              <tr
                key={`${item.elementName}-${index}`}
                className="hover:bg-gray-50 group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.elementName}
                </td>
                {sourceNames.map((sourceName) => {
                  const sourceData = item.sources[sourceName];

                  // Debug: har bir source ma'lumotini tekshirish (development uchun)
                  if (process.env.NODE_ENV === "development" && sourceData) {
                    console.log(
                      `Source ${sourceName} for ${item.elementName}:`,
                      sourceData
                    );
                  }

                  return (
                    <td
                      key={sourceName}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {sourceData ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSourceClick) {
                                  onSourceClick(item, sourceName);
                                }
                              }}
                              title={`${sourceName} нарх тарихини кўриш`}
                            >
                              {formatCurrency(sourceData.currentPrice || 0)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPriceUpdate(item, sourceName, sourceData);
                              }}
                              className="text-blue-600 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Нарх ўзгартириш"
                            >
                              <CurrencyDollarIcon className="h-4 w-4" />
                            </button>
                          </div>
                          {sourceData.changePercent !== undefined &&
                            sourceData.changePercent !== null &&
                            !isNaN(Number(sourceData.changePercent)) && (
                              <div
                                className={`text-xs ${
                                  Number(sourceData.changePercent) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {Number(sourceData.changePercent) >= 0
                                  ? "+"
                                  : ""}
                                {Number(sourceData.changePercent).toFixed(2)}%
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  );
                })}
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
                  {formatDate(item.lastUpdated)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(item); // Барча манбаларнинг нарх тарихини кўрсатиш
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Барча манбалар нарх тарихи"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Ўчириш"
                    >
                      <TrashIcon className="h-5 w-5" />
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
