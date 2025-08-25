import { useState } from "react";
import { CameraType, PTZCommand } from "../types/factory";


interface PTZControlsProps {
  camera: CameraType;
  onSendCommand: (command: PTZCommand) => void;
}

export default function PTZControls({
  camera,
  onSendCommand,
}: PTZControlsProps) {
  const [activeControl, setActiveControl] = useState<string | null>(null);

  const sendPTZCommand = (command: string, pan: number, tilt: number) => {
    let xmlData: string;
    if (command === "control") {
      xmlData = `<?xml version="1.0" encoding="UTF-8"?><PTZData><pan>${pan}</pan><tilt>${tilt}</tilt></PTZData>`;
    } else {
      xmlData = `<?xml version="1.0" encoding="UTF-8"?><PTZData><zoom>${pan}</zoom></PTZData>`;
    }

    const ptzCommand: PTZCommand = {
      cameraId: camera.id,
      zoom: command,
      xml: xmlData,
      ip: camera.ip_address,
    };

    onSendCommand(ptzCommand);
  };

  const handleControlStart = (direction: string, pan: number, tilt: number) => {
    setActiveControl(direction);
    sendPTZCommand("control", pan, tilt);
  };

  const handleControlStop = () => {
    setActiveControl(null);
    sendPTZCommand("control", 0, 0);
  };

  const handleZoomStart = (direction: "in" | "out") => {
    setActiveControl(direction);
    sendPTZCommand("zoom", direction === "in" ? 60 : -60, 0);
  };

  const handleZoomStop = () => {
    setActiveControl(null);
    sendPTZCommand("zoom", 0, 0);
  };

  // PTZ direction control handlers
  const handlePTZMouseDown = (direction: any) => {
    const directionMap = {
      factoryUpLeft: { pan: -60, tilt: 60 },
      factoryUp: { pan: 0, tilt: 60 },
      factoryUpRight: { pan: 60, tilt: 60 },
      factoryLeft: { pan: -60, tilt: 0 },
      factoryRight: { pan: 60, tilt: 0 },
      factoryDownLeft: { pan: -60, tilt: -60 },
      factoryDown: { pan: 0, tilt: -60 },
      factoryDownRight: { pan: 60, tilt: -60 },
    };
    type Direction = keyof typeof directionMap;
    const dir = direction as Direction;

    const coords = directionMap[dir];
    if (coords) {
      handleControlStart(direction, coords.pan, coords.tilt);
    }
  };

  const handlePTZMouseUp = () => {
    handleControlStop();
  };

  const handleZoomMouseDown = (direction: string) => {
    if (direction === "factoryZoomIn") {
      handleZoomStart("in");
    } else if (direction === "factoryZoomOut") {
      handleZoomStart("out");
    }
  };

  const handleZoomMouseUp = () => {
    handleZoomStop();
  };

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {/* PTZ Controls */}
      <div className="flex justify-center items-center">
        <div className="bg-white p-2 md:p-4 rounded-lg shadow-lg w-full max-w-sm md:max-w-none">
          <h4 className="text-sm md:text-lg font-semibold  text-gray-800 text-center">
            Камера бошқариш
          </h4>
          <div className="flex flex-col items-center">
            <div
              data-v-29fcc1ea=""
              className="ptz-root theme-white mx-auto transform scale-90 md:scale-100"
            >
              <div data-v-29fcc1ea="" className="ptz-content position-relative">
                <div data-v-29fcc1ea="" className="ptz-panel mx-auto">
                  <div
                    data-v-29fcc1ea=""
                    className="ptz-panel-content position-relative mx-auto"
                  >
                    <div
                      data-v-29fcc1ea=""
                      id="factoryUpLeft"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="Chapga yuqoriga"
                        className={`ptz-icon-ptz-left-up position-absolute ${
                          activeControl === "factoryUpLeft" ? "active" : ""
                        }`}
                        onMouseDown={() => handlePTZMouseDown("factoryUpLeft")}
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryUpLeft");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryUp"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="Yuqoriga"
                        className={`ptz-icon-ptz-up position-absolute ${
                          activeControl === "factoryUp" ? "active" : ""
                        }`}
                        onMouseDown={() => handlePTZMouseDown("factoryUp")}
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryUp");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryUpRight"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="O'ngga yuqoriga"
                        className={`ptz-icon-ptz-right-up position-absolute ${
                          activeControl === "factoryUpRight" ? "active" : ""
                        }`}
                        onMouseDown={() => handlePTZMouseDown("factoryUpRight")}
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryUpRight");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryLeft"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="Chapga"
                        className={`ptz-icon-ptz-left position-absolute ${
                          activeControl === "factoryLeft" ? "active" : ""
                        }`}
                        onMouseDown={() => handlePTZMouseDown("factoryLeft")}
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryLeft");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryRight"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="O'ngga"
                        className={`ptz-icon-ptz-right position-absolute ${
                          activeControl === "factoryRight" ? "active" : ""
                        }`}
                        onMouseDown={() => handlePTZMouseDown("factoryRight")}
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryRight");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryDownLeft"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="Chapga pastga"
                        className={`ptz-icon-ptz-left-down position-absolute ${
                          activeControl === "factoryDownLeft" ? "active" : ""
                        }`}
                        onMouseDown={() =>
                          handlePTZMouseDown("factoryDownLeft")
                        }
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryDownLeft");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryDown"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="Pastga"
                        className={`ptz-icon-ptz-down position-absolute ${
                          activeControl === "factoryDown" ? "active" : ""
                        }`}
                        onMouseDown={() => handlePTZMouseDown("factoryDown")}
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryDown");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                    <div
                      data-v-29fcc1ea=""
                      id="factoryDownRight"
                      className="cursor-pointer touch-manipulation"
                    >
                      <i
                        data-v-29fcc1ea=""
                        title="O'ngga pastga"
                        className={`ptz-icon-ptz-right-down position-absolute ${
                          activeControl === "factoryDownRight" ? "active" : ""
                        }`}
                        onMouseDown={() =>
                          handlePTZMouseDown("factoryDownRight")
                        }
                        onMouseUp={handlePTZMouseUp}
                        onMouseLeave={handlePTZMouseUp}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          handlePTZMouseDown("factoryDownRight");
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handlePTZMouseUp();
                        }}
                      ></i>
                    </div>
                  </div>
                </div>
                <div data-v-29fcc1ea="" className="ptz-other mx-auto">
                  <div data-v-29fcc1ea="" className="ptz-wrap mx-auto">
                    <i
                      id="factoryZoomOut"
                      data-v-29fcc1ea=""
                      title="Kichraytirish -"
                      className={`ptz-wrap-left ic-ptz_focal_length_shrink position-relative cursor-pointer touch-manipulation ${
                        activeControl === "out" ? "active" : ""
                      }`}
                      onMouseDown={() => handleZoomMouseDown("factoryZoomOut")}
                      onMouseUp={handleZoomMouseUp}
                      onMouseLeave={handleZoomMouseUp}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleZoomMouseDown("factoryZoomOut");
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleZoomMouseUp();
                      }}
                    ></i>
                    <div data-v-29fcc1ea="" className="ptz-line"></div>
                    <i
                      id="factoryZoomIn"
                      data-v-29fcc1ea=""
                      title="Kattalashtirish +"
                      className={`ptz-wrap-right ic-ptz_focal_length_amplify position-relative cursor-pointer touch-manipulation ${
                        activeControl === "in" ? "active" : ""
                      }`}
                      onMouseDown={() => handleZoomMouseDown("factoryZoomIn")}
                      onMouseUp={handleZoomMouseUp}
                      onMouseLeave={handleZoomMouseUp}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleZoomMouseDown("factoryZoomIn");
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleZoomMouseUp();
                      }}
                    ></i>
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
                {camera.ip_address}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Модел:</span>
              <span className="text-gray-900">
                {camera.brand} {camera.model}
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
  );
}
