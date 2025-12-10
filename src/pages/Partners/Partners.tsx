import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Filter,
} from "lucide-react";
import { getAllPartners } from "../../services/partnersService";
import { Partner } from "../../types/partner";

const Partners: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: partners = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["partners"],
    queryFn: getAllPartners,
  });

  const filteredPartners = (partners as Partner[]).filter(
    (partner: Partner) => {
      const matchesSearch =
        (partner.company || partner.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || partner.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return (
      statusStyles[status as keyof typeof statusStyles] ||
      "bg-gray-100 text-gray-800"
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        {t("partners.loading_error")}
      </div>
    );
  }

  const activePartners = (partners as Partner[]).filter(
    (p: Partner) => p.status === "active"
  ).length;
  const pendingPartners = (partners as Partner[]).filter(
    (p: Partner) => p.status === "pending"
  ).length;

  return (
    <div className="p-6 max-md:pt-[50px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("partners.title")}
            </h1>
            <p className="text-gray-600">{t("partners.all_partners_list")}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("partners.total_partners")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(partners as Partner[]).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Building className="h-10 w-10 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("partners.active_partners")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activePartners}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Filter className="h-10 w-10 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("partners.pending_partners")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingPartners}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("partners.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t("partners.all_statuses")}</option>
            <option value="active">{t("partners.active")}</option>
            <option value="inactive">{t("partners.inactive")}</option>
            <option value="pending">{t("partners.pending")}</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("partners.company")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("partners.contact_person")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("partners.contact_info")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("partners.address")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("partners.status")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.map((partner: Partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {partner.company || partner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.website ||
                            t("partners.website_not_specified")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {partner.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {partner.position || t("partners.position_not_specified")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 mb-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {partner.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {partner.phone || t("partners.phone_not_specified")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {partner.description ||
                        t("partners.address_not_specified")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        partner.status
                      )}`}
                    >
                      {partner.status === "active"
                        ? t("partners.active")
                        : partner.status === "inactive"
                        ? t("partners.inactive")
                        : t("partners.pending")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("partners.no_partners_found")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("partners.no_matching_partners")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
