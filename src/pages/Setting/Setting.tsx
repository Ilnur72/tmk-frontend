import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, Camera, Settings } from "lucide-react";
import { showToast } from "../../utils/toast";
import axios from "axios";

interface Parameter {
  id: number;
  name: string;
  type: string;
}

interface CameraInterface {
  id: number;
  factory_id?: number;
  model: string;
  stream_link: string;
  ip_address: string;
  login: string;
  password: string;
  has_ptz: boolean;
  status: "active" | "inactive" | "maintenance" | "broken";
}

interface Factory {
  id: number;
  name: string;
}

const Setting: React.FC = () => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [cameras, setCameras] = useState<CameraInterface[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isCreateParamModalOpen, setIsCreateParamModalOpen] = useState(false);
  const [isEditParamModalOpen, setIsEditParamModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isEditCameraModalOpen, setIsEditCameraModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [currentParameter, setCurrentParameter] = useState<Parameter | null>(
    null
  );
  const [currentCamera, setCurrentCamera] = useState<CameraInterface | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"parameter" | "camera">(
    "parameter"
  );

  // Form data states
  const [parameterForm, setParameterForm] = useState({
    name: "",
    type: "select",
  });

  const [cameraForm, setCameraForm] = useState({
    factory_id: "",
    model: "",
    stream_link: "",
    ip_address: "",
    login: "",
    password: "",
    status: "active" as CameraInterface["status"],
    has_ptz: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paramsResponse, camerasResponse, factoriesResponse] =
        await Promise.all([
          axios.get("/setting/param"),
          axios.get("/cameras/all"),
          axios.get("/factory/all"),
        ]);
      setParameters(paramsResponse.data.parameters || []);
      setCameras(camerasResponse.data.cameras.data || []);
      setFactories(factoriesResponse.data.factories || []);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Маълумотларни юклашда хато!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", parameterForm.name);
      formData.append("type", parameterForm.type);

      const response = await axios.post("/setting/param/", formData);

      setParameters((prev) => [...prev, response.data.data]);
      setParameterForm({ name: "", type: "select" });
      setIsCreateParamModalOpen(false);
      showToast("Параметр муваффақиятли қўшилди!", "success");
    } catch (error) {
      console.error("Error creating parameter:", error);
      showToast("Параметр олдиндан мавжуд", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditParameter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParameter) return;

    setLoading(true);
    try {
      await axios.put(`/setting/param/${currentParameter.id}`, {
        name: parameterForm.name,
        type: parameterForm.type,
      });

      setParameters((prev) =>
        prev.map((param) =>
          param.id === currentParameter.id
            ? { ...param, name: parameterForm.name, type: parameterForm.type }
            : param
        )
      );

      setIsEditParamModalOpen(false);
      setCurrentParameter(null);
      showToast("Параметр муваффақиятли янгиланди!", "success");
    } catch (error) {
      console.error("Error updating parameter:", error);
      showToast("Параметрни янгилашда хато!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(cameraForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await axios.post("/cameras/", formData);

      setCameras((prev) => [...prev, response.data.data]);
      setCameraForm({
        factory_id: "",
        model: "",
        stream_link: "",
        ip_address: "",
        login: "",
        password: "",
        status: "active",
        has_ptz: false,
      });
      setIsCameraModalOpen(false);
      showToast("Камера муваффақиятли қўшилди!", "success");
    } catch (error) {
      console.error("Error creating camera:", error);
      showToast("Камера қўшишда хатолик", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCamera) return;

    setLoading(true);
    try {
      await axios.put(`/cameras/${currentCamera.id}`, cameraForm);

      setCameras((prev:any) =>
        prev.map((camera:any) =>
          camera.id === currentCamera.id ? { ...camera, ...cameraForm } : camera
        )
      );

      setIsEditCameraModalOpen(false);
      setCurrentCamera(null);
      showToast("Камера муваффақиятли янгиланди!", "success");
    } catch (error) {
      console.error("Error updating camera:", error);
      showToast("Камерани янгилашда хато!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const endpoint =
        deleteType === "parameter"
          ? `/setting/param/${deleteId}`
          : `/cameras/${deleteId}`;
      await axios.delete(endpoint);

      if (deleteType === "parameter") {
        setParameters((prev) => prev.filter((param) => param.id !== deleteId));
      } else {
        setCameras((prev) => prev.filter((camera) => camera.id !== deleteId));
      }

      setIsDeleteModalOpen(false);
      setDeleteId(null);
      showToast("Муваффақиятли ўчирилди!", "success");
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("Ўчиришда хато!", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEditParameter = (parameter: Parameter) => {
    setCurrentParameter(parameter);
    setParameterForm({
      name: parameter.name,
      type: parameter.type,
    });
    setIsEditParamModalOpen(true);
  };

  const openEditCamera = (camera: CameraInterface) => {
    setCurrentCamera(camera);
    setCameraForm({
      factory_id: camera.factory_id?.toString() || "",
      model: camera.model,
      stream_link: camera.stream_link,
      ip_address: camera.ip_address,
      login: camera.login,
      password: camera.password,
      status: camera.status,
      has_ptz: camera.has_ptz,
    });
    setIsEditCameraModalOpen(true);
  };

  const openDeleteModal = (id: number, type: "parameter" | "camera") => {
    setDeleteId(id);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  const getStatusText = (status: CameraInterface["status"]) => {
    const statusMap = {
      active: "Фаол",
      inactive: "Фаол эмас",
      maintenance: "Техник",
      broken: "Ишламайди",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: CameraInterface["status"]) => {
    const colorMap = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-600",
      maintenance: "bg-yellow-100 text-yellow-800",
      broken: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">⏳ Юкланмоқда...</div>
      </div>
    );
  }

  return (
    <div className="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100">
      {/* Parameters Section */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-3">
          <h2 className="text-lg sm:text-xl md:text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Параметрлар рўйхати
          </h2>
          <button
            onClick={() => setIsCreateParamModalOpen(true)}
            className="bg-primary hover:opacity-80 text-white font-medium text-sm md:text-base px-4 py-2 rounded w-full sm:w-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Параметр қўшиш
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-xs sm:text-sm md:text-base font-medium">
                  #
                </th>
                <th className="py-2 text-left text-xs sm:text-sm md:text-base font-medium">
                  Номи
                </th>
                <th className="py-2 text-left text-xs sm:text-sm md:text-base font-medium">
                  Тури
                </th>
                <th className="py-2 text-left text-xs sm:text-sm md:text-base font-medium">
                  Амалиёт
                </th>
              </tr>
            </thead>
            <tbody>
              {parameters.length > 0 ? (
                parameters.map((parameter, index) => (
                  <tr key={parameter.id} className="border-b hover:bg-slate-50">
                    <td className="py-2 text-xs sm:text-sm md:text-base">
                      {index + 1}
                    </td>
                    <td className="py-2 text-xs sm:text-sm md:text-base">
                      {parameter.name}
                    </td>
                    <td className="py-2 text-xs sm:text-sm md:text-base">
                      {parameter.type}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditParameter(parameter)}
                          className="text-primary hover:opacity-80 transition-colors"
                          title="Таҳрирлаш"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            openDeleteModal(parameter.id, "parameter")
                          }
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Ўчириш"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-slate-400 text-xs sm:text-sm md:text-base"
                  >
                    Параметрлар топилмади
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cameras Section */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-6 mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg sm:text-xl md:text-3xl font-semibold flex items-center gap-2">
            <Camera className="w-8 h-8" />
            Камералар рўйхати
          </h2>
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="bg-primary hover:opacity-80 text-white font-medium text-sm md:text-base px-4 py-2 rounded w-full sm:w-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Камера қўшиш
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium w-12">
                  #
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium min-w-[120px]">
                  Модел
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium min-w-[250px] max-w-[300px]">
                  Stream линк
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium min-w-[100px]">
                  IP мансуба
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium w-20">
                  Логин
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium w-24">
                  Пароль
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium w-16">
                  PTZ
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium min-w-[80px]">
                  Статус
                </th>
                <th className="py-3 px-2 text-left text-xs sm:text-sm md:text-base font-medium w-20">
                  Амалиёт
                </th>
              </tr>
            </thead>
            <tbody>
              {cameras.length > 0 ? (
                cameras.map((camera, index) => (
                  <tr key={camera.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base">
                      {index + 1}
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base">
                      <div className="truncate" title={camera.model}>
                        {camera.model}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base">
                      <div
                        className="break-all leading-tight"
                        title={camera.stream_link}
                      >
                        <span className="text-blue-600">
                          {camera.stream_link}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base">
                      {camera.ip_address}
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base">
                      {camera.login}
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base text-gray-400">
                      *****
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          camera.has_ptz
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {camera.has_ptz ? "Ҳа" : "Йўқ"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm md:text-base">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                          camera.status
                        )}`}
                      >
                        {getStatusText(camera.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCamera(camera)}
                          className="text-primary hover:opaciry transition-colors"
                          title="Таҳрирлаш"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(camera.id, "camera")}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Ўчириш"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 text-center text-slate-400 text-xs sm:text-sm md:text-base"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-12 h-12 text-slate-300" />
                      <span>Камералар топилмади</span>
                      <small className="text-slate-300">
                        Янги камера қўшиш учун юқоридаги тугмани босинг
                      </small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Parameter Modal */}
      {isCreateParamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md sm:w-[460px]">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Янги параметр қўшиш</h2>
                <button
                  onClick={() => setIsCreateParamModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateParameter}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Параметр номи
                  </label>
                  <input
                    type="text"
                    required
                    value={""}
                    onChange={(e) =>
                      setParameterForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Параметр номи"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Параметр тури
                  </label>
                  <select
                    required
                    value={""}
                    onChange={(e) =>
                      setParameterForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateParamModalOpen(false)}
                    className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-primary text-white hover:opacity-80 disabled:opacity-50"
                  >
                    {loading ? "Сақланмоқда..." : "Сақлаш"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parameter Modal */}
      {isEditParamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md sm:w-[460px]">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Параметрни таҳрирлаш</h2>
                <button
                  onClick={() => setIsEditParamModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditParameter}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Параметр номи
                  </label>
                  <input
                    type="text"
                    required
                    value={parameterForm.name}
                    onChange={(e) =>
                      setParameterForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Параметр номи"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Параметр тури
                  </label>
                  <select
                    required
                    value={parameterForm.type}
                    onChange={(e) =>
                      setParameterForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditParamModalOpen(false)}
                    className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-primary text-white hover:opacity-80 disabled:opacity-50"
                  >
                    {loading ? "Сақланмоқда..." : "Сақлаш"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md sm:w-[460px] max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Янги камера қўшиш</h2>
                <button
                  onClick={() => setIsCameraModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateCamera}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Лойиҳа</label>
                  <select
                    required
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        factory_id: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Лойиҳани танланг</option>
                    {factories.map((factory) => (
                      <option key={factory.id}>
                        {factory.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Модел</label>
                  <input
                    type="text"
                    required
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Масалан: Hikvision DS-2CD2085G1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Stream линк
                  </label>
                  <input
                    type="text"
                    required
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        stream_link: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="rtsp://admin:password@192.168.1.100:554/stream"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">IP мансуба</label>
                  <input
                    type="text"
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        ip_address: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Логин</label>
                  <input
                    type="text"
                    required
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        login: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Пароль</label>
                  <input
                    type="password"
                    required
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Камера паролини киритинг"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Статус</label>
                  <select
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        status: e.target.value as CameraInterface["status"],
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Фаол</option>
                    <option value="inactive">Фаол эмас</option>
                    <option value="maintenance">
                      Техник хизмат кўрсатишда
                    </option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">PTZ дастак</label>
                  <select
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        has_ptz: e.target.value === "true",
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">Йўқ</option>
                    <option value="true">Ҳа</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(false)}
                    className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-primary text-white hover:opacity-80 disabled:opacity-50"
                  >
                    {loading ? "Сақланмоқда..." : "Сақлаш"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Camera Modal */}
      {isEditCameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md sm:w-[460px] max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Камерани таҳрирлаш</h2>
                <button
                  onClick={() => setIsEditCameraModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEditCamera}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Модел</label>
                  <input
                    type="text"
                    required
                    value={cameraForm.model}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Масалан: Hikvision DS-2CD2085G1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Stream линк
                  </label>
                  <input
                    type="text"
                    required
                    value={cameraForm.stream_link}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        stream_link: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="rtsp://admin:password@192.168.1.100:554/stream"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">IP мансуба</label>
                  <input
                    type="text"
                    value={cameraForm.ip_address}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        ip_address: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Логин</label>
                  <input
                    type="text"
                    required
                    value={cameraForm.login}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        login: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="admin"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Пароль</label>
                  <input
                    type="text"
                    required
                    value={cameraForm.password}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Камера паролини киритинг"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Статус</label>
                  <select
                    value={cameraForm.status}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        status: e.target.value as CameraInterface["status"],
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Фаол</option>
                    <option value="inactive">Фаол эмас</option>
                    <option value="maintenance">
                      Техник хизмат кўрсатишда
                    </option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">PTZ дастак</label>
                  <select
                    value={cameraForm.has_ptz.toString()}
                    onChange={(e) =>
                      setCameraForm((prev) => ({
                        ...prev,
                        has_ptz: e.target.value === "true",
                      }))
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">Йўқ</option>
                    <option value="true">Ҳа</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditCameraModalOpen(false)}
                    className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                  >
                    Бекор қилиш
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-primary text-white hover:opacity-80 disabled:opacity-50"
                  >
                    {loading ? "Сақланмоқда..." : "Сақлаш"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Ўчиришни тасдиқлайсизми?
            </h2>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
              >
                Бекор қилиш
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Ўчирилмоқда..." : "Ўчириш"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
