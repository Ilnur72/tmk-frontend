import React, { useState, useEffect } from "react";
import axios from "axios";
import FactoryStats from "../../components/Factory/FactoryStats";
import FactoryList from "../../components/Factory/FactoryList";
import Toast from "../../components/UI/Toast";
import FactoryCreateModal from "../../components/Factory/FactoryCreateModal";

interface FactoryData {
  id: string;
  name: string;
  enterprise_name: string;
  project_goal: string;
  region: string;
  work_persent: number;
  importance: "HIGH" | "AVERAGE" | "LOW";
  status: "REGISTRATION" | "CONSTRUCTION" | "STARTED";
  latitude: number;
  longitude: number;
  marker_icon: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface FactoryStatsData {
  total: number;
  registrationCount: number;
  constructionCount: number;
  startedCount: number;
}

const Factory: React.FC = () => {
  const [factories, setFactories] = useState<FactoryData[]>([]);
  const [stats, setStats] = useState<FactoryStatsData>({
    total: 0,
    registrationCount: 0,
    constructionCount: 0,
    startedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFactory, setEditingFactory] = useState<FactoryData | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/factory/all");
      if (response.data && response.data.factories) {
        setFactories(response.data.factories);
        calculateStats(response.data.factories);
      }
    } catch (error) {
      console.error("Error fetching factories:", error);
      showToast("Маълумотларни юклашда хатолик", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (factoriesData: FactoryData[]) => {
    const total = factoriesData.length;
    const registrationCount = factoriesData.filter(
      (f) => f.status === "REGISTRATION"
    ).length;
    const constructionCount = factoriesData.filter(
      (f) => f.status === "CONSTRUCTION"
    ).length;
    const startedCount = factoriesData.filter(
      (f) => f.status === "STARTED"
    ).length;

    setStats({
      total,
      registrationCount,
      constructionCount,
      startedCount,
    });
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleCreateFactory = () => {
    setEditingFactory(null);
    setShowModal(true);
  };

  const handleEditFactory = (factory: FactoryData) => {
    setEditingFactory(factory);
    setShowModal(true);
  };

  const handleDeleteFactory = async (factoryId: string) => {
    if (window.confirm("Ҳақиқатан ҳам бу лойиҳани ўчирмоқчимисиз?")) {
      try {
        await axios.delete(`/factory/${factoryId}`);
        showToast("Лойиҳа муваффақиятли ўчирилди", "success");
        fetchFactories();
      } catch (error) {
        console.error("Error deleting factory:", error);
        showToast("Лойиҳани ўчиришда хатолик", "error");
      }
    }
  };

  const handleSaveFactory = async (factoryData: any) => {
    try {
      if (editingFactory) {
        // Update existing factory
        await axios.put(`/factory/update/${editingFactory.id}`, factoryData);
        showToast("Лойиҳа муваффақиятли янгиланди", "success");
      } else {
        // Create new factory
        await axios.post("/factory/create", factoryData);
        showToast("Лойиҳа муваффақиятли яратилди", "success");
      }
      setShowModal(false);
      fetchFactories();
    } catch (error) {
      console.error("Error saving factory:", error);
      showToast("Лойиҳани сақлашда хатолик", "error");
    }
  };

  const getFilteredFactories = () => {
    if (statusFilter === "all") {
      return factories;
    }
    return factories.filter((factory) => factory.status === statusFilter);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Инвестиция лойиҳалари ҳолати мониторинги
        </h1>
        <button
          onClick={handleCreateFactory}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Лойиҳа қўшиш
        </button>
      </div>

      {/* Stats Cards */}
      <FactoryStats
        stats={stats}
        onFilterChange={setStatusFilter}
        currentFilter={statusFilter}
      />

      {/* Factory List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <FactoryList
          factories={getFilteredFactories()}
          onEdit={handleEditFactory}
          onDelete={handleDeleteFactory}
        />
      )}

      {/* Factory Modal */}
      {showModal && (
        <FactoryCreateModal
          factory={editingFactory}
          onSave={handleSaveFactory}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Factory;
