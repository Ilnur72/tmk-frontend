import React, { useState } from "react";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
import { MetalPrice, MetalType } from "../../types/finance";

// Services
import * as financeService from "../../services/financeService";

// Components
import SearchAndFilter from "../../components/Finance/SearchAndFilter";
import MetalTable from "../../components/Finance/MetalTable";
import Pagination from "../../components/Finance/Pagination";
import MetalModal from "../../components/Finance/MetalModal";
import SourceModal from "../../components/Finance/SourceModal";
import PriceLogsDetail from "../../components/Finance/PriceLogsDetail";

const Finance: React.FC = () => {
  const queryClient = useQueryClient();

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MetalPrice | null>(null);
  const [selectedMetalForDetail, setSelectedMetalForDetail] =
    useState<MetalPrice | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [metalFormData, setMetalFormData] = useState({
    elementName: "",
    metalType: MetalType.STEEL,
    currentPrice: "",
    previousPrice: "",
    currency: "UZS",
    unit: "",
    sourceId: "",
  });

  const [sourceFormData, setSourceFormData] = useState({
    name: "",
    url: "",
    description: "",
  });

  // React Query hooks
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: financeService.fetchDashboardData,
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
  const createMetalMutation = useMutation({
    mutationFn: financeService.createMetalPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      handleCloseModal();
    },
  });

  const updateMetalMutation = useMutation({
    mutationFn: financeService.updateMetalPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      handleCloseModal();
    },
  });

  const createSourceMutation = useMutation({
    mutationFn: financeService.createSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      handleCloseSourceModal();
    },
  });

  // Data processing
  const metalPrices = dashboardData?.metalPrices || [];
  const filteredMetalPrices = metalPrices.filter((item) => {
    const matchesSource =
      !selectedSourceFilter ||
      item.sourceId.toString() === selectedSourceFilter;
    const matchesSearch =
      !searchQuery ||
      item.elementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSource && matchesSearch;
  });

  const totalItems = filteredMetalPrices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMetalPrices = filteredMetalPrices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isLoading = isDashboardLoading || isSourcesLoading;
  const error = dashboardError || sourcesError;

  // Handlers
  const handleOpenModal = (item?: MetalPrice) => {
    if (item) {
      setEditingItem(item);
      setMetalFormData({
        elementName: item.elementName,
        metalType: item.metalType,
        currentPrice: item.currentPrice.toString(),
        previousPrice: item.previousPrice?.toString() || "",
        currency: item.currency || "UZS",
        unit: item.unit || "",
        sourceId: item.sourceId.toString(),
      });
    } else {
      setEditingItem(null);
      setMetalFormData({
        elementName: "",
        metalType: MetalType.STEEL,
        currentPrice: "",
        previousPrice: "",
        currency: "UZS",
        unit: "",
        sourceId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setMetalFormData({
      elementName: "",
      metalType: MetalType.STEEL,
      currentPrice: "",
      previousPrice: "",
      currency: "UZS",
      unit: "",
      sourceId: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      elementName: metalFormData.elementName,
      metalType: metalFormData.metalType,
      currentPrice: parseFloat(metalFormData.currentPrice),
      previousPrice: metalFormData.previousPrice
        ? parseFloat(metalFormData.previousPrice)
        : undefined,
      currency: metalFormData.currency,
      unit: metalFormData.unit,
      sourceId: parseInt(metalFormData.sourceId),
    };

    if (editingItem) {
      updateMetalMutation.mutate({ id: editingItem.id, data });
    } else {
      createMetalMutation.mutate(data);
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

  const handleViewDetail = (item: MetalPrice) => {
    setSelectedMetalForDetail(item);
  };

  const handleCloseDetail = () => {
    setSelectedMetalForDetail(null);
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
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Металл қўшиш
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
        onEdit={handleOpenModal}
        onViewDetail={handleViewDetail}
        searchQuery={searchQuery}
        selectedSourceFilter={selectedSourceFilter}
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

      {/* Metal Modal */}
      <MetalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        formData={metalFormData}
        setFormData={setMetalFormData}
        sources={sources}
        isLoading={
          createMetalMutation.isPending || updateMetalMutation.isPending
        }
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
    </div>
  );
};

export default Finance;
