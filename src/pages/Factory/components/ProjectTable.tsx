import React from "react";
import { useTranslation } from "react-i18next";
import { FactoryInterface } from "../types/factory";
import { API_URL } from "../../../config/const";

interface ProjectTableProps {
  factories: FactoryInterface[];
  onEditProject: (factoryId: number) => void;
  onDeleteProject: (factoryId: number, factoryName: string) => void;
  onParameterControl: (factoryId: number) => void;
  onImageModal: (images: string[], index: number) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  factories,
  onEditProject,
  onDeleteProject,
  onParameterControl,
  onImageModal,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      registration: {
        label: "Рўйхатдан ўтиш",
        color: "bg-yellow-100 text-yellow-800",
      },
      construction: { label: "Қурилиш", color: "bg-blue-100 text-blue-800" },
      started: {
        label: "Ишга туширилган",
        color: "bg-green-100 text-green-800",
      },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  const getImages = (factory: FactoryInterface): string[] => {
    if (factory.images) {
      try {
        if (Array.isArray(factory.images)) {
          return factory.images;
        }
        return JSON.parse(factory.images as string);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  return (
    <div className="mt-5 overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              №
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Лойиҳа номи
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Корхона номи
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ҳудуд
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Аҳамияти
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ҳолати
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Бажарилиши
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Амаллар
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {factories.map((factory, index) => {
            return (
              <tr
                key={factory.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {factory.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {factory.enterprise_name || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {factory.region || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {factory.importance || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(factory.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${factory.work_persent || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {factory.work_persent || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onParameterControl(factory.id)}
                      className="text-cyan-600 hover:text-cyan-900 transition-colors"
                      title="Параметрларни бошқариш"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEditProject(factory.id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Таҳрирлаш"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteProject(factory.id, factory.name)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Ўчириш"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {factories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Ҳеч қандай лойиҳа топилмади
        </div>
      )}
    </div>
  );
};

export default ProjectTable;
