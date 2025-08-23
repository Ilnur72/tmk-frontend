import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CameraType, PTZCommand } from "../types/factory";
import PTZControls from "../camera/PTZControls";
import axios from "axios";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: CameraType | null;
}

export default function VideoModal({
  isOpen,
  onClose,
  camera,
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsLoading(true);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const sendPTZCommand = async (command: PTZCommand) => {
    try {
      const response = await axios.post("/cameras/ptz-control", command, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.data;
    } catch (error) {
      console.error("PTZ command error:", error);
    }
  };

  if (!isOpen || !camera) return null;

  const streamUrl =
    camera.stream_link || "https://tmk.bgs.uz/camera/cameratmk2.php";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
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
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white flex-shrink-0">
            <h3 className="text-lg font-medium">
              {camera.brand} {camera.model} - Камера кўриниши
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            {/* Video Area */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[400px] relative">
              <iframe
                src={streamUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
              />
            </div>

            {/* PTZ Control Panel */}
            {camera.has_ptz && (
              <div className="lg:w-80 bg-gray-100 border-t lg:border-t-0 lg:border-l flex-shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none">
                <div className="p-2 md:p-4">
                  <PTZControls camera={camera} onSendCommand={sendPTZCommand} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
