import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CameraType, PTZCommand } from "../../Factory/types/factory";
import PTZControls from "../../Factory/components/PTZControls";
import axios from "axios";
import { API_URL_UPLOAD } from "../../../config/const";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: CameraType | null;
}

interface DragState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function toPTZ(relX: number, relY: number) {
  return {
    x: Math.min(255, Math.max(0, Math.round(relX * 255))),
    y: Math.min(255, Math.max(0, Math.round((1 - relY) * 255))),
  };
}

function calcZoom(relY: number): number {
  if (relY < 0.2) return -0.7;
  if (relY < 0.25) return -1.5;
  if (relY < 0.3) return -2;
  if (relY < 0.35) return -2.5;
  if (relY < 0.4) return -3;
  if (relY < 0.45) return -3.5;
  if (relY < 0.5) return -4;
  if (relY < 0.6) return -5;
  if (relY < 0.85) return -6;
  return 1;
}

export default function VideoModal({ isOpen, onClose, camera }: VideoModalProps) {
  const { t } = useTranslation();
  const [streamError, setStreamError] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [ptz3dLoading, setPtz3dLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const ptzAbortRef = useRef<AbortController | null>(null);
  const miniRef = useRef<HTMLDivElement>(null);
  const clickStartTimeRef = useRef(0);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStreamError(null);
      setDrag(null);
      pcRef.current?.close();
      pcRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [isOpen]);

  // WebRTC stream
  useEffect(() => {
    if (!isOpen || !camera?.stream_uuid || !camera?.webrtc_server) return;

    const { stream_uuid, webrtc_server, channel } = camera;

    const start = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });

        pc.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const formData = new FormData();
        formData.append("data", btoa(offer.sdp!));

        const url = `${webrtc_server}/stream/${stream_uuid}/channel/${channel ?? 0}/webrtc`;
        const res = await fetch(url, { method: "POST", body: formData });

        if (!res.ok) throw new Error(`Server xatosi: ${res.status}`);

        const answerSdp = atob(await res.text());
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
        setStreamError(null);
      } catch (err: any) {
        setStreamError(err.message || "Stream yuklanmadi");
        console.error("WebRTC xatolik:", err);
      }
    };

    start();

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [isOpen, camera]);

  // PTZ yo'nalish tugmalari
  const sendPTZCommand = async (command: PTZCommand) => {
    ptzAbortRef.current?.abort();
    ptzAbortRef.current = new AbortController();
    try {
      await axios.post("/cameras/ptz-control", command, {
        headers: { "Content-Type": "application/json" },
        signal: ptzAbortRef.current.signal,
      });
    } catch (error: any) {
      if (error.name !== "CanceledError") {
        console.error("PTZ error:", error.response?.data || error.message);
      }
    }
  };

  // PTZ 3D: mini preview da click yoki drag
  const getRelPos = (e: React.MouseEvent) => {
    const rect = miniRef.current!.getBoundingClientRect();
    return {
      relX: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      relY: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
  };

  const handleMiniMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const { relX, relY } = getRelPos(e);
    clickStartTimeRef.current = Date.now();
    startPosRef.current = { x: relX, y: relY };
    setDrag({ startX: relX, startY: relY, endX: relX, endY: relY });
  };

  const handleMiniMouseMove = (e: React.MouseEvent) => {
    if (!drag) return;
    const { relX, relY } = getRelPos(e);
    setDrag((prev) => prev ? { ...prev, endX: relX, endY: relY } : prev);
  };

  const handleMiniMouseUp = async (e: React.MouseEvent) => {
    if (!drag || !startPosRef.current || !camera) return;

    const { relX: endX, relY: endY } = getRelPos(e);
    const duration = Date.now() - clickStartTimeRef.current;
    const distance = Math.sqrt(
      Math.pow(endX - startPosRef.current.x, 2) +
      Math.pow(endY - startPosRef.current.y, 2)
    );

    setDrag(null);
    startPosRef.current = null;

    let startXPTZ: number, startYPTZ: number, endXPTZ: number, endYPTZ: number;

    if (duration < 200 && distance < 0.02) {
      // CLICK — zoomLevel asosida nuqtaga yo'naltir
      const { x, y } = toPTZ(endX, endY);
      const zoomLevel = calcZoom(endY);
      const offset = Math.round(Math.abs(zoomLevel) * 6);
      if (zoomLevel > 0) {
        startXPTZ = Math.min(255, x + offset);
        startYPTZ = Math.max(0, y - offset);
        endXPTZ = Math.max(0, x - offset);
        endYPTZ = Math.min(255, y + offset);
      } else {
        startXPTZ = Math.max(0, x - offset);
        startYPTZ = Math.min(255, y + offset);
        endXPTZ = Math.min(255, x + offset);
        endYPTZ = Math.max(0, y - offset);
      }
    } else {
      // DRAG — tanlangan to'rtburchakka zoom
      const p1 = toPTZ(drag.startX, drag.startY);
      const p2 = toPTZ(endX, endY);
      startXPTZ = Math.min(p1.x, p2.x);
      startYPTZ = Math.min(p1.y, p2.y);
      endXPTZ = Math.max(p1.x, p2.x);
      endYPTZ = Math.max(p1.y, p2.y);
    }

    setPtz3dLoading(true);
    try {
      await axios.post("/cameras/ptz-3d-position", {
        cameraId: camera.id,
        startX: startXPTZ,
        startY: startYPTZ,
        endX: endXPTZ,
        endY: endYPTZ,
      });
    } catch (err) {
      console.error("PTZ 3D xatolik:", err);
    } finally {
      setPtz3dLoading(false);
    }
  };

  if (!isOpen || !camera) return null;

  const screenshotUrl = camera.screenshot_url
    ? `${API_URL_UPLOAD}/mnt/tmkupload/${camera.screenshot_url}`
    : `${API_URL_UPLOAD}/mnt/tmkupload/camera-screenshots/camera_${camera.id}.jpg`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col" style={{ height: "95vh", maxWidth: "98vw" }}>

          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white flex-shrink-0">
            <h3 className="text-lg font-medium">
              {camera.brand} {camera.model} - {t("camera.camera_view")}
            </h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
              <X className="w-6 h-6" />
              <span className="sr-only">{t("ui.close", { defaultValue: t("modal.close") })}</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

            {/* Video */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[400px] relative">
              {camera.stream_uuid && camera.webrtc_server ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {streamError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2">
                      <span className="text-4xl">📷</span>
                      <p className="text-sm text-gray-300">{streamError}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-white gap-2 w-full h-full">
                  <span className="text-4xl">📷</span>
                  <p className="text-sm text-gray-400">stream_uuid yoki webrtc_server kiritilmagan</p>
                </div>
              )}

              {/* Mini preview — PTZ kameralar uchun */}
              {camera.has_ptz && (
                <div
                  ref={miniRef}
                  className="absolute bottom-3 right-3 select-none overflow-hidden rounded shadow-lg"
                  style={{ width: 200, height: 125, cursor: ptz3dLoading ? "wait" : "crosshair" }}
                  onMouseDown={handleMiniMouseDown}
                  onMouseMove={handleMiniMouseMove}
                  onMouseUp={handleMiniMouseUp}
                  onMouseLeave={(e) => { if (drag) handleMiniMouseUp(e); }}
                >
                  <img
                    src={screenshotUrl}
                    alt="preview"
                    className="w-full h-full pointer-events-none"
                    style={{ objectFit: "fill" }}
                    draggable={false}
                  />

                  {/* Drag to'rtburchagi */}
                  {drag && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${Math.min(drag.startX, drag.endX) * 100}%`,
                        top: `${Math.min(drag.startY, drag.endY) * 100}%`,
                        width: `${Math.abs(drag.endX - drag.startX) * 100}%`,
                        height: `${Math.abs(drag.endY - drag.startY) * 100}%`,
                        border: "2px solid rgba(231,62,62,0.95)",
                        zIndex: 5,
                      }}
                    >
                      {[["0%","0%"],["50%","0%"],["100%","0%"],["100%","50%"],
                        ["100%","100%"],["50%","100%"],["0%","100%"],["0%","50%"]
                      ].map(([left, top], i) => (
                        <div key={i} style={{
                          position: "absolute", left, top,
                          transform: "translate(-50%,-50%)",
                          width: 6, height: 6,
                          background: "rgba(231,62,62,0.95)",
                          borderRadius: "50%",
                        }} />
                      ))}
                    </div>
                  )}

                  {/* Loading spinner */}
                  {ptz3dLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 pointer-events-none">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Yordam matni */}
                  {!ptz3dLoading && !drag && (
                    <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none">
                      <span className="text-white text-[9px] bg-black bg-opacity-50 px-1.5 py-0.5 rounded">
                        Zoom uchun tanlang
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PTZ Controls */}
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
