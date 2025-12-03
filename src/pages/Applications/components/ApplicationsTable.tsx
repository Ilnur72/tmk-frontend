import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Building,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Application } from "../../../types/application";

interface ApplicationsTableProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
  onView: (application: Application) => void;
  onStatusChange?: (
    id: string,
    status: "pending" | "approved" | "rejected" | "in-review"
  ) => void;
  onAddComment?: (id: string, comment: string) => void;
  isLoading?: boolean;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onAddComment,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean;
    applicationId: string;
    comment: string;
  }>({ isOpen: false, applicationId: "", comment: "" });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {t("applications.status_labels.approved")}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {t("applications.status_labels.pending")}
          </span>
        );
      case "in-review":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {t("applications.status_labels.in_review")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t("applications.status_labels.rejected")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {t("applications.status_labels.unknown")}
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
      <div className="bg-white shadow overflow-hidden sm:rounded-lg h-full">
        <div className="px-4 py-5 sm:p-6 h-full">
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

  if (!applications.length) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg h-full flex items-center justify-center">
        <div className="px-4 py-8 sm:p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("applications.no_applications_found")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("applications.create_new_application_hint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg flex-1 flex flex-col">
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("applications.application")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("applications.partner")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("applications.location")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("applications.contact_info")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("applications.status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("applications.date")}
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">{t("applications.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr
                key={application.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {application.coverImage ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={application.coverImage}
                          alt={application.title}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {application.title}
                      </div>
                      {application.tagline && (
                        <div className="text-sm text-gray-500">
                          {application.tagline}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {application.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Building className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {application.partner?.companyName ||
                          t("applications.unknown")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.partner?.contactPerson ||
                          t("applications.unknown")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {application.location}
                    </div>
                    <div className="text-sm text-gray-500 ml-6">
                      {application.region}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {application.phoneNumber}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${application.contactEmail}`}
                        className="hover:text-indigo-600"
                      >
                        {application.contactEmail}
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(application.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(application.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === application.id ? null : application.id
                      )
                    }
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openDropdown === application.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onView(application);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t("applications.view_details")}
                        </button>
                        <button
                          onClick={() => {
                            onEdit(application);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t("applications.edit")}
                        </button>

                        {/* Status change submenu */}
                        {onStatusChange && (
                          <>
                            <div className="relative group">
                              <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                {t("applications.change_status")}
                              </div>
                              <div className="absolute right-full top-0 w-48 bg-white rounded-md shadow-lg border hidden group-hover:block mr-1">
                                <div className="py-1">
                                  {application.status !== "pending" && (
                                    <button
                                      onClick={() => {
                                        onStatusChange(
                                          application.id,
                                          "pending"
                                        );
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 w-full text-left"
                                    >
                                      {t("applications.status_actions.pending")}
                                    </button>
                                  )}
                                  {application.status !== "in-review" && (
                                    <button
                                      onClick={() => {
                                        onStatusChange(
                                          application.id,
                                          "in-review"
                                        );
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                                    >
                                      {t(
                                        "applications.status_actions.in_review"
                                      )}
                                    </button>
                                  )}
                                  {application.status !== "approved" && (
                                    <button
                                      onClick={() => {
                                        onStatusChange(
                                          application.id,
                                          "approved"
                                        );
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                    >
                                      {t(
                                        "applications.status_actions.approved"
                                      )}
                                    </button>
                                  )}
                                  {application.status !== "rejected" && (
                                    <button
                                      onClick={() => {
                                        onStatusChange(
                                          application.id,
                                          "rejected"
                                        );
                                        setOpenDropdown(null);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                    >
                                      {t(
                                        "applications.status_actions.rejected"
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Admin comment button */}
                        {onAddComment && (
                          <button
                            onClick={() => {
                              setCommentModal({
                                isOpen: true,
                                applicationId: application.id,
                                comment: application.adminComment || "",
                              });
                              setOpenDropdown(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {t("applications.add_comment")}
                          </button>
                        )}

                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            if (
                              window.confirm(t("applications.confirm_delete"))
                            ) {
                              onDelete(application.id);
                            }
                            setOpenDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("applications.delete")}
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

      {/* Admin Comment Modal */}
      {commentModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t("applications.admin_comment")}
                    </h3>
                    <div className="mt-2">
                      <textarea
                        value={commentModal.comment}
                        onChange={(e) =>
                          setCommentModal((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                        placeholder={t("applications.enter_comment")}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    if (onAddComment) {
                      onAddComment(
                        commentModal.applicationId,
                        commentModal.comment
                      );
                    }
                    setCommentModal({
                      isOpen: false,
                      applicationId: "",
                      comment: "",
                    });
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {t("applications.save")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCommentModal({
                      isOpen: false,
                      applicationId: "",
                      comment: "",
                    })
                  }
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {t("applications.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable;
