import React from "react";
import {
  X,
  MapPin,
  Gauge,
  Signal,
  Battery,
  Fuel,
  Thermometer,
} from "lucide-react";

interface VehicleDetails {
  id: number;
  name: string;
  className: string;
  position: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    altitude: number;
    satellites: number;
    time: number;
    lastUpdate: string | null;
  };
  status: {
    isOnline: boolean;
    connectionTime: number;
    lastMessage: number;
  };
  sensors: {
    ignition?: boolean;
    voltage?: number;
    fuel?: number;
    temperature?: number;
    gsmSignal?: number;
    gpsAccuracy?: number;
    externalPower?: number;
    internalPower?: number;
    satellites?: number;
  };
  parameters: any;
  additional: {
    muteMode: number;
    accessLevel: number;
    lastMessageId: number;
  };
}

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleDetails | null;
}

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  if (!isOpen || !vehicle) return null;

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "text-green-600" : "text-red-600";
  };

  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        vehicle.status.isOnline
                      )}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-1 ${
                          vehicle.status.isOnline
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      ></span>
                      {vehicle.status.isOnline ? "Онлайн" : "Офлайн"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Joylashuv ma'lumotlari */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  Joylashuv
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kenglik:</span>
                    <span className="font-medium">
                      {vehicle.position.latitude.toFixed(6)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uzunlik:</span>
                    <span className="font-medium">
                      {vehicle.position.longitude.toFixed(6)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balandlik:</span>
                    <span className="font-medium">
                      {vehicle.position.altitude} m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yo'nalish:</span>
                    <span className="font-medium">
                      {vehicle.position.course}°
                    </span>
                  </div>
                </div>
              </div>

              {/* Harakat ma'lumotlari */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Gauge className="h-4 w-4 mr-2 text-green-600" />
                  Harakat
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tezlik:</span>
                    <span className="font-medium text-lg text-green-600">
                      {vehicle.position.speed} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dvigatel:</span>
                    <span
                      className={`font-medium ${
                        vehicle.sensors.ignition
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {vehicle.sensors.ignition ? "Yoqilgan" : "O'chirilgan"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oxirgi yangilanish:</span>
                    <span className="font-medium text-xs">
                      {vehicle.position.lastUpdate
                        ? new Date(vehicle.position.lastUpdate).toLocaleString()
                        : "Noma'lum"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sensorlar */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Signal className="h-4 w-4 mr-2 text-purple-600" />
                  Sensorlar
                </h4>
                <div className="space-y-2 text-sm">
                  {vehicle.sensors.fuel && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Fuel className="h-3 w-3 mr-1" />
                        Yoqilg'i:
                      </span>
                      <span className="font-medium">
                        {vehicle.sensors.fuel}%
                      </span>
                    </div>
                  )}
                  {vehicle.sensors.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Thermometer className="h-3 w-3 mr-1" />
                        Harorat:
                      </span>
                      <span className="font-medium">
                        {vehicle.sensors.temperature}°C
                      </span>
                    </div>
                  )}
                  {vehicle.sensors.gsmSignal && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GSM signal:</span>
                      <span className="font-medium">
                        {vehicle.sensors.gsmSignal}/5
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">GPS sputniklar:</span>
                    <span className="font-medium">
                      {vehicle.position.satellites}
                    </span>
                  </div>
                  {vehicle.sensors.gpsAccuracy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GPS aniqlik:</span>
                      <span className="font-medium">
                        {vehicle.sensors.gpsAccuracy}m
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Elektr ta'minoti */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Battery className="h-4 w-4 mr-2 text-yellow-600" />
                  Elektr ta'minoti
                </h4>
                <div className="space-y-2 text-sm">
                  {vehicle.sensors.externalPower && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tashqi quvvat:</span>
                      <span className="font-medium">
                        {vehicle.sensors.externalPower}V
                      </span>
                    </div>
                  )}
                  {vehicle.sensors.internalPower && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ichki quvvat:</span>
                      <span className="font-medium">
                        {vehicle.sensors.internalPower}V
                      </span>
                    </div>
                  )}
                  {vehicle.sensors.voltage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kuchlanish:</span>
                      <span className="font-medium">
                        {vehicle.sensors.voltage}V
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Aloqa ma'lumotlari */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Aloqa ma'lumotlari
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Holat:</span>
                    <span
                      className={`font-medium ${getStatusColor(
                        vehicle.status.isOnline
                      )}`}
                    >
                      {vehicle.status.isOnline ? "Онлайн" : "Офлайн"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oxirgi aloqa:</span>
                    <span className="font-medium text-xs">
                      {new Date(
                        vehicle.status.lastMessage * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ulanish vaqti:</span>
                    <span className="font-medium text-xs">
                      {new Date(
                        vehicle.status.connectionTime * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Qo'shimcha ma'lumotlar */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Qo'shimcha ma'lumotlar
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">{vehicle.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sinf:</span>
                    <span className="font-medium">{vehicle.className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oxirgi xabar ID:</span>
                    <span className="font-medium text-xs">
                      {vehicle.additional.lastMessageId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;
