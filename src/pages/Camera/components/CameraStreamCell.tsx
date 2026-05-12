import { useEffect, useRef, useState } from "react";
import { CameraType } from "../../Factory/types/factory";
import { API_URL_UPLOAD } from "../../../config/const";

interface Props {
  camera: CameraType;
  onClick: (camera: CameraType) => void;
}

export default function CameraStreamCell({ camera, onClick }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!camera.stream_uuid || !camera.webrtc_server) {
      setLoading(false);
      setError(true);
      return;
    }

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
            setLoading(false);
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const formData = new FormData();
        formData.append("data", btoa(offer.sdp!));

        const url = `${webrtc_server}/stream/${stream_uuid}/channel/${channel ?? 0}/webrtc`;
        const res = await fetch(url, { method: "POST", body: formData });

        if (!res.ok) throw new Error(`${res.status}`);

        const answerSdp = atob(await res.text());
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      } catch {
        setLoading(false);
        setError(true);
      }
    };

    start();

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [camera]);

  const screenshotUrl = camera.screenshot_url
    ? `${API_URL_UPLOAD}/mnt/tmkupload/${camera.screenshot_url}`
    : `${API_URL_UPLOAD}/mnt/tmkupload/camera-screenshots/camera_${camera.id}.jpg`;

  return (
    <div
      className="relative bg-black overflow-hidden cursor-pointer group aspect-video"
      onClick={() => onClick(camera)}
    >
      {/* Live video */}
      {!error && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}

      {/* Fallback screenshot when error */}
      {error && (
        <img
          src={screenshotUrl}
          alt={camera.model}
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Hover overlay — expand icon */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-800"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </div>
      </div>

      {/* Camera label bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-[10px] font-medium truncate leading-tight">
          {camera.model}
        </p>
      </div>

      {/* PTZ badge */}
      {camera.has_ptz && (
        <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-bold bg-blue-500 text-white leading-none">
          PTZ
        </span>
      )}

      {/* Error indicator */}
      {error && (
        <div
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"
          title="Stream mavjud emas"
        />
      )}
    </div>
  );
}
