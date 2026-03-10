import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Filter,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import { getAllPartners } from "../../services/partnersService";
import { Partner } from "../../types/partner";
import {
  getAllApplications,
  updateApplication,
  updateApplicationStatus,
  updateApplicationComment,
  deleteApplication,
} from "../../services/applicationsService";
import { Application, UpdateApplicationDto } from "../../types/application";
import ApplicationModal from "../Applications/components/ApplicationModal";
import ApplicationsTable from "../Applications/components/ApplicationsTable";
import { showToast } from "../../utils/toast";

const Partners: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") === "arizalar" ? "arizalar" : "hamkorlar";
  const [activeTab, setActiveTab] = useState<"hamkorlar" | "arizalar">(tabFromUrl);

  /* ─── Hamkorlar state ─────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  /* ─── Arizalar state ─────────────────────────────────────────── */
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState<string>("all");
  const [appRegion, setAppRegion] = useState<string>("all");
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view" as "edit" | "view",
    application: null as Application | null,
  });

  const queryClient = useQueryClient();

  // Switch tab and update URL
  const switchTab = (tab: "hamkorlar" | "arizalar") => {
    setActiveTab(tab);
    setSearchParams(tab === "arizalar" ? { tab: "arizalar" } : {});
  };

  // Sync tab if URL changes (e.g. ?tab=arizalar from Partners table link)
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  /* ─── Queries ─────────────────────────────────────────────────── */
  const {
    data: partners = [],
    isLoading: partnersLoading,
    error: partnersError,
  } = useQuery({ queryKey: ["partners"], queryFn: getAllPartners });

  const {
    data: applications = [] as Application[],
    isLoading: appsLoading,
    refetch: appsRefetch,
    error: appsError,
  } = useQuery({ queryKey: ["applications"], queryFn: getAllApplications });

  /* ─── Application mutations ───────────────────────────────────── */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationDto }) =>
      updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setModalState({ isOpen: false, mode: "view", application: null });
      showToast(t("applications.updated_success"), "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || t("applications.update_error"), "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast(t("applications.deleted_success"), "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || t("applications.delete_error"), "error");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "approved" | "rejected" | "in-review" }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast(t("applications.status_updated"), "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || t("applications.status_update_error"), "error");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      updateApplicationComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      showToast(t("applications.comment_added"), "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || t("applications.comment_error"), "error");
    },
  });

  /* ─── Handlers ────────────────────────────────────────────────── */
  const handleStatusChange = (id: string, status: "pending" | "approved" | "rejected" | "in-review") => {
    updateStatusMutation.mutate({ id, status });
  };
  const handleAddComment = (id: string, comment: string) => {
    updateCommentMutation.mutate({ id, comment });
  };
  const handleSave = (data: UpdateApplicationDto) => {
    if (modalState.mode === "edit" && modalState.application) {
      updateMutation.mutate({ id: modalState.application.id, data });
    }
  };
  const handleDelete = (id: string) => {
    if (window.confirm(t("applications.delete_confirm"))) deleteMutation.mutate(id);
  };
  const closeModal = () => setModalState({ isOpen: false, mode: "view", application: null });

  /* ─── Derived data ─────────────────────────────────────────────── */
  const filteredPartners = (partners as Partner[]).filter((p) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (p.company || p.name || "").toLowerCase().includes(s) ||
      (p.name || "").toLowerCase().includes(s) ||
      (p.email || "").toLowerCase().includes(s);
    return matchesSearch && (statusFilter === "all" || p.status === statusFilter);
  });

  const regions = Array.from(new Set((applications as Application[]).map((a) => a.region))).filter(Boolean);

  const filteredApps = (applications as Application[]).filter((a) => {
    const s = appSearch.toLowerCase();
    const matchSearch =
      (a.title || "").toLowerCase().includes(s) ||
      (a.description || "").toLowerCase().includes(s) ||
      (a.location || "").toLowerCase().includes(s) ||
      (a.region || "").toLowerCase().includes(s);
    return matchSearch && (appStatus === "all" || a.status === appStatus) && (appRegion === "all" || a.region === appRegion);
  });

  const appStats = {
    total: (applications as Application[]).length,
    approved: (applications as Application[]).filter((a) => a.status === "approved").length,
    pending: (applications as Application[]).filter((a) => a.status === "pending").length,
    inReview: (applications as Application[]).filter((a) => a.status === "in-review").length,
    rejected: (applications as Application[]).filter((a) => a.status === "rejected").length,
  };

  const activePartners = (partners as Partner[]).filter((p) => p.status === "active").length;
  const pendingPartners = (partners as Partner[]).filter((p) => p.status === "pending").length;

  const getStatusBadge = (status: string) => {
    const s: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return s[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="px-3 pt-3 pb-4 md:p-6 max-md:pt-[50px]">
      {/* Header */}
      <div className="mb-3 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
          {t("partners.title")}
        </h1>
        <p className="text-xs md:text-sm text-gray-600">{t("partners.all_partners_list")}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => switchTab("hamkorlar")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "hamkorlar"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4" />
          {t("partners.title")}
          <span className="ml-1 bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
            {(partners as Partner[]).length}
          </span>
        </button>
        <button
          onClick={() => switchTab("arizalar")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "arizalar"
              ? "border-blue-500 text-blue-500"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          {t("applications.title")}
          <span className="ml-1 bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
            {(applications as Application[]).length}
          </span>
        </button>
      </div>

      {/* ─────────────── HAMKORLAR TAB ─────────────── */}
      {activeTab === "hamkorlar" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-6 mb-3 md:mb-6">
            {[
              { icon: Users, color: "text-blue-500", label: t("partners.total_partners"), value: (partners as Partner[]).length },
              { icon: Building, color: "text-green-500", label: t("partners.active_partners"), value: activePartners },
              { icon: Filter, color: "text-yellow-500", label: t("partners.pending_partners"), value: pendingPartners },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="bg-white p-3 md:p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Icon className={`h-7 w-7 md:h-10 md:w-10 ${color} flex-shrink-0`} />
                  <div className="ml-2 md:ml-4 min-w-0">
                    <p className="text-[10px] md:text-sm font-medium text-gray-600 truncate">{label}</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white p-3 md:p-6 rounded-lg shadow mb-3 md:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("partners.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs md:text-sm border border-gray-300 rounded-md focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-md focus:outline-none"
              >
                <option value="all">{t("partners.all_statuses")}</option>
                <option value="active">{t("partners.active")}</option>
                <option value="inactive">{t("partners.inactive")}</option>
                <option value="pending">{t("partners.pending")}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {partnersLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            </div>
          ) : partnersError ? (
            <div className="text-center text-red-600 p-8">{t("partners.loading_error")}</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">{t("partners.company")}</th>
                      <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">{t("partners.contact_person")}</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("partners.contact_info")}</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("partners.address")}</th>
                      <th className="px-3 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">{t("partners.status")}</th>
                      <th className="px-3 py-2 md:px-6 md:py-3 text-center text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Arizalar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPartners.map((partner: Partner) => (
                      <tr key={partner.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="h-5 w-5 md:h-8 md:w-8 text-gray-400 mr-2 md:mr-3 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">{partner.company || partner.name}</div>
                              <div className="text-[10px] md:text-sm text-gray-500 truncate max-w-[100px] md:max-w-none">{partner.website || t("partners.website_not_specified")}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm font-medium text-gray-900">{partner.name}</div>
                          <div className="text-[10px] md:text-sm text-gray-500">{partner.position || t("partners.position_not_specified")}</div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 mb-1"><Mail className="h-4 w-4 mr-2 text-gray-400" />{partner.email}</div>
                          <div className="flex items-center text-sm text-gray-900"><Phone className="h-4 w-4 mr-2 text-gray-400" />{partner.phone || t("partners.phone_not_specified")}</div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900"><MapPin className="h-4 w-4 mr-2 text-gray-400" />{partner.description || t("partners.address_not_specified")}</div>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs font-semibold rounded-full ${getStatusBadge(partner.status)}`}>
                            {partner.status === "active" ? t("partners.active") : partner.status === "inactive" ? t("partners.inactive") : t("partners.pending")}
                          </span>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setAppSearch(partner.name);
                              switchTab("arizalar");
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] md:text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <FileText className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            Ko'rish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPartners.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t("partners.no_partners_found")}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t("partners.no_matching_partners")}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─────────────── ARIZALAR TAB ─────────────── */}
      {activeTab === "arizalar" && (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
            <div>
              <p className="text-xs md:text-sm text-gray-700">{t("applications.subtitle")}</p>
            </div>
            <button
              onClick={() => appsRefetch()}
              disabled={appsLoading}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${appsLoading ? "animate-spin" : ""}`} />
              {t("applications.refresh")}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-5 mb-3 md:mb-6">
            {[
              { color: "gray", label: t("applications.total"), value: appStats.total },
              { color: "green", label: t("applications.approved"), value: appStats.approved },
              { color: "yellow", label: t("applications.pending"), value: appStats.pending },
              { color: "blue", label: t("applications.in_review"), value: appStats.inReview },
              { color: "red", label: t("applications.rejected"), value: appStats.rejected },
            ].map(({ color, label, value }) => (
              <div key={label} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-2 md:p-5">
                  <div className="flex items-center gap-1.5 md:gap-3">
                    <div className={`h-4 w-4 md:h-6 md:w-6 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                      <div className={`h-2 w-2 md:h-3 md:w-3 rounded-full bg-${color}-400`} />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[9px] md:text-sm font-medium text-gray-500 truncate">{label}</dt>
                      <dd className="text-sm md:text-lg font-medium text-gray-900">{value}</dd>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-3 md:mb-6">
            <div className="px-3 py-2 md:px-6 md:py-4">
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("applications.search_placeholder")}
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs md:text-sm w-full border border-gray-300 rounded-md focus:outline-none"
                  />
                  {appSearch && (
                    <button onClick={() => setAppSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <select value={appStatus} onChange={(e) => setAppStatus(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1.5 text-xs md:text-sm focus:outline-none">
                    <option value="all">{t("applications.all_statuses")}</option>
                    <option value="pending">{t("applications.pending")}</option>
                    <option value="in-review">{t("applications.in_review")}</option>
                    <option value="approved">{t("applications.approved")}</option>
                    <option value="rejected">{t("applications.rejected")}</option>
                  </select>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <select value={appRegion} onChange={(e) => setAppRegion(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1.5 text-xs md:text-sm focus:outline-none">
                    <option value="all">{t("applications.all_regions")}</option>
                    {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-2 text-[10px] md:text-sm text-gray-600">
                {t("applications.showing_results", { filtered: filteredApps.length, total: (applications as Application[]).length })}
              </div>
            </div>
          </div>

          {/* Table */}
          {appsError ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{t("applications.load_error_message")}</div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0" style={{ minHeight: "400px" }}>
              <ApplicationsTable
                applications={filteredApps}
                isLoading={appsLoading}
                onEdit={(app) => setModalState({ isOpen: true, mode: "edit", application: app })}
                onView={(app) => setModalState({ isOpen: true, mode: "view", application: app })}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onAddComment={handleAddComment}
              />
            </div>
          )}

          <ApplicationModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSave={handleSave}
            application={modalState.application}
            mode={modalState.mode}
            isLoading={updateMutation.isPending}
          />
        </>
      )}
    </div>
  );
};

export default Partners;
