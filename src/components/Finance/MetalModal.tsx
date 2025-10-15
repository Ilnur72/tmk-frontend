import React from "react";
import { MetalPrice, MetalType, Source } from "../../types/finance";

interface MetalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingItem: MetalPrice | null;
  formData: {
    elementName: string;
    metalType: MetalType;
    currentPrice: string;
    previousPrice: string;
    currency: string;
    unit: string;
    sourceId: string;
  };
  setFormData: (data: any) => void;
  sources: Source[];
  isLoading: boolean;
}

const MetalModal: React.FC<MetalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  formData,
  setFormData,
  sources,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={onSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingItem ? "Металлни таҳрирлаш" : "Янги металл қўшиш"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="elementName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Элемент номи
                      </label>
                      <input
                        type="text"
                        id="elementName"
                        required
                        value={formData.elementName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            elementName: e.target.value,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="metalType"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Металл тури
                      </label>
                      <select
                        id="metalType"
                        required
                        value={formData.metalType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metalType: e.target.value as MetalType,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value={MetalType.STEEL}>Полат</option>
                        <option value={MetalType.IRON}>Темир</option>
                        <option value={MetalType.COPPER}>Мис</option>
                        <option value={MetalType.ALUMINUM}>Алюминий</option>
                        <option value={MetalType.ZINC}>Рух</option>
                        <option value={MetalType.LEAD}>Қўрғошин</option>
                        <option value={MetalType.NICKEL}>Никель</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="currentPrice"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Жорий нархи
                      </label>
                      <input
                        type="number"
                        id="currentPrice"
                        required
                        step="0.01"
                        value={formData.currentPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentPrice: e.target.value,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="previousPrice"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Охирги нархи
                      </label>
                      <input
                        type="number"
                        id="previousPrice"
                        step="0.01"
                        value={formData.previousPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            previousPrice: e.target.value,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Валюта
                      </label>
                      <select
                        id="currency"
                        required
                        value={formData.currency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currency: e.target.value,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="UZS">UZS (Сўм)</option>
                        <option value="USD">USD (Доллар)</option>
                        <option value="EUR">EUR (Евро)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="unit"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ўлчов бирлиги
                      </label>
                      <input
                        type="text"
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unit: e.target.value,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="кг, тонна, метр"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="sourceId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Манба
                      </label>
                      <select
                        id="sourceId"
                        required
                        value={formData.sourceId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sourceId: e.target.value,
                          })
                        }
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Манбани танланг</option>
                        {sources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading
                  ? "Сақланмоқда..."
                  : editingItem
                  ? "Янгилаш"
                  : "Қўшиш"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Бекор қилиш
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MetalModal;
