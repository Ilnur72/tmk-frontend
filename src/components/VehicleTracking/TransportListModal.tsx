import React, { useState } from "react";
import { X, Edit, Save, User } from "lucide-react";

interface Driver {
  id?: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  phoneNumber: string;
  email?: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  dateOfBirth?: string;
  address?: string;
  passportNumber?: string;
  status: "active" | "inactive" | "suspended";
  notes?: string;
  photoUrl?: string;
  experienceYears: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface VehicleWithDriver {
  id: number;
  name: string;
  status: {
    isOnline: boolean;
  };
  position: {
    speed: number;
  };
  driver?: Driver;
}

interface TransportListModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleWithDriver[];
  onUpdateVehicle?: (vehicleId: number, driverData: Driver) => void;
}

// Test uchun demo driver ma'lumotlari
const addDemoDrivers = (vehicles: VehicleWithDriver[]): VehicleWithDriver[] => {
  if (vehicles.length === 0) return vehicles;

  // Birinchi vechile'ga demo driver qo'shamiz
  const demoDriver: Driver = {
    id: 999,
    firstName: "Демо",
    lastName: "Ҳайдовчи",
    phoneNumber: "+998901234567",
    licenseNumber: "АА1234567",
    licenseCategory: "Б",
    licenseExpiryDate: "2025-12-31",
    status: "active",
    experienceYears: 5,
    email: "demo@example.com",
  };

  return vehicles.map((vehicle, index) => {
    if (index === 0 && !vehicle.driver) {
      console.log("📝 Adding demo driver to first vehicle for testing");
      return { ...vehicle, driver: demoDriver };
    }
    return vehicle;
  });
};

const TransportListModal: React.FC<TransportListModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onUpdateVehicle,
}) => {
  const [editingVehicle, setEditingVehicle] = useState<number | null>(null);
  const [driverData, setDriverData] = useState<Driver>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    licenseNumber: "",
    licenseCategory: "",
    licenseExpiryDate: "",
    status: "active",
    experienceYears: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // Test uchun demo driverlar qo'shamiz
  const vehiclesWithDemo = addDemoDrivers(vehicles);

  const filteredVehicles = vehiclesWithDemo.filter((vehicle) =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (vehicle: VehicleWithDriver) => {
    setEditingVehicle(vehicle.id);
    setDriverData({
      firstName: vehicle.driver?.firstName || "",
      lastName: vehicle.driver?.lastName || "",
      phoneNumber: vehicle.driver?.phoneNumber || "",
      licenseNumber: vehicle.driver?.licenseNumber || "",
      licenseCategory: vehicle.driver?.licenseCategory || "",
      licenseExpiryDate: vehicle.driver?.licenseExpiryDate || "",
      status: vehicle.driver?.status || "active",
      experienceYears: vehicle.driver?.experienceYears || 0,
      email: vehicle.driver?.email || "",
    });
  };

  const handleSave = (vehicleId: number) => {
    console.log("💾 Saving driver data for vehicle:", vehicleId, driverData);
    if (onUpdateVehicle) {
      onUpdateVehicle(vehicleId, driverData);
    }
    setEditingVehicle(null);
    setDriverData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiryDate: "",
      status: "active",
      experienceYears: 0,
    });
  };

  const handleCancel = () => {
    setEditingVehicle(null);
    setDriverData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiryDate: "",
      status: "active",
      experienceYears: 0,
    });
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Транспортлар бошқаруви
                  </h3>
                  <p className="text-sm text-gray-500">
                    Ҳайдовчилар маълумотларини таҳрирлаш
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Транспорт қидириш..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content - Scrollable Table */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Транспорт
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ҳолат
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ҳайдовчи
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Алоқа маълумотлари
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Лицензия
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ҳолат / Тажриба
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Амаллар
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {vehicle.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.status.isOnline
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-1 ${
                              vehicle.status.isOnline
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></span>
                          {vehicle.status.isOnline ? "Online" : "Offline"}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {vehicle.position.speed} km/h
                        </div>
                      </td>

                      {/* Driver Info - Editable */}
                      {editingVehicle === vehicle.id ? (
                        <>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Исм"
                                value={driverData.firstName}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    firstName: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Фамилия"
                                value={driverData.lastName}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    lastName: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Телефон рақам"
                                value={driverData.phoneNumber}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    phoneNumber: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <input
                                type="email"
                                placeholder="Электрон манзил"
                                value={driverData.email || ""}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Лицензия рақам"
                                value={driverData.licenseNumber}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    licenseNumber: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Категория"
                                value={driverData.licenseCategory}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    licenseCategory: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <select
                                value={driverData.status}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    status: e.target.value as
                                      | "active"
                                      | "inactive"
                                      | "suspended",
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="active">Фаол</option>
                                <option value="inactive">Нофаол</option>
                                <option value="suspended">Тўхтатилган</option>
                              </select>
                              <input
                                type="number"
                                placeholder="Тажриба (йил)"
                                value={driverData.experienceYears}
                                onChange={(e) =>
                                  setDriverData({
                                    ...driverData,
                                    experienceYears: Number(e.target.value),
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {vehicle.driver
                                ? `${vehicle.driver.firstName} ${vehicle.driver.lastName}`.trim() ||
                                  "—"
                                : "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div>{vehicle.driver?.phoneNumber || "—"}</div>
                              {vehicle.driver?.email && (
                                <div className="text-xs text-gray-500">
                                  {vehicle.driver.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div>{vehicle.driver?.licenseNumber || "—"}</div>
                              {vehicle.driver?.licenseCategory && (
                                <div className="text-xs text-gray-500">
                                  {vehicle.driver.licenseCategory}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {vehicle.driver?.status && (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    vehicle.driver.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : vehicle.driver.status === "suspended"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {vehicle.driver.status === "active"
                                    ? "Фаол"
                                    : vehicle.driver.status === "suspended"
                                    ? "Тўхтатилган"
                                    : "Нофаол"}
                                </span>
                              )}
                              {vehicle.driver?.experienceYears !==
                                undefined && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {vehicle.driver.experienceYears} йил тажриба
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingVehicle === vehicle.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSave(vehicle.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Сақлаш"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 hover:text-red-900"
                              title="Бекор қилиш"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Таҳрирлаш"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredVehicles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Транспортлар топилмади</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
            <div className="text-sm text-gray-500">
              Жами: {filteredVehicles.length} та транспорт
            </div>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Ёпиш
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportListModal;
