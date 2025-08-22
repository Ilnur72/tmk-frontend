import React, { useState, useEffect, useRef } from "react";

interface FactoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  factory: any;
}

interface CameraType {
  id: number;
  model: string;
  ipAddress: string;
  stream_link?: string;
  has_ptz?: boolean;
  brand?: string;
  status?: string;
}

interface ParameterType {
  param?: { name?: string };
  latestLog?: { value?: string; date_update?: string };
  status?: number;
}

const FactoryDetailsModal: React.FC<FactoryDetailsModalProps> = ({
  isOpen,
  onClose,
  factory,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [currentCamera, setCurrentCamera] = useState<CameraType | null>(null);
  const videoFrameRef = useRef<HTMLIFrameElement>(null);

  // Close modal on Escape key
  const navigateImage = React.useCallback(
    (direction: number) => {
      let newIndex = currentImageIndex + direction;
      if (newIndex < 0) {
        newIndex = currentImages.length - 1;
      } else if (newIndex >= currentImages.length) {
        newIndex = 0;
      }
      setCurrentImageIndex(newIndex);
    },
    [currentImageIndex, currentImages.length]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isVideoModalOpen) {
          closeVideoModal();
        } else if (isImageModalOpen) {
          closeImageModal();
        } else if (isOpen) {
          onClose();
        }
      }

      // Image navigation with arrow keys
      if (isImageModalOpen) {
        if (event.key === "ArrowLeft") {
          navigateImage(-1);
        } else if (event.key === "ArrowRight") {
          navigateImage(1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isImageModalOpen, isVideoModalOpen, onClose, navigateImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen || isImageModalOpen || isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isImageModalOpen, isVideoModalOpen]);

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

  const getStatusBadgeClass = (status: string) => {
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

  const getImportanceBadgeClass = (importance: string) => {
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

  const openImageModal = (
    imageName: string,
    index: number,
    images: string[] | string
  ) => {
    setCurrentImageIndex(index);
    setCurrentImages(typeof images === "string" ? JSON.parse(images) : images);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // navigateImage теперь useCallback выше

  const openVideoModal = (
    cameraId: number,
    model: string,
    ipAddress: string,
    stream_link: string,
    has_ptz: boolean
  ) => {
    setCurrentCamera({
      id: cameraId,
      model,
      ipAddress,
      stream_link,
      has_ptz,
    });
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setCurrentCamera(null);
    if (videoFrameRef.current) {
      videoFrameRef.current.src = "";
    }
  };

  const sendPTZCommand = (command: string, pan: number, tilt: number) => {
    if (!currentCamera) return;

    let xmlData;
    if (command === "control") {
      xmlData = `<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>${pan}</pan><tilt>${tilt}</tilt></PTZData>`;
    } else {
      xmlData = `<?xml version="1.0" encoding="UTF-8"?><PTZData><zoom>${pan}</zoom></PTZData>`;
    }

    const data = {
      cameraId: currentCamera.id,
      zoom: command,
      xml: xmlData,
      ip: currentCamera.ipAddress,
    };

    fetch("/cameras/ptz-control", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("PTZ command success:", data);
      })
      .catch((error) => {
        console.error("PTZ command error:", error);
      });
  };

  interface PTZButtonProps {
    direction: string;
    pan: number;
    tilt: number;
    children?: React.ReactNode;
    title?: string;
  }
  const PTZButton: React.FC<PTZButtonProps> = ({
    direction,
    pan,
    tilt,
    children,
    title,
  }) => {
    const [isActive, setIsActive] = useState(false);

    const handleMouseDown = () => {
      setIsActive(true);
      sendPTZCommand("control", pan, tilt);
    };

    const handleMouseUp = () => {
      setIsActive(false);
      sendPTZCommand("control", 0, 0);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      setIsActive(true);
      sendPTZCommand("control", pan, tilt);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      e.preventDefault();
      setIsActive(false);
      sendPTZCommand("control", 0, 0);
    };

    return (
      <div
        className="cursor-pointer touch-manipulation"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <i
          title={title}
          className={`${direction} position-absolute ${
            isActive ? "active" : ""
          }`}
        >
          {children}
        </i>
      </div>
    );
  };

  interface ZoomButtonProps {
    isZoomIn: boolean;
    children?: React.ReactNode;
    title?: string;
  }
  const ZoomButton: React.FC<ZoomButtonProps> = ({
    isZoomIn,
    children,
    title,
  }) => {
    const [isActive, setIsActive] = useState(false);

    const handleMouseDown = () => {
      setIsActive(true);
      sendPTZCommand("zoom", isZoomIn ? 60 : -60, 0);
    };

    const handleMouseUp = () => {
      setIsActive(false);
      sendPTZCommand("zoom", 0, 0);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      setIsActive(true);
      sendPTZCommand("zoom", isZoomIn ? 60 : -60, 0);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      e.preventDefault();
      setIsActive(false);
      sendPTZCommand("zoom", 0, 0);
    };

    return (
      <i
        title={title}
        className={`$${
          isZoomIn
            ? "ptz-wrap-right ic-ptz_focal_length_amplify"
            : "ptz-wrap-left ic-ptz_focal_length_shrink"
        } position-relative cursor-pointer touch-manipulation ${
          isActive ? "active" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </i>
    );
  };

  const renderImages = () => {
    if (!factory) return null;

    if (factory.images && factory.images !== "[]") {
      try {
        const images =
          typeof factory.images === "string"
            ? JSON.parse(factory.images)
            : factory.images;
        if (images && images.length > 0) {
          return (images as string[]).map((img: string, index: number) => (
            <div
              key={index}
              className="relative cursor-pointer flex-shrink-0 image-hover-container"
              onClick={() => openImageModal(img, index, images)}
            >
              <img
                src={`/mnt/tmkupload/factory-images/${img}`}
                alt={
                  factory.name
                    ? `${factory.name} ${index + 1}`
                    : `Factory ${index + 1}`
                }
                className="w-64 h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded pointer-events-none">
                {index + 1}/{images.length}
              </div>
            </div>
          ));
        }
      } catch (e) {
        console.error("Error parsing images:", e);
      }
    }

    return (
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-gray-500 text-sm">Расм мавжуд эмас</p>
          </div>
        </div>
      </div>
    );
  };

  const renderParameters = () => {
    if (
      !factory ||
      !factory.factoryParams ||
      factory.factoryParams.length === 0
    ) {
      return (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-500">
            Бу лойиҳа учун параметрлар мавжуд эмас
          </p>
        </div>
      );
    }

    return (factory.factoryParams as ParameterType[]).map((param, index) => {
      const latestLog = param.latestLog;
      const status = param.status || 0;
      const statusClass =
        status === 1
          ? "bg-green-100 text-green-800"
          : status === 2
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800";
      const statusText =
        status === 1 ? "Яхши" : status === 2 ? "Ёмон" : "Нормал";
      const statusIcon = status === 1 ? "✓" : status === 2 ? "✗" : "○";

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
            {latestLog && (
              <div className="text-sm text-gray-500 mt-1">
                Қиймат:{" "}
                <span className="font-medium">{latestLog.value || "-"}</span>
              </div>
            )}
            {latestLog && latestLog.date_update && (
              <div className="text-xs text-gray-400 mt-1">
                Янгиланган:{" "}
                {new Date(latestLog.date_update).toLocaleDateString("uz-UZ")}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const renderCameras = () => {
    if (!factory || !factory.cameras || factory.cameras.length === 0) {
      return (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <p className="text-gray-500">Бу лойиҳа учун камералар мавжуд эмас</p>
        </div>
      );
    }

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

    return (factory.cameras as CameraType[]).map((camera, index) => (
      <div
        key={index}
        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() =>
          openVideoModal(
            camera.id,
            `${camera.brand || ""} ${camera.model}`,
            camera.ipAddress,
            camera.stream_link || "",
            camera.has_ptz || false
          )
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {camera.brand || ""} {camera.model}
            </div>
            <div className="text-sm text-gray-600 mt-1">{camera.ipAddress}</div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                camera.status &&
                statusColors[camera.status as keyof typeof statusColors]
                  ? statusColors[camera.status as keyof typeof statusColors]
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {camera.status &&
              statusTexts[camera.status as keyof typeof statusTexts]
                ? statusTexts[camera.status as keyof typeof statusTexts]
                : camera.status}
            </span>
            {camera.has_ptz && (
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                PTZ
              </span>
            )}
            <svg
              className="w-5 h-5 text-theme-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        </div>
      </div>
    ));
  };

  const renderCustomFields = () => {
    if (
      !factory ||
      !factory.custom_fields ||
      Object.keys(factory.custom_fields).length === 0
    ) {
      return null;
    }

    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-theme-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
              clipRule="evenodd"
            />
          </svg>
          Қўшимча майдонлар
        </h4>
        <div className="space-y-2">
          {Object.entries(factory.custom_fields).map(([key, value], index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{key}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {String(value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectValues = () => {
    if (
      !factory ||
      !factory.project_values ||
      Object.keys(factory.project_values).length === 0
    ) {
      return null;
    }

    let projectValuesHTML = [];

    // Check if hierarchical format with "child" property
    if (
      factory.project_values.child &&
      typeof factory.project_values.child === "object"
    ) {
      // Display total value first
      if (factory.project_values["Лойиҳанинг қиймати"]) {
        projectValuesHTML.push(
          <div
            key="total"
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Лойиҳанинг қиймати
              </div>
              <div className="text-2xl font-bold text-green-600">
                {factory.project_values["Лойиҳанинг қиймати"]}
              </div>
            </div>
          </div>
        );
      }

      // Display child values
      Object.entries(factory.project_values.child).forEach(
        ([key, value], index) => {
          projectValuesHTML.push(
            <div
              key={`child-${index}`}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {key}
                </div>
                <div className="text-2xl font-bold text-theme-1">
                  {String(value)}
                </div>
              </div>
            </div>
          );
        }
      );
    } else {
      // Flat format (old format support)
      Object.entries(factory.project_values).forEach(([key, value], index) => {
        // Skip child objects in flat display
        if (typeof value === "object") {
          return;
        }
        projectValuesHTML.push(
          <div
            key={`flat-${index}`}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {key}
              </div>
              <div className="text-2xl font-bold text-theme-1">
                {String(value)}
              </div>
            </div>
          </div>
        );
      });
    }

    if (projectValuesHTML.length === 0) return null;

    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-theme-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Лойиҳа қийматлари
        </h4>
        <div className="space-y-2">{projectValuesHTML}</div>
      </div>
    );
  };

  const getCoordinates = () => {
    if (!factory || !factory.coords) return "Координаталар топилмади";

    try {
      let coords;
      if (typeof factory.coords === "string") {
        coords = JSON.parse(factory.coords);
      } else if (Array.isArray(factory.coords)) {
        coords = factory.coords;
      } else {
        coords = [0, 0];
      }
      return `${coords[1] || "0.000000"}, ${coords[0] || "0.000000"}`;
    } catch (e) {
      console.error("Error parsing coordinates:", e);
      return "Координаталар топилмади";
    }
  };

  if (!isOpen || !factory) return null;

  return (
    <>
      {/* Factory Details Modal */}
      <div
        className={`modal group bg-black/60 transition-all duration-300 w-screen h-screen fixed left-0 top-0 z-[9999] flex items-center justify-center ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className={`modal-content bg-white relative flex flex-col rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100 transform transition-all duration-300 ease-out mx-4 ${
            isOpen ? "scale-100" : "scale-95"
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-theme-1 to-theme-2 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 100-4 2 2 0 000 4zm8-2a2 2 0 11-4 0 2 2 0 014 0z"
                    clipRule="evenodd"
                  />
                </svg>
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
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-colors p-2 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="grid grid-cols-1 grid-cols-3 gap-6">
              {/* Left Column - Images and Basic Info */}
              <div className="col-span-1 space-y-4">
                {/* Images Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-theme-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Лойиҳа расмлари
                  </h4>
                  <div
                    className="flex space-x-3 overflow-x-auto pb-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#cbd5e0 #f7fafc",
                    }}
                  >
                    {renderImages()}
                  </div>
                </div>

                {/* Basic Info Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-theme-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                        {factory.work_persent || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Статус:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
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
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceBadgeClass(
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
                        {getCoordinates()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Custom Fields, Project Values and Description */}
              <div className="col-span-1 space-y-4">
                {renderCustomFields()}
                {renderProjectValues()}
              </div>

              {/* Right Column - Parameters and Actions */}
              <div className="col-span-1 space-y-4">
                {/* Parameters Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-theme-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Параметрлар
                  </h4>
                  <div className="space-y-2">{renderParameters()}</div>
                </div>

                {/* Video Surveillance Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-theme-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Видео кузатув
                  </h4>
                  <div className="space-y-3">{renderCameras()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage(-1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => navigateImage(1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image Container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img
                src={
                  currentImages[currentImageIndex]
                    ? `/mnt/tmkupload/factory-images/${currentImages[currentImageIndex]}`
                    : ""
                }
                alt=""
                className="w-full h-[70vh] mx-auto block object-contain"
              />
              <div className="p-4 bg-gray-50">
                <p className="text-center text-gray-600 font-medium">
                  {currentImageIndex + 1} / {currentImages.length}
                </p>
                <p className="text-center text-gray-800 mt-1">
                  Лойиҳа расми {currentImageIndex + 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && currentCamera && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <div
            className="relative max-w-full max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col"
              style={{ height: "95vh", maxWidth: "98vw" }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-1 to-theme-2 text-white flex-shrink-0">
                <h3 className="text-lg font-medium">
                  {currentCamera.model} - Video кўриниши
                </h3>
                <button
                  type="button"
                  onClick={closeVideoModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                  <iframe
                    ref={videoFrameRef}
                    src={
                      currentCamera.stream_link &&
                      currentCamera.stream_link !== "null" &&
                      currentCamera.stream_link !== ""
                        ? currentCamera.stream_link
                        : "https://tmk.bgs.uz/camera/cameratmk2.php"
                    }
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full"
                    title={
                      currentCamera.model
                        ? `${currentCamera.model} видеопоток`
                        : "Камера видеопоток"
                    }
                  />
                </div>

                {/* PTZ Control Panel (only shown if camera has PTZ) */}
                {currentCamera.has_ptz && (
                  <div className="w-full lg:w-80 bg-gray-100 border-t lg:border-t-0 lg:border-l flex-shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none">
                    <div className="p-2 md:p-4">
                      <div className="flex flex-col gap-2 md:gap-4">
                        {/* PTZ Controls */}
                        <div className="flex justify-center items-center">
                          <div className="bg-white p-2 md:p-4 rounded-lg shadow-lg w-full max-w-sm md:max-w-none">
                            <h4 className="text-sm md:text-lg font-semibold md:mb-4 text-gray-800 text-center">
                              Камера бошқариш
                            </h4>
                            <div className="flex flex-col items-center">
                              <div className="ptz-root theme-white mx-auto transform scale-90 md:scale-100">
                                <div className="ptz-content position-relative">
                                  <div className="ptz-panel mx-auto">
                                    <div className="ptz-panel-content position-relative mx-auto">
                                      <PTZButton
                                        direction="ptz-icon-ptz-left-up"
                                        pan={-60}
                                        tilt={60}
                                        title="Chapga yuqoriga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-up"
                                        pan={0}
                                        tilt={60}
                                        title="Yuqoriga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-right-up"
                                        pan={60}
                                        tilt={60}
                                        title="O'ngga yuqoriga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-left"
                                        pan={-60}
                                        tilt={0}
                                        title="Chapga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-right"
                                        pan={60}
                                        tilt={0}
                                        title="O'ngga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-left-down"
                                        pan={-60}
                                        tilt={-60}
                                        title="Chapga pastga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-down"
                                        pan={0}
                                        tilt={-60}
                                        title="Pastga"
                                      />
                                      <PTZButton
                                        direction="ptz-icon-ptz-right-down"
                                        pan={60}
                                        tilt={-60}
                                        title="O'ngga pastga"
                                      />
                                    </div>
                                  </div>
                                  <div className="ptz-other mx-auto">
                                    <div className="ptz-wrap mx-auto">
                                      <ZoomButton
                                        isZoomIn={false}
                                        title="Kichraytirish -"
                                      />
                                      <div className="ptz-line"></div>
                                      <ZoomButton
                                        isZoomIn={true}
                                        title="Kattalashtirish +"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Camera Info */}
                        <div className="w-full">
                          <div className="bg-white rounded-lg p-2 md:p-4 h-full">
                            <h5 className="font-semibold mb-2 md:mb-3 text-gray-800 text-sm md:text-base">
                              Камера маълумотлари
                            </h5>
                            <div className="text-xs md:text-sm space-y-1 md:space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">IP:</span>
                                <span className="font-mono text-gray-900">
                                  {currentCamera.ipAddress}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Модел:</span>
                                <span className="text-gray-900">
                                  {currentCamera.model}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Статус:</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  Фаол
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FactoryDetailsModal;
