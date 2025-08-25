import React, { useState } from "react";
import {
  X,
  Building2,
  MapPin,
  Camera,
  Settings,
  Image,
  User,
  BarChart3,
  FileText,
  Video,
} from "lucide-react";
import { CameraType } from "../types/factory";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";

interface FactoryDetailsModalProps {
  factory: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function FactoryDetailsModal({
  factory,
  isOpen,
  onClose,
}: FactoryDetailsModalProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentCamera, setCurrentCamera] = useState<any>(null);

  if (!isOpen || !factory) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case "REGISTRATION":
        return "Расмийлаштириш жараёнида";
      case "CONSTRUCTION":
        return "Қурилиш";
      case "STARTED":
        return "Ишлаб турибди";
      default:
        return status;
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case "HIGH":
        return "Юқори";
      case "AVERAGE":
        return "Ўрта";
      case "LOW":
        return "Паст";
      default:
        return importance;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "REGISTRATION":
        return "bg-yellow-100 text-yellow-800";
      case "CONSTRUCTION":
        return "bg-blue-100 text-blue-800";
      case "STARTED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImportanceBadgeColor = (importance: string) => {
    switch (importance) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "AVERAGE":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const parseImages = (images: string | string[] | undefined): string[] => {
    if (!images) return [];
    if (typeof images === "string") {
      if (images === "[]") return [];
      try {
        return JSON.parse(images);
      } catch {
        return [images];
      }
    }
    return images;
  };

  const parseCoordinates = (
    coords: [number, number] | string | undefined
  ): string => {
    if (!coords) return "Координаталар топилмади";
    try {
      let coordsArray: [number, number];
      if (typeof coords === "string") {
        coordsArray = JSON.parse(coords);
      } else {
        coordsArray = coords;
      }
      return `${coordsArray[1] || "0.000000"}, ${coordsArray[0] || "0.000000"}`;
    } catch {
      return "Координаталар топилмади";
    }
  };

  const openImageModal = (
    imageName: string,
    index: number,
    images: string[]
  ) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const openVideoModal = (camera: any) => {
    setCurrentCamera(camera);
    setVideoModalOpen(true);
  };

