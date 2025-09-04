import React, { useState } from "react";
import { ArrowLeft, Calendar, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Types
interface InternshipData {
  еxpiration: string;
  еxpiration_days: string;
}

// API Service
const apiService = {
  async getInternshipData(): Promise<InternshipData[]> {
    const response = await axios.get("/employers/internship");
    return response.data;
  },
};

// Custom hook
const useInternshipData = () => {
  return useQuery<InternshipData[]>({
    queryKey: ["internshipData"],
    queryFn: apiService.getInternshipData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Helper function to calculate days until expiration
const getDaysUntilExpiration = (dateString: string): number => {
  const today = new Date();
  const expirationDate = new Date(dateString);
  const diffTime = expirationDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to get status color
const getStatusColor = (days: number): string => {
  if (days < 0) return "bg-red-100 text-red-800";
  if (days <= 7) return "bg-orange-100 text-orange-800";
  if (days <= 30) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

// Helper function to get status text
const getStatusText = (days: number): string => {
  if (days < 0) return "Муддати ўтган";
  if (days === 0) return "Бугун тугайди";
  if (days === 1) return "Эртага тугайди";
  if (days <= 7) return `${days} кун қолди`;
  if (days <= 30) return `${days} кун қолди`;
  return `${days} кун қолди`;
};

const InternshipPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: internshipData = [], isLoading, error } = useInternshipData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter data based on search and status
  const filteredData = internshipData.filter((item) => {
    const matchesSearch = item.еxpiration
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "all") return true;

    const days = getDaysUntilExpiration(item.еxpiration_days);

    switch (filterStatus) {
      case "expired":
        return days < 0;
      case "urgent":
        return days >= 0 && days <= 7;
      case "soon":
        return days > 7 && days <= 30;
      case "normal":
        return days > 30;
      default:
        return true;
    }
  });

  const handleBack = () => {
    navigate("/employers");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">
                Маълумотларни юклашда хатолик юз берди
              </p>
              <button
                onClick={handleBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Орқага қайтиш
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 max-sm:pt-10">
      <div className="w-full  sm:px-2 lg:px-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Орқага қайтиш
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Амалиёт муддати тугайдиган ходимлар
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ходим исмини қидириш..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white min-w-[200px]"
              >
                <option value="all">Барча ходимлар</option>
                <option value="expired">Муддати ўтган</option>
                <option value="urgent">Жуда тез (7 кун)</option>
                <option value="soon">Тез (30 кун)</option>
                <option value="normal">Норм (30+ кун)</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-red-600 text-sm font-medium">
                Муддати ўтган
              </div>
              <div className="text-red-900 text-xl font-bold">
                {
                  internshipData.filter(
                    (item) => getDaysUntilExpiration(item.еxpiration_days) < 0
                  ).length
                }
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-orange-600 text-sm font-medium">
                7 кун ичида
              </div>
              <div className="text-orange-900 text-xl font-bold">
                {
                  internshipData.filter((item) => {
                    const days = getDaysUntilExpiration(item.еxpiration_days);
                    return days >= 0 && days <= 7;
                  }).length
                }
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">
                30 кун ичида
              </div>
              <div className="text-yellow-900 text-xl font-bold">
                {
                  internshipData.filter((item) => {
                    const days = getDaysUntilExpiration(item.еxpiration_days);
                    return days > 7 && days <= 30;
                  }).length
                }
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Жами</div>
              <div className="text-green-900 text-xl font-bold">
                {internshipData.length}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ходим исми
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Амалиёт тугаш санаси
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Қолган кунлар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ҳолати
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => {
                  const daysLeft = getDaysUntilExpiration(item.еxpiration_days);
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.еxpiration}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(item.еxpiration_days)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {daysLeft} кун
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            daysLeft
                          )}`}
                        >
                          {getStatusText(daysLeft)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm || filterStatus !== "all"
                  ? "Қидирув натижаси топилмади"
                  : "Ҳеч қандай маълумот топилмади"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipPage;
