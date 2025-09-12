import React, { useEffect, useRef } from "react";
import { Edit, Trash2, Settings, Eye } from "lucide-react";
import Sortable from "sortablejs";
import { FactoryInterface } from "../types/factory";
import { API_URL } from "../../../config/const ";
import FactoryDetailsModal from "../modal/FactoryModal";

interface ProjectCardProps {
  factory: FactoryInterface;
  onEdit: (factoryId: number) => void;
  onDelete: (factoryId: number, factoryName: string) => void;
  onParameterUpdate: (parameterData: any) => void;
  onShowHistory: (factoryParamId: number) => void;
  onParameterControl: (factoryId: number) => void;
  onImageModal: (images: string[], index: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  factory,
  onEdit,
  onDelete,
  onParameterUpdate,
  onShowHistory,
  onParameterControl,
  onImageModal,
}) => {
  const sortableRef = useRef<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  useEffect(() => {
    if (sortableRef.current && factory.factoryParams) {
      const sortable = new Sortable(sortableRef.current, {
        animation: 150,
        handle: ".drag-handle",
        ghostClass: "bg-slate-100",
        onEnd: function (evt) {
          const sortedIds = [
            ...sortableRef.current!.querySelectorAll(".factory-param-item"),
          ]
            .map((el) => (el as HTMLElement).dataset.id)
            .filter(Boolean)
            .map(Number);

          fetch(`/factory/${factory.id}/update-param-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              factoryId: factory.id,
              order: sortedIds,
            }),
          });
        },
      });

      return () => {
        sortable.destroy();
      };
    }
  }, [factory.factoryParams, factory.id]);

  const getFirstImage = (images: string | string[]) => {
    try {
      if (!images) return null;
      const parsed = Array.isArray(images) ? images : JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : null;
    } catch {
      return null;
    }
  };

  const firstImage = getFirstImage(factory.images ?? "");
  const imageSrc = firstImage
    ? `${API_URL}/mnt/tmkupload/factory-images/${firstImage}`
    : "/public/image/3.jpg";

  const DragHandle = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle cx="7" cy="7" r="2" fill="#888" />
      <circle cx="7" cy="17" r="2" fill="#888" />
      <circle cx="17" cy="7" r="2" fill="#888" />
      <circle cx="17" cy="17" r="2" fill="#888" />
    </svg>
  );

  const handleParameterEdit = (param: any) => {
    onParameterUpdate({
      factoryId: factory.id,
      paramId: param.param.id,
      paramName: param.param.name,
      paramType: param.param.type,
      factoryParamId: param.id,
      status: param.status,
    });
  };

  return (
    <>
      <div className="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3">
        <div className="box">
          <div className="p-5">
            <div className="image-fit h-40 overflow-hidden rounded-md before:absolute before:left-0 before:top-0 before:z-10 before:block before:h-full before:w-full before:bg-gradient-to-t before:from-black before:to-black/10 2xl:h-56 relative">
              <img
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                className="rounded-md"
                src={imageSrc}
                alt={factory.name}
              />
              <div className="absolute right-2 top-1 z-10 left-auto">
                <div className="flex gap-2">
                  <button
                    id="factory-view-btn-visible"
                    className="flex items-center text-primary bg-white/80 hover:bg-white px-2 py-1 rounded"
                    onClick={() => setIsOpen(true)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    id="factory-edit-btn-visible"
                    className="flex items-center text-primary bg-white/80 hover:bg-white px-2 py-1 rounded"
                    onClick={() => onEdit(factory.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    id="factory-delete-btn-visible"
                    className="flex items-center text-red-500 bg-white/80 hover:bg-white px-2 py-1 rounded"
                    onClick={() => onDelete(factory.id, factory.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 z-10 px-5 pb-6 text-white">
                {factory.name}
              </div>
            </div>

            <div className="mt-5 text-slate-600 dark:text-slate-500">
              <div className="p-5">
                <div className="preview relative [&.hide]:overflow-hidden [&.hide]:h-0">
                  <div className="w-full bg-slate-200 rounded dark:bg-black/20 h-4 my-2">
                    <div
                      role="progressbar"
                      aria-valuenow={factory.work_persent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="bg-primary h-full rounded text-xs text-white flex justify-center items-center"
                      style={{
                        width: `${factory.work_persent}%`,
                        backgroundColor: "#00a0c6",
                      }}
                    >
                      {factory.work_persent}%
                    </div>
                  </div>
                </div>
              </div>

              <div ref={sortableRef} className="sortable-params">
                {factory.factoryParams?.map((param: any) => (
                  <div
                    key={param.id}
                    className="factory-param-item flex justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-darkmode-400"
                    data-id={param.id}
                  >
                    <div className="flex justify-between items-center gap-1 mt-2">
                      <button className="drag-handle">
                        <DragHandle />
                      </button>
                      <div
                        className="flex flex-col cursor-pointer"
                        onClick={() => onShowHistory(param.id)}
                        style={{ display: param.visible ? "flex" : "none" }}
                      >
                        <div
                          className={
                            param.param.type === "select"
                              ? "flex items-center"
                              : ""
                          }
                        >
                          <span
                            className="cursor-pointer"
                            data-param-id={param.param.id}
                          >
                            {param.param.name}:&nbsp;
                          </span>
                          {param.param.type === "select" ? (
                            <img
                              id={param.id.toString()}
                              className="rounded-full"
                              src={`/image/${
                                param.status === 0
                                  ? "error"
                                  : param.status === 1
                                  ? "ok"
                                  : param.status
                              }.png`}
                              alt="Status indicator"
                              width="20"
                              height="20"
                            />
                          ) : param.param.type === "date" ? (
                            <span
                              id={`factory-param-date-${param.id}`}
                              className="ml-1"
                              style={{
                                display:
                                  param.latestLog?.value?.length > 2
                                    ? "inline"
                                    : "none",
                              }}
                            >
                              {param.latestLog?.value?.length > 2
                                ? param.latestLog.value
                                : ""}
                            </span>
                          ) : null}
                        </div>
                        {param.latestLog?.izoh ? (
                          <span
                            data-param-id={param.id}
                            id={param.id.toString()}
                            className={`text-xs ${
                              param.visible ? "flex" : "hidden"
                            }`}
                          >
                            Изох: {param.latestLog.izoh}
                          </span>
                        ) : (
                          <span
                            data-param-id={param.id}
                            id={param.id.toString()}
                            className={`pl-2 text-xs ${
                              param.visible ? "flex" : "hidden"
                            }`}
                          ></span>
                        )}
                      </div>
                    </div>
                    <button
                      id="parameter-edit-btn"
                      onClick={() => handleParameterEdit(param)}
                    >
                      <Edit className="w-5 h-5 text-primary dark:text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center border-t border-slate-200/60 p-5 dark:border-darkmode-400 lg:justify-end">
            <button
              id="parameter-control-btn"
              onClick={() => onParameterControl(factory.id)}
              className="text-primary flex gap-1 items-center"
              style={{ color: "#00a0c6" }}
            >
              Параметрларини Бошкариш
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <FactoryDetailsModal
        factory={factory}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default ProjectCard;