  const images = parseImages(factory.images);
  const hasCustomFields =
    factory.custom_fields && Object.keys(factory.custom_fields).length > 0;
  const hasProjectValues =
    factory.project_values && Object.keys(factory.project_values).length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className={`bg-white relative flex flex-col rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100 mx-4 transition-all duration-300 ease-out ${
            isOpen ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {factory.name || "Лойиҳа тафсилотлари"}
                </h3>
                <p className="text-white/80 text-sm">
                  ID: {factory.id || "-"} | Сорт: {factory.sort_num || "-"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-colors p-2 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Images and Basic Info */}
              <div className=" space-y-4">
                {/* Images Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Image className="w-5 h-5 mr-2 text-cyan-600" />
                    Лойиҳа расмлари
                  </h4>
                  <div
                    className="flex space-x-3 overflow-x-auto pb-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#cbd5e0 #f7fafc",
                    }}
                  >
                    {images.length > 0 ? (
                      images.map((img, index) => (
                        <div
                          key={index}
                          className="relative cursor-pointer flex-shrink-0 group"
                          onClick={() => openImageModal(img, index, images)}
                        >
                          <img
                            src={`http://localhost:8085/mnt/tmkupload/factory-images/${img}`}
                            alt={`Factory image ${index + 1}`}
                            className="w-64 h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <div className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <svg
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                className="w-full h-full"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded pointer-events-none">
                            {index + 1}/{images.length}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Image className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500 text-sm">
                            Расм мавжуд эмас
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info Card - Асосий маълумотлар */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-cyan-600" />
                    Асосий маълумотлар
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Лойиҳа номи:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {factory.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Корхона номи:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {factory.enterprise_name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Лойиҳа мақсади:
                      </span>
                      <span className="font-medium text-gray-900">
                        {factory.project_goal || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Регион:</span>
                      <span className="font-medium text-gray-900">
                        {factory.region || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Лойиҳа жараёни:
                      </span>
                      <span className="font-medium text-gray-900">
                        {factory.work_percent || "-"} %
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Статус:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                          factory.status
                        )}`}
                      >
                        {getStatusText(factory.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Ахамияти:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceBadgeColor(
                          factory.importance
                        )}`}
                      >
                        {getImportanceText(factory.importance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 font-medium">
                        Координаталари:
                      </span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {parseCoordinates(factory.coords)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Custom Fields, Project Values */}
              <div className="space-y-4">
                {/* Custom Fields Card */}
                {hasCustomFields && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-cyan-600" />
                      Қўшимча майдонлар
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(factory.custom_fields!).map(
                        ([key, value]: [string, any]) => (
                          <div key={key} className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {key}
                            </div>
                            <div className="text-gray-600">{value}</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Project Values Card */}
                {hasProjectValues && (
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-cyan-600" />
                      Лойиҳа қийматлари
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(factory.project_values!).map(
                        ([key, value]: [string, any]) => {
                          // Agar child obyekt bo'lsa, uni skip qilish
                          if (key === "child") return null;

                          // Oddiy qiymatlarni ko'rsatish
                          if (typeof value !== "object" || value === null) {
                            return (
                              <div
                                key={key}
                                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                              >
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-700 mb-2">
                                    {key}
                                  </div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {value}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return null;
                        }
                      )}

                      {/* Child obyektlarini alohida ko'rsatish */}
                      {factory.project_values?.child &&
                        Object.entries(factory.project_values.child).map(
                          ([childKey, childValue]: [string, any]) => (
                            <div
                              key={childKey}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                            >
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  {childKey}
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                  {childValue}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Parameters and Video Surveillance */}
              <div className="space-y-4">
                {/* Parameters Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-cyan-600" />
                    Параметрлар
                  </h4>
                  <div className="space-y-2">
                    {factory.factoryParams &&
                    factory.factoryParams.length > 0 ? (
                      factory.factoryParams.map((param: any, index: any) => {
                        const status = param.status || 0;
                        const statusClass =
                          status === 1
                            ? "bg-green-100 text-green-800"
                            : status === 2
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800";
                        const statusText =
                          status === 1
                            ? "Яхши"
                            : status === 2
                            ? "Ёмон"
                            : "Нормал";
                        const statusIcon =
                          status === 1 ? "✓" : status === 2 ? "✗" : "○";

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {param.param?.name || "Номсиз параметр"}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                                >
                                  {statusIcon} {statusText}
                                </span>
                              </div>
                              {param.latestLog && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Қиймат:{" "}
                                  <span className="font-medium">
                                    {param.latestLog.value || "-"}
                                  </span>
                                </div>
                              )}
                              {param.latestLog?.date_update && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Янгиланган:{" "}
                                  {new Date(
                                    param.latestLog.date_update
                                  ).toLocaleDateString("uz-UZ")}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Settings className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          Бу лойиҳа учун параметрлар мавжуд эмас
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Surveillance Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-cyan-600" />
                    Видео кузатув
                  </h4>
                  <div className="space-y-3">
                    {factory.cameras && factory.cameras.length > 0 ? (
                      factory.cameras.map((camera: CameraType, index: any) => {
                        const statusColors = {
                          active: "bg-green-100 text-green-800",
                          inactive: "bg-red-100 text-red-800",
                          maintenance: "bg-yellow-100 text-yellow-800",
                          broken: "bg-gray-100 text-gray-800",
                        };
                        const statusTexts = {
                          active: "Фаол",
                          inactive: "Фаол эмас",
                          maintenance: "Техник хизмат",
                          broken: "Ишламайди",
                        };

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => openVideoModal(camera)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {camera.brand || ""} {camera.model}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {camera.ip_address}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    statusColors[camera.status] ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {statusTexts[camera.status] || camera.status}
                                </span>
                                {camera.has_ptz && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    PTZ
                                  </span>
                                )}
                                <Camera className="w-5 h-5 text-cyan-600" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                          Бу лойиҳа учун камералар мавжуд эмас
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={currentImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        camera={currentCamera}
      />
    </>
  );
}
