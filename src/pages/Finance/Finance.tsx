import React, { useState } from "react";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
import { MetalPrice } from "../../types/finance";

// Services
import * as financeService from "../../services/financeService";

// Components
import SearchAndFilter from "../../components/Finance/SearchAndFilter";
import MetalTable from "../../components/Finance/MetalTable";
import Pagination from "../../components/Finance/Pagination";
import SourceModal from "../../components/Finance/SourceModal";
import PriceLogsDetail from "../../components/Finance/PriceLogsDetail";
import PriceUpdateModal from "../../components/Finance/PriceUpdateModal";
import PriceChartModal from "../../components/Finance/PriceChartModal";
const Finance: React.FC = () => {
  const queryClient = useQueryClient();

  // States
  const [isPriceUpdateModalOpen, setIsPriceUpdateModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<any>(null);
  const [selectedElementForChart, setSelectedElementForChart] =
    useState<any>(null);
  const [selectedSourceType, setSelectedSourceType] = useState<string>("all");
  const [selectedMetalForDetail, setSelectedMetalForDetail] =
    useState<MetalPrice | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [priceUpdateData, setPriceUpdateData] = useState({
    currentPrice: "",
    previousPrice: "",
    currency: "UZS",
    changeReason: "",
  });

  const [sourceFormData, setSourceFormData] = useState({
    name: "",
    url: "",
    description: "",
  });

  // React Query hooks
  // Metal prices API
  const {
    data: metalPricesData = [],
    isLoading: isMetalPricesLoading,
    error: metalPricesError,
  } = useQuery({
    queryKey: ["metal-prices"],
    queryFn: financeService.fetchMetalPrices,
  });

  // Elements API
  const {
    data: elementsListData = [],
    isLoading: isElementsListLoading,
    error: elementsListError,
  } = useQuery({
    queryKey: ["elements"],
    queryFn: financeService.fetchElementsList,
  });

  const {
    data: sources = [],
    isLoading: isSourcesLoading,
    error: sourcesError,
  } = useQuery({
    queryKey: ["sources"],
    queryFn: financeService.fetchSources,
  });

  const {
    data: priceLogs = [],
    isLoading: isLogsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ["price-logs", selectedMetalForDetail?.id],
    queryFn: () => financeService.fetchPriceLogs(selectedMetalForDetail!.id),
    enabled: !!selectedMetalForDetail,
  });
  // Mutations
  const updateMetalMutation = useMutation({
    mutationFn: financeService.updateMetalPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metal-prices"] });
      queryClient.invalidateQueries({ queryKey: ["elements"] });
      handleClosePriceUpdateModal();
    },
  });

  const createSourceMutation = useMutation({
    mutationFn: financeService.createSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      handleCloseSourceModal();
    },
  });

  const deleteMetalMutation = useMutation({
    mutationFn: financeService.deleteElement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      console.error("Element o'chirishda xato:", error);
    },
  });

  // Data processing
  const metalPrices = metalPricesData || [];

  // Elements map yaratish
  const elementsMap = elementsListData.reduce((acc: any, element: any) => {
    acc[element.id] = element;
    return acc;
  }, {});

  // Debug
  console.log("Elements map:", elementsMap);
  console.log("First metal price:", metalPrices[0]);

  // Elementlarni guruhlash (har bir element uchun manbalar bo'yicha)
  const groupedElements = metalPrices.reduce(
    (acc: any, item: any, index: number) => {
      // Element nomini elementsMap dan olish
      const element = elementsMap[item.elementId];
      let key = "";

      if (element && element.name) {
        key = element.name;
      } else if (element && element.symbol) {
        key = element.symbol;
      } else if (item.elementName) {
        key = item.elementName;
      } else if (item.metalType) {
        key = item.metalType;
      } else {
        key = `Element_${item.elementId}`;
      }
      if (!acc[key]) {
        acc[key] = {
          elementName: key,
          metalType: item.element?.metalType || item.metalType,
          sources: {},
          averagePrice: 0,
          changePercent: 0,
          lastUpdated: item.updatedAt,
        };
      }

      acc[key].sources[item.source?.name || "Unknown"] = {
        currentPrice: item.currentPrice,
        previousPrice: item.previousPrice,
        changePercent: item.changePercent
          ? Number(item.changePercent)
          : undefined,
        currency: item.currency,
        sourceUrl: item.source?.url,
        id: item.id,
      };

      return acc;
    },
    {} as Record<string, any>
  );

  // Guruhlangan elementlarni massivga aylantirish
  const processedElements = Object.values(groupedElements) as any[];

  const filteredMetalPrices = processedElements.filter((item: any) => {
    const matchesSource =
      !selectedSourceFilter ||
      Object.keys(item.sources).some(
        (sourceName) =>
          item.sources[sourceName] &&
          Object.values(sources)
            .find((s) => s.name === sourceName)
            ?.id.toString() === selectedSourceFilter
      );

    const matchesSearch =
      !searchQuery ||
      item.elementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metalType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSource && matchesSearch;
  });

  const totalItems = filteredMetalPrices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMetalPrices = filteredMetalPrices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isLoading =
    isMetalPricesLoading || isElementsListLoading || isSourcesLoading;
  const error = metalPricesError || elementsListError || sourcesError;

  // Handlers
  const handlePriceUpdate = (
    item: any,
    sourceName: string,
    sourceData: any
  ) => {
    const sourceObj = sources.find((s) => s.name === sourceName);
    console.log(item);
    setEditingPriceItem({
      id: sourceData.id,
      elementName: item.elementName,
      sourceName: sourceName,
      sourceId: sourceObj?.id,
      ...sourceData,
    });

    setPriceUpdateData({
      currentPrice: sourceData.currentPrice?.toString() || "",
      previousPrice: sourceData.previousPrice?.toString() || "",
      currency: sourceData.currency || "UZS",
      changeReason: "",
    });

    setIsPriceUpdateModalOpen(true);
  };

  const handleClosePriceUpdateModal = () => {
    setIsPriceUpdateModalOpen(false);
    setEditingPriceItem(null);
    setPriceUpdateData({
      currentPrice: "",
      previousPrice: "",
      currency: "UZS",
      changeReason: "",
    });
  };

  const handleOpenSourceModal = () => {
    setSourceFormData({ name: "", url: "", description: "" });
    setIsSourceModalOpen(true);
  };

  const handleCloseSourceModal = () => {
    setIsSourceModalOpen(false);
    setSourceFormData({ name: "", url: "", description: "" });
  };

  const handleRowClick = (element: any) => {
    setSelectedElementForChart(element);
    setSelectedSourceType("all");
    setIsDetailModalOpen(true);
  };

  const handleSourceClick = (element: any, sourceType: string) => {
    setSelectedElementForChart(element);
    setSelectedSourceType(sourceType);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedElementForChart(null);
    setSelectedSourceType("all");
  };

  const handlePriceUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      elementName: editingPriceItem.elementName,
      metalType: editingPriceItem.metalType,
      currentPrice: parseFloat(priceUpdateData.currentPrice),
      previousPrice: priceUpdateData.previousPrice
        ? parseFloat(priceUpdateData.previousPrice)
        : editingPriceItem.currentPrice, // Eski narxni saqlash
      currency: priceUpdateData.currency,
      unit: editingPriceItem.unit || "",
      sourceId: editingPriceItem.sourceId,
    };

    if (editingPriceItem) {
      updateMetalMutation.mutate({
        id: editingPriceItem.id,
        data,
      });
      handleClosePriceUpdateModal();
    }
  };

  const handleSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createSourceMutation.mutate({
      name: sourceFormData.name,
      url: sourceFormData.url,
      description: sourceFormData.description,
    });
  };

  const handleViewDetail = (item: any) => {
    // Agar bu groupedElement bo'lsa, birinchi source'dan ma'lumot olish
    if (item.sources) {
      const firstSource = Object.values(item.sources)[0] as any;
      const firstSourceName = Object.keys(item.sources)[0];
      const sourceObj = sources.find((s) => s.name === firstSourceName);

      const metalPriceItem = {
        id: firstSource?.id,
        elementName: item.elementName,
        metalType: item.metalType,
        currentPrice: firstSource?.currentPrice,
        previousPrice: firstSource?.previousPrice,
        currency: firstSource?.currency || "UZS",
        sourceId: sourceObj?.id,
        source: sourceObj,
      } as MetalPrice;

      setSelectedMetalForDetail(metalPriceItem);
    } else {
      setSelectedMetalForDetail(item);
    }
  };

  const handleCloseDetail = () => {
    setSelectedMetalForDetail(null);
  };

  const handleDelete = (item: any) => {
    if (item.sources) {
      const firstSource = Object.values(item.sources)[0] as any;
      const firstSourceId = firstSource?.id;

      if (
        window.confirm(
          `"${item.elementName}" элементини ўчиришга ишонғингиз комилми?`
        )
      ) {
        deleteMetalMutation.mutate(firstSourceId);
      }
    } else {
      if (
        window.confirm(
          `"${item.elementName}" элементини ўчиришга ишонғингиз комилми?`
        )
      ) {
        deleteMetalMutation.mutate(item.id);
      }
    }
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSourceFilter]);

  // Agar detail view ochilgan bo'lsa, uni ko'rsatamiz
  if (selectedMetalForDetail) {
    return (
      <PriceLogsDetail
        selectedMetal={selectedMetalForDetail}
        priceLogs={priceLogs}
        isLoading={isLogsLoading}
        error={logsError}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Молия</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenSourceModal}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Манба қўшиш
          </button>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Янгилаш
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                {error?.message || "Номаълум хато"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <SearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSourceFilter={selectedSourceFilter}
        setSelectedSourceFilter={setSelectedSourceFilter}
        sources={sources}
        filteredCount={totalItems}
        totalCount={metalPrices.length}
      />

      {/* Metal Table */}
      <MetalTable
        metalPrices={paginatedMetalPrices}
        isLoading={isLoading}
        onPriceUpdate={handlePriceUpdate}
        onViewDetail={handleViewDetail}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        onSourceClick={handleSourceClick}
        searchQuery={searchQuery}
        selectedSourceFilter={selectedSourceFilter}
        sources={sources}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Price Update Modal */}
      <PriceUpdateModal
        isOpen={isPriceUpdateModalOpen}
        onClose={handleClosePriceUpdateModal}
        onSubmit={handlePriceUpdateSubmit}
        editingItem={editingPriceItem}
        formData={priceUpdateData}
        setFormData={setPriceUpdateData}
        isLoading={updateMetalMutation.isPending}
      />

      {/* Source Modal */}
      <SourceModal
        isOpen={isSourceModalOpen}
        onClose={handleCloseSourceModal}
        onSubmit={handleSourceSubmit}
        formData={sourceFormData}
        setFormData={setSourceFormData}
        isLoading={createSourceMutation.isPending}
      />

      {/* Price Chart Modal */}
      <PriceChartModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        element={selectedElementForChart}
        sourceType={selectedSourceType}
        sources={sources}
      />
    </div>
  );
};

export default Finance;
