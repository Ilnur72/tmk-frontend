import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { MetalPrice, MetalPriceLog } from "../../types/finance";

interface PriceLogsDetailProps {
  selectedMetal: MetalPrice;
  priceLogs: MetalPriceLog[];
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
}

const PriceLogsDetail: React.FC<PriceLogsDetailProps> = ({
  selectedMetal,
  priceLogs,
  isLoading,
  error,
  onClose,
}) => {
  const { t } = useTranslation();
  const formatCurrency = (amount: number | string) => {
    return (
      new Intl.NumberFormat("uz-UZ").format(Number(amount)) +
      " " +
      t("finance.soum")
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowPathIcon className="h-5 w-5 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedMetal.elementName} - {t("finance.price_history")}
          </h1>
        </div>
      </div>

      {/* Metal Info Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("finance.current_price")}
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(selectedMetal.currentPrice)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("finance.previous_price")}
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(selectedMetal.previousPrice || 0)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              {t("finance.change")}
            </h3>
            <p
              className={`mt-1 text-lg font-semibold ${
                Number(selectedMetal.changePercent || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {Number(selectedMetal.changePercent || 0) >= 0 ? "+" : ""}
              {Number(selectedMetal.changePercent || 0).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Price Logs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t("finance.price_change_history")}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">{t("finance.loading")}</span>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg mx-4 mb-4">
            {t("finance.error")}: {error.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("finance.old_price")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("finance.new_price")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("finance.change_percent")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("finance.change_reason")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("finance.source")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("finance.date")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(log.oldPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(log.newPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          Number(log.changePercent || 0) >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {Number(log.changePercent || 0) >= 0 ? "+" : ""}
                        {Number(log.changePercent || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.changeReason || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={log.source?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        {log.source?.name}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.createdAt.toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {priceLogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("finance.no_logs_found")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceLogsDetail;
