import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserCheck, UserX, Clock } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/const";
import Pagination from "../../../components/UI/Pagination";

interface EmployeeAttendance {
  id: number;
  full_name: string;
  department: string;
  entry_time: string;
  exit_time: string;
  image: string;
  status: string;
  object_id: number | null;
  object_name: string;
}

interface AttendanceStats {
  total_employees: number;
  not_arrived: number;
  arrived: number;
  late: number;
  currently_in: number;
  left: number;
}

interface ObjectInfo {
  id: number;
  name: string;
  employee_count: number;
}

interface AttendanceResponse {
  active_object: number | null;
  active_status: string;
  counts: AttendanceStats;
  data: EmployeeAttendance[];
  objects: ObjectInfo[];
  success: boolean;
}

const TodayAttendancePage: React.FC = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState<EmployeeAttendance[]>(
    []
  );
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [objects, setObjects] = useState<ObjectInfo[]>([]);
  const [selectedObject, setSelectedObject] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const isInitialMount = useRef(true);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Build URL with query parameters
      let url = `${API_URL}/employers/citynet/today-tmk?query[status]=${selectedStatus}`;

      // Add object_id to query if selected
      if (selectedObject !== null) {
        url += `&query[object_id]=${selectedObject}`;
      }

      const response = await axios.get<AttendanceResponse>(url);

      if (response.data.success) {
        setAttendanceData(response.data.data);
        setStats(response.data.counts);

        // Faqat birinchi yuklanishda tashkilotlar ro'yxatini saqlash
        if (isInitialMount.current && response.data.objects) {
          setObjects(response.data.objects);
          isInitialMount.current = false;
        }

        // Faqat birinchi yuklanishda active_object ni o'rnatish
        if (selectedObject === null && response.data.active_object) {
          setSelectedObject(response.data.active_object);
        }
      }
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      console.error("Error fetching attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedStatus, selectedObject]); // selectedStatus va selectedObject o'zgarganda yangi ma'lumot yuklash

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "arrived":
        return "bg-green-100 text-green-800 border-green-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "currently_in":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "left":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "not_arrived":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "arrived":
        return "Kelgan";
      case "late":
        return "Kechikkan";
      case "currently_in":
        return "Hozir ichkarida";
      case "left":
        return "Ketgan";
      case "not_arrived":
        return "Kelmagan";
      default:
        return status;
    }
  };

  // Pagination logic (no filtering - data already filtered by backend)
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = attendanceData.slice(startIndex, endIndex);

  // Filter o'zgarganda 1-sahifaga qaytish
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedObject, selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-sm:pt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/employers")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Bugungi Davomat</h1>
        </div>

        {/* Tashkilotlar filter */}
        {objects.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tashkilot:
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedObject(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedObject === null
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Hammasi ({attendanceData.length})
              </button>
              {objects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setSelectedObject(obj.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedObject === obj.id
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {obj.name} ({obj.employee_count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* Jami - faqat hammasi tanlanganda ko'rsatiladi */}
            {selectedObject === null && (
              <div
                onClick={() => setSelectedStatus("all")}
                className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-105 ${
                  selectedStatus === "all" ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jami</p>
                    <p className="text-2xl font-bold text-primary">
                      {stats?.total_employees ||
                        stats.arrived + stats.not_arrived}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => setSelectedStatus("arrived")}
              className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-105 ${
                selectedStatus === "arrived" ? "ring-2 ring-green-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kelgan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.arrived}
                  </p>
                </div>
              </div>
            </div>

            {/* Kechikkan - faqat hammasi tanlanganda ko'rsatiladi */}
            {selectedObject === null && (
              <div
                onClick={() => setSelectedStatus("late")}
                className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-105 ${
                  selectedStatus === "late" ? "ring-2 ring-yellow-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kechikkan</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.late}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => setSelectedStatus("currently_in")}
              className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-105 ${
                selectedStatus === "currently_in" ? "ring-2 ring-cyan-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ichkarida</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {stats.currently_in}
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setSelectedStatus("left")}
              className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-105 ${
                selectedStatus === "left" ? "ring-2 ring-gray-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ketgan</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.left}
                  </p>
                </div>
              </div>
            </div>

            {/* Kelmagan - faqat hammasi tanlanganda ko'rsatiladi */}
            {selectedObject === null && (
              <div
                onClick={() => setSelectedStatus("not_arrived")}
                className={`bg-white rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-105 ${
                  selectedStatus === "not_arrived" ? "ring-2 ring-red-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <UserX className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kelmagan</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.not_arrived}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Xodimlar ro'yxati
            {selectedStatus !== "all" && (
              <span className="ml-2 text-sm text-gray-500">
                ({getStatusText(selectedStatus)} - {attendanceData.length} ta)
              </span>
            )}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.map((employee) => (
              <div
                key={employee.id}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-primary/30 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {employee.image ? (
                      <img
                        src={`https://citynet.synterra.uz/media/${employee.image}`}
                        alt={employee.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/image/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {employee.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {employee.department}
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(
                          employee.status
                        )}`}
                      >
                        {getStatusText(employee.status)}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Kirish:</span>
                        <span>{employee.entry_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Chiqish:</span>
                        <span>{employee.exit_time}</span>
                      </div>
                    </div>

                    {employee.object_name !== "-" && (
                      <div className="mt-1 text-xs text-gray-600">
                        <span className="font-medium">Obyekt:</span>{" "}
                        {employee.object_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {attendanceData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Ma'lumot topilmadi</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {attendanceData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={attendanceData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            showItemsPerPage={true}
            itemsPerPageOptions={[10, 20, 50, 100]}
          />
        )}
      </div>
    </div>
  );
};

export default TodayAttendancePage;
