import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import VideoModal from "./components/VideoModal";
import { CameraType } from "../Factory/types/factory";
import { API_URL_UPLOAD } from "../../config/const";

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
                <div key={factoryIndex} className="mb-6">
                  <h3 className="text-sm font-semibold text-primary mb-2 px-1">{factory.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {factory.cameras.map((camera) => (
                      <div
                        key={camera.id}
                        className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
                        onClick={() => setupCameraModal(camera)}
                      >
                        {/* Preview image */}
                        <div className="relative w-full aspect-video bg-gray-800 overflow-hidden">
                          <img
                            src={camera.screenshot_url ? `${API_URL_UPLOAD}/mnt/tmkupload/${camera.screenshot_url}` : `${API_URL_UPLOAD}/mnt/tmkupload/camera-screenshots/camera_${camera.id}.jpg`}
                            alt={camera.model}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                          {/* Fallback icon */}
                          <div className="absolute inset-0 items-center justify-center bg-gray-700 text-gray-400 hidden">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                            </svg>
                          </div>
                          {/* Play overlay on hover */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {/* Status badge */}
                          <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadgeClass(camera.status)}`}>
                            {getStatusText(camera.status)}
                          </span>
                          {/* PTZ badge */}
                          {camera.has_ptz && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500 text-white">
                              PTZ
                            </span>
                          )}
                        </div>
                        {/* Camera info */}
                        <div className="px-2 py-1.5">
                          <p className="text-xs font-medium text-gray-800 truncate">{camera.model}</p>
                        </div>
                      </div>
                    ))}
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
