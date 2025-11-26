import React, { useState } from "react";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Building,
  Globe,
  User,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Partner } from "../../../types/partner";

interface PartnersTableProps {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onView: (partner: Partner) => void;
  isLoading?: boolean;
}

const PartnersTable: React.FC<PartnersTableProps> = ({
  partners,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onView,
  isLoading = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Фаол
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <XCircle className="w-3 h-3 mr-1" />
            Кутилмоқда
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Нофаол
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Номаълум
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!partners.length) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-8 sm:p-12 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Ҳеч қандай ҳамкор топилмади
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Янги ҳамкор қўшиш учун "Ҳамкор қўшиш" тугмасини босинг
          </p>
        </div>
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
                Ҳамкор
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Алоқа маълумотлари
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Компания
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Қўшилган сана
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Амаллар</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.map((partner) => (
              <tr
                key={partner.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {partner.name}
                      </div>
                      {partner.position && (
                        <div className="text-sm text-gray-500">
                          {partner.position}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {partner.email}
                    </div>
                    {partner.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {partner.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {partner.company && (
                      <div className="flex items-center text-sm text-gray-900">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {partner.company}
                      </div>
                    )}
                    {partner.website && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-600"
                        >
                          Веб-сайт
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(partner.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(partner.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === partner.id ? null : partner.id
                      )
                    }
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openDropdown === partner.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onView(partner);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Кўриш
                        </button>
                        <button
                          onClick={() => {
                            onEdit(partner);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Таҳрирлаш
                        </button>
                        {partner.status === "active" ? (
                          <button
                            onClick={() => {
                              onDeactivate(partner.id);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 w-full text-left"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Фаолликдан олиб ташлаш
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onActivate(partner.id);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Фаоллаштириш
                          </button>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Ҳақиқатдан ҳам бу ҳамкорни ўчирмоқчимисиз?"
                              )
                            ) {
                              onDelete(partner.id);
                            }
                            setOpenDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ўчириш
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnersTable;
