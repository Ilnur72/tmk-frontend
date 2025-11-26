import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, RefreshCw, MapPin } from "lucide-react";
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
      showToast("Ариза маълумотлари янгиланди", "success");
    },
    onError: (error: any) => {
      console.error("Update application error:", error);
      showToast(
        error.response?.data?.message || "Ариза янгилашда хато",
        "error"
      );
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast("Ариза ўчирилди", "success");
    },
    onError: (error: any) => {
      console.error("Delete application error:", error);
      showToast(
        error.response?.data?.message || "Ариза ўчиришда хато",
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
      showToast("Ариза статуси янгиланди", "success");
    },
    onError: (error: any) => {
      console.error("Update status error:", error);
      showToast(
        error.response?.data?.message || "Статус янгилашда хато",
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
      showToast("Админ изоҳи қўшилди", "success");
    },
    onError: (error: any) => {
      console.error("Update comment error:", error);
      showToast(error.response?.data?.message || "Изоҳ қўшишда хато", "error");
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
    if (window.confirm("Ҳақиқатдан ҳам бу аризани ўчирмоқчимисиз?")) {
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
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Маълумот юклашда хато
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Ариза маълумотларини юклашда хато юз берди. Илтимос, қайта
                  уриниб кўринг.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Қайта уринib кўриш
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Аризаларни бошқариш
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Ҳамкорлар томонидан юборилган аризаларни кўринг ва тасдиқланг
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
            Янгилаш
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mt-8 mb-8">
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
                    Жами
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
                    Тасдиқланганлар
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
                    Кутилаётганлар
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
                    Кўрилаётганлар
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
                    Рад этилганлар
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
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ариза номи, тафсилоти ёки жой бўйича қидириш..."
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
                <option value="all">Барча статуслар</option>
                <option value="pending">Кутилмоқда</option>
                <option value="in-review">Кўрилаётган</option>
                <option value="approved">Тасдиқланган</option>
                <option value="rejected">Рад этилган</option>
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
                <option value="all">Барча вилоятлар</option>
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
            {filteredApplications.length} дан {applications.length} ариза
            кўрсатилмоқда
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <ApplicationsTable
        applications={filteredApplications}
        isLoading={isLoading}
        onEdit={handleEditApplication}
        onView={handleViewApplication}
        onDelete={handleDeleteApplication}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
      />

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
