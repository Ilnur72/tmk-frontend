import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, RefreshCw, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import ApplicationModal from "./components/ApplicationModal";
import ApplicationsTable from "./components/ApplicationsTable";
import {
  getAllApplications,
  updateApplication,
  updateApplicationStatus,
  updateApplicationComment,
  deleteApplication,
} from "../../services/applicationsService";
import { Application, UpdateApplicationDto } from "../../types/application";
import { showToast } from "../../utils/toast";

const Applications: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view" as "edit" | "view",
    application: null as Application | null,
  });

  const queryClient = useQueryClient();

  // Fetch applications
  const {
    data: applications = [] as Application[],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: getAllApplications,
  });

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationDto }) =>
      updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setModalState({ isOpen: false, mode: "view", application: null });
      showToast(t("applications.updated_success"), "success");
    },
    onError: (error: any) => {
      console.error("Update application error:", error);
      showToast(
        error.response?.data?.message || t("applications.update_error"),
        "error"
      );
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast(t("applications.deleted_success"), "success");
    },
    onError: (error: any) => {
      console.error("Delete application error:", error);
      showToast(
        error.response?.data?.message || t("applications.delete_error"),
        "error"
      );
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "approved" | "rejected" | "in-review";
    }) => updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast(t("applications.status_updated"), "success");
    },
    onError: (error: any) => {
      console.error("Update status error:", error);
      showToast(
        error.response?.data?.message || t("applications.status_update_error"),
        "error"
      );
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      updateApplicationComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast(t("applications.comment_added"), "success");
    },
    onError: (error: any) => {
      console.error("Update comment error:", error);
      showToast(
        error.response?.data?.message || t("applications.comment_error"),
        "error"
      );
    },
  });

  // Handle modal actions
  const handleEditApplication = (application: Application) => {
    setModalState({ isOpen: true, mode: "edit", application });
  };

  const handleViewApplication = (application: Application) => {
    setModalState({ isOpen: true, mode: "view", application });
  };

  const handleDeleteApplication = (id: string) => {
    if (window.confirm(t("applications.delete_confirm"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (
    id: string,
    status: "pending" | "approved" | "rejected" | "in-review"
  ) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleAddComment = (id: string, comment: string) => {
    updateCommentMutation.mutate({ id, comment });
  };

  const handleSaveApplication = (applicationData: UpdateApplicationDto) => {
    if (modalState.mode === "edit" && modalState.application) {
      updateMutation.mutate({
        id: modalState.application.id,
        data: applicationData,
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "view", application: null });
  };

  // Filter applications
  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;
    const matchesRegion =
      regionFilter === "all" || application.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  // Get unique regions for filter
  const regions = Array.from(
    new Set(applications.map((app) => app.region))
  ).filter(Boolean);

  // Calculate statistics
  const applicationStats = {
    total: applications.length,
    approved: applications.filter((app) => app.status === "approved").length,
    pending: applications.filter((app) => app.status === "pending").length,
    inReview: applications.filter((app) => app.status === "in-review").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  if (error) {
    return (
      <div className="p-6 max-md:pt-[50px]">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("applications.load_error_title")}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{t("applications.load_error_message")}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  {t("applications.retry")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 flex flex-col max-md:pt-[50px]"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      <div className="sm:flex sm:items-center sm:justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("applications.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t("applications.subtitle")}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("applications.refresh")}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mt-8 mb-8 flex-shrink-0">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("applications.total")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applicationStats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("applications.approved")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applicationStats.approved}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("applications.pending")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applicationStats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("applications.in_review")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applicationStats.inReview}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("applications.rejected")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applicationStats.rejected}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("applications.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none "
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none "
              >
                <option value="all">{t("applications.all_statuses")}</option>
                <option value="pending">{t("applications.pending")}</option>
                <option value="in-review">{t("applications.in_review")}</option>
                <option value="approved">{t("applications.approved")}</option>
                <option value="rejected">{t("applications.rejected")}</option>
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none "
              >
                <option value="all">{t("applications.all_regions")}</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results info */}
          <div className="mt-4 text-sm text-gray-600">
            {t("applications.showing_results", {
              filtered: filteredApplications.length,
              total: applications.length,
            })}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div
        className="flex-1 flex flex-col min-h-0"
        style={{ minHeight: "400px" }}
      >
        <ApplicationsTable
          applications={filteredApplications}
          isLoading={isLoading}
          onEdit={handleEditApplication}
          onView={handleViewApplication}
          onDelete={handleDeleteApplication}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
        />
      </div>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSaveApplication}
        application={modalState.application}
        mode={modalState.mode}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default Applications;
