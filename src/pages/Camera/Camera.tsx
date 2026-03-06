import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import VideoModal from "../Factory/modal/VideoModal";
import { CameraType } from "../Factory/types/factory";
import { API_URL, API_URL_UPLOAD } from "../../config/const";

interface Factory {
  id: number;
  name: string;
  cameras: CameraType[];
}

const App: React.FC = () => {
  const { t } = useTranslation();
  const [factories, setFactories] = useState<Factory[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<CameraType | null>(null);

  useEffect(() => {
    const loadDataAsync = async () => {
      const response = await axios.get("/cameras");
      setFactories(response.data.factories);
    };
    loadDataAsync();
  }, []);

  const setupCameraModal = (camera: CameraType) => {
    setCurrentCamera(camera);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentCamera(null);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("camera.status_active");
      case "inactive":
        return t("camera.status_inactive");
      case "maintenance":
        return t("camera.status_maintenance");
      case "broken":
        return t("camera.status_broken");
      default:
        return t("camera.status_unknown");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "inactive":
        return "bg-red-500 text-white";
      case "maintenance":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modalOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  return (
    <>
      <div className="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-2 md:px-4 pb-6 max-sm:pt-5 max-md:pt-[50px]">
        <div className="mt-3 md:mt-6">
          <h2 className="text-base md:text-lg font-medium text-primary mb-3">
            {t("camera.cameras_list")}
          </h2>

          {factories.map(
            (factory, factoryIndex) =>
              factory.cameras.length > 0 && (
                <div key={factoryIndex} className="mb-4 bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-3 py-2 border-b bg-gray-50">
                    <h3 className="text-sm font-semibold text-primary">{factory.name}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead>
                        <tr className="border-b text-gray-500">
                          <th className="py-1.5 px-2 text-left font-medium w-16">{t("camera.preview")}</th>
                          <th className="py-1.5 px-2 text-left font-medium">{t("camera.model") || "Model"}</th>
                          <th className="py-1.5 px-2 text-left font-medium">{t("camera.status") || "Holat"}</th>
                          <th className="py-1.5 px-2 text-center font-medium w-16">{t("camera.action") || "Video"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factory.cameras.map((camera) => (
                          <tr key={camera.id} className="border-b hover:bg-slate-50">
                            {/* Thumbnail */}
                            <td className="py-1.5 px-2">
                              <div
                                className="relative w-14 h-9 rounded overflow-hidden bg-gray-800 cursor-pointer flex-shrink-0"
                                onClick={() => setupCameraModal(camera)}
                              >
                                <img
                                  src={`${API_URL_UPLOAD}/mnt/tmkupload/camera-screenshots/camera_${camera.id}.jpg`}
                                  alt={camera.model}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = "flex";
                                  }}
                                />
                                <div className="absolute inset-0 items-center justify-center bg-gray-700 text-white hidden">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </div>
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                  <svg className="w-5 h-5 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </td>
                            {/* Model */}
                            <td className="py-1.5 px-2 font-medium text-gray-800">{camera.model}</td>
                            {/* Status */}
                            <td className="py-1.5 px-2">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeClass(camera.status)}`}>
                                {getStatusText(camera.status)}
                              </span>
                            </td>
                            {/* Action */}
                            <td className="py-1.5 px-2 text-center">
                              <button
                                onClick={() => setupCameraModal(camera)}
                                className="text-primary hover:opacity-70 transition-opacity"
                                title="Video ko'rish"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {modalOpen && currentCamera && (
        <VideoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          camera={currentCamera}
        />
      )}
    </>
  );
};

export default App;
