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
      <div className="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-4 pb-10 before:block before:h-px before:w-full before:content-[''] dark:bg-darkmode-700 md:px-[22px] max-sm:pt-5">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 mt-8">
            <div className="intro-y lg:flex items-center justify-between mb-5">
              <h2 className="mr-5 text-lg font-medium text-primary">
                {t("camera.cameras_list")}
              </h2>
            </div>
            {factories.map(
              (factory, factoryIndex) =>
                factory.cameras.length > 0 && (
                  <div key={factoryIndex} className="mb-10">
                    <h3 className="text-xl font-bold mb-4 text-primary">
                      {factory.name}
                    </h3>
                    <div className="grid grid-cols-12 gap-6">
                      {factory.cameras.map((camera) => (
                        <div
                          key={camera.id}
                          className="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
                        >
                          <div className="box bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
                            <div
                              className="relative bg-gray-900 h-48 flex items-center justify-center cursor-pointer"
                              onClick={() => setupCameraModal(camera)}
                            >
                              <img
                                src={`${API_URL_UPLOAD}/mnt/tmkupload/camera-screenshots/camera_${camera.id}.jpg`}
                                alt={`Camera ${camera.model}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const fallback =
                                    target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                              <div
                                className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white"
                                style={{ display: "none" }}
                              >
                                <div className="text-center">
                                  <svg
                                    className="w-12 h-12 mx-auto mb-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                  <p className="text-sm">
                                    {t("camera.screenshot_error")}
                                  </p>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
                                <svg
                                  className="w-16 h-16 text-white opacity-70"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                              <span
                                className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${getStatusBadgeClass(
                                  camera.status
                                )}`}
                              >
                                ●
                              </span>
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                              <div className="mb-2">
                                <h4 className="font-semibold text-lg text-gray-900">
                                  {camera.model}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {getStatusText(camera.status)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
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
