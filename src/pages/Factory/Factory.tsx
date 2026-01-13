import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Monitor, CreditCard } from "lucide-react";
import { FactoryInterface, FactoryCounts } from "./types/factory";
import { showToast } from "../../utils/toast";
import StatisticsCards from "./components/StatisticsCards";
import ProjectGrid from "./components/ProjectGrid";
import CreateProjectModal from "./modal/FactoryCreateModal";
import EditProjectModal from "./modal/EditProjectModal";
import ParameterModal from "./modal/ParameterModal";
import HistoryModal from "./modal/HistoryModal";
import ParameterControlModal from "./modal/ParameterControlModal";
import DeleteConfirmModal from "./modal/DeleteConfirmModal";
import ImageModal from "./modal/ImageModal";
import axios from "axios";

const Factory: React.FC = () => {
  const [factories, setFactories] = useState<FactoryInterface[]>([]);
  const [counts, setCounts] = useState<FactoryCounts>({
    registrationCount: 0,
    constructionCount: 0,
    startedCount: 0,
  });
  const [total, setTotal] = useState<number>(0);
  const [currentFilter, setCurrentFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [parameterModalOpen, setParameterModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Modal data states
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(
    null
  );
  const [selectedParameter, setSelectedParameter] = useState<any>(null);
  const [factoryToDelete, setFactoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    generateFactoryHtml();
    checkUserPermissions();
  }, []);

  const checkUserPermissions = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const decodedToken = parseJwt(token);

      if (!decodedToken || !decodedToken.user) {
        return;
      }

      // Handle viewer role permissions
      if (decodedToken.user.role === "viewer") {
        // Hide edit buttons and create buttons
        const style = document.createElement("style");
        style.textContent = `
          #parameter-edit-btn,
          #factory-edit-btn-visible,
          #factory-delete-btn-visible,
          #create-factory-btn,
          #parameter-control-btn {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      console.error("Permission setup error:", error);
    }
  };

  const parseJwt = (token: string) => {
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Token decode error:", e);
      return null;
    }
  };

  const generateFactoryHtml = async (status: string = "") => {
    try {
      const response = await axios.get(`/factory/all?status=${status}`);
      const data = response.data;

      setFactories(data.factories || []);
      if (data.counts) {
        setCounts(data.counts);
      }
      setTotal(data.total || 0);
      setCurrentFilter(status);
    } catch (error) {
      console.error("Error loading factories:", error);
    }
  };

  const incrementStatistics = (status: string) => {
    setTotal((prev) => prev + 1);

    switch (status) {
      case "REGISTRATION":
        setCounts((prev: any) => ({
          ...prev,
          registrationCount: prev.registrationCount + 1,
        }));
        break;
      case "CONSTRUCTION":
        setCounts((prev: any) => ({
          ...prev,
          constructionCount: prev.constructionCount + 1,
        }));
        break;
      case "STARTED":
        setCounts((prev: any) => ({
          ...prev,
          startedCount: prev.startedCount + 1,
        }));
        break;
    }
  };

  const handleCreateProject = () => {
    setCreateModalOpen(true);
  };

  const handleEditProject = (factoryId: number) => {
    setSelectedFactoryId(factoryId);
    setEditModalOpen(true);
  };

  const handleParameterUpdate = (parameterData: any) => {
    setSelectedParameter(parameterData);
    setParameterModalOpen(true);
  };

  const handleShowHistory = (factoryParamId: number) => {
    setSelectedFactoryId(factoryParamId);
    setHistoryModalOpen(true);
  };

  const handleParameterControl = (factoryId: number) => {
    setSelectedFactoryId(factoryId);
    setControlModalOpen(true);
  };

  const handleDeleteConfirm = (factoryId: number, factoryName: string) => {
    setFactoryToDelete({ id: factoryId, name: factoryName });
    setDeleteModalOpen(true);
  };

  const handleImageModal = (images: string[], index: number = 0) => {
    setModalImages(images);
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const handleProjectCreated = (status: string) => {
    generateFactoryHtml();
    incrementStatistics(status);
    showToast("Лойиҳа муваффақиятли қўшилди!", "success");
  };

  const handleProjectUpdated = () => {
    generateFactoryHtml();
    showToast("Лойиҳа муваффақиятли янгиланди!", "success");
  };

  const handleProjectDeleted = () => {
    generateFactoryHtml();
    showToast("Лойиҳа муваффақиятли ўчирилди!", "success");
  };

  const { t } = useTranslation();
  return (
    <div className="min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-4 max-sm:py-8 dark:bg-darkmode-700 md:px-[22px]">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 mt-8">
          <div className="intro-y lg:flex items-center justify-between">
            <h2 className="mr-5 text-xl font-bold">
              {t("investment_project_monitoring")}
            </h2>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-2 rounded-md transition-all ${
                    viewMode === "card"
                      ? "bg-white shadow-md text-cyan-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Karta ko'rinishi"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-white shadow-md text-cyan-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Jadval ko'rinishi"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
              <button
                id="create-factory-btn"
                onClick={handleCreateProject}
                className="bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded"
                style={{ backgroundColor: "#00a0c6" }}
              >
                {t("add_project")}
              </button>
            </div>
          </div>

          <StatisticsCards
            total={total}
            counts={counts}
            onFilterChange={generateFactoryHtml}
          />

          <ProjectGrid
            factories={factories}
            viewMode={viewMode}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteConfirm}
            onParameterUpdate={handleParameterUpdate}
            onShowHistory={handleShowHistory}
            onParameterControl={handleParameterControl}
            onImageModal={handleImageModal}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />

      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        factoryId={selectedFactoryId}
        onSuccess={handleProjectUpdated}
      />

      <ParameterModal
        isOpen={parameterModalOpen}
        onClose={() => setParameterModalOpen(false)}
        parameter={selectedParameter}
        onSuccess={() => generateFactoryHtml()}
      />

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        factoryParamId={selectedFactoryId}
      />

      <ParameterControlModal
        isOpen={controlModalOpen}
        onClose={() => setControlModalOpen(false)}
        factoryId={selectedFactoryId}
        onSuccess={() => generateFactoryHtml()}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        factory={factoryToDelete}
        onSuccess={handleProjectDeleted}
      />

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={modalImages}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
};

export default Factory;
