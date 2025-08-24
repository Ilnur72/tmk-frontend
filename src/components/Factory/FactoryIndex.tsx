import React, { useState, useEffect } from "react";
import axios from "axios";

interface Factory {
  id: number;
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
  images?: string;
  created_at: string;
  updated_at: string;
  factoryParams?: FactoryParam[];
}

interface FactoryParam {
  id: number;
  param: {
    id: number;
    name: string;
    type: string;
  };
  status: number;
  visible: boolean;
  latestLog?: {
    value?: string;
    izoh?: string;
  };
}

interface Statistics {
  total: number;
  registrationCount: number;
  constructionCount: number;
  startedCount: number;
}

const FactoryIndex: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    registrationCount: 0,
    constructionCount: 0,
    startedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const generateFactoryHtml = React.useCallback(async (status = "") => {
    try {
      setLoading(true);
      const response = await axios.get(`/factory/all?status=${status}`);
      const data = response.data;

      setFactories(data.factories);

      if (data.counts) {
        updateStatisticsCounts(data.counts, data.total);
      }
    } catch (error) {
      console.error("Error loading factories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateFactoryHtml();
  }, [generateFactoryHtml]);

  const updateStatisticsCounts = (counts: any, total: number) => {
    setStatistics({
      total: total || 0,
      registrationCount: counts.registrationCount || 0,
      constructionCount: counts.constructionCount || 0,
      startedCount: counts.startedCount || 0,
    });
  };

  const getFirstImage = (images: string) => {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed[0] : null;
    } catch {
      return null;
    }
  };

  const showDeleteConfirmModal = (factoryId: number, factoryName: string) => {
    // Modal show functionality will be implemented
  };

  const showFactoryEditModal = (factoryId: number) => {
    // Edit modal functionality will be implemented
  };

  const showParameterModal = (
    factoryId: number,
    paramId: number,
    paramName: string,
    paramType: string,
    factoryParamId: number,
    status: number
  ) => {
    // Parameter modal functionality will be implemented
  };

  const showCommentHistory = (paramId: number) => {
    // Comment history functionality will be implemented
  };

  const showParametrControlModal = (factoryId: number) => {
    // Parameter control modal functionality will be implemented
  };

  return (
    <div className="md:max-w-auto min-h-screen min-w-0 max-w-full flex-1 rounded-[30px] bg-slate-100 px-4 pb-10 before:block before:h-px before:w-full before:content-[''] dark:bg-darkmode-700 md:px-[22px]">
      <style>{`
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          background-color: #ef4444;
          color: white;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          transform: translateX(150%);
          transition: transform 0.3s ease;
        }

        .toast.show {
          transform: translateX(0);
        }

        .toast.success {
          background-color: #10b981;
        }
        
        .image-preview {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .image-preview-item {
          position: relative;
          display: inline-block;
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .image-preview-item:hover {
          transform: scale(1.05);
        }

        .image-preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .image-preview-item:hover .image-preview-overlay {
          opacity: 1;
        }

        .eye-icon {
          color: white;
          font-size: 24px;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 15;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .image-preview-item:hover .remove-image {
          opacity: 1;
        }

        .remove-image:hover {
          background: rgba(220, 38, 38, 0.9);
        }

        .existing-image-badge {
          position: absolute;
          top: 5px;
          left: 5px;
          background: #10b981;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          z-index: 10;
        }

        .new-image-badge {
          position: absolute;
          top: 5px;
          left: 5px;
          background: #3b82f6;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          z-index: 10;
        }

        .image-modal {
          display: none;
          position: fixed;
          z-index: 99999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
        }

        .image-modal-content {
          display: block;
          margin: auto;
          max-width: 90%;
          max-height: 90%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100001;
        }

        .image-modal-close {
          position: absolute;
          top: 15px;
          right: 35px;
          color: #f1f1f1;
          font-size: 40px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
          z-index: 100002;
        }

        .image-modal-close:hover,
        .image-modal-close:focus {
          color: #bbb;
        }

        .image-modal-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-size: 30px;
          font-weight: bold;
          cursor: pointer;
          padding: 16px;
          user-select: none;
          transition: 0.3s;
          z-index: 100002;
        }

        .image-modal-nav:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .image-modal-prev {
          left: 0;
        }

        .image-modal-next {
          right: 0;
        }
      `}</style>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 mt-8">
          <div className="intro-y lg:flex items-center justify-between">
            <h2 className="mr-5 text-lg font-medium">
              Инвестиция лойиҳалари ҳолати мониторинги
            </h2>
            <button
              id="create-factory-btn"
              className="bg-primary hover:opacity-70 text-white font-bold py-2 px-4 rounded"
            >
              Лойиҳа қўшиш
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="mt-5 grid grid-cols-12 gap-6">
            <div
              onClick={() => generateFactoryHtml()}
              className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
            >
              <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                <div className="box p-5">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-shopping-cart stroke-1.5 h-[28px] w-[28px] text-primary"
                    >
                      <circle cx="8" cy="21" r="1"></circle>
                      <circle cx="19" cy="21" r="1"></circle>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                    </svg>
                    <div className="ml-auto">
                      <div className="tooltip cursor-pointer flex items-center rounded-full bg-success py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                        33%
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-up stroke-1.5 ml-0.5 h-4 w-4"
                        >
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    id="total-count"
                    className="mt-6 text-3xl font-medium leading-8"
                  >
                    {statistics.total}
                  </div>
                  <div className="mt-1 text-base text-slate-500">
                    Жами лойиҳалар
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => generateFactoryHtml("REGISTRATION")}
              className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
            >
              <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                <div className="box p-5">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-monitor stroke-1.5 h-[28px] w-[28px] text-warning"
                    >
                      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                      <line x1="8" x2="16" y1="21" y2="21"></line>
                      <line x1="12" x2="12" y1="17" y2="21"></line>
                    </svg>
                    <div className="ml-auto">
                      <div className="tooltip cursor-pointer flex items-center rounded-full bg-success py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                        22%
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-up stroke-1.5 ml-0.5 h-4 w-4"
                        >
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    id="registration-count"
                    className="mt-6 text-3xl font-medium leading-8"
                  >
                    {statistics.registrationCount}
                  </div>
                  <div className="mt-1 text-base text-slate-500">
                    Расмийлаштириш жараёнида
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => generateFactoryHtml("CONSTRUCTION")}
              className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
            >
              <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                <div className="box p-5">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-construction-icon lucide-construction text-success"
                    >
                      <rect x="2" y="6" width="20" height="8" rx="1" />
                      <path d="M17 14v7" />
                      <path d="M7 14v7" />
                      <path d="M17 3v3" />
                      <path d="M7 3v3" />
                      <path d="M10 14 2.3 6.3" />
                      <path d="m14 6 7.7 7.7" />
                      <path d="m8 6 8 8" />
                    </svg>
                    <div className="ml-auto">
                      <div className="tooltip cursor-pointer flex items-center rounded-full bg-success py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                        12%
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-up stroke-1.5 ml-0.5 h-4 w-4"
                        >
                          <path d="m18 15-6-6-6 6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    id="construction-count"
                    className="mt-6 text-3xl font-medium leading-8"
                  >
                    {statistics.constructionCount}
                  </div>
                  <div className="mt-1 text-base text-slate-500">
                    Қурилиш жараёнида
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => generateFactoryHtml("STARTED")}
              className="intro-y col-span-12 sm:col-span-6 xl:col-span-3 cursor-pointer"
            >
              <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                <div className="box p-5">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-credit-card stroke-1.5 h-[28px] w-[28px] text-pending"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                    <div className="ml-auto">
                      <div className="tooltip cursor-pointer flex items-center rounded-full bg-danger py-[3px] pl-2 pr-1 text-xs font-medium text-white">
                        2%
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-down stroke-1.5 ml-0.5 h-4 w-4"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div
                    id="started-count"
                    className="mt-6 text-3xl font-medium leading-8"
                  >
                    {statistics.startedCount}
                  </div>
                  <div className="mt-1 text-base text-slate-500">
                    Ишга тушганлари
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Factory Data Grid */}
          <div
            id="factory-data-wrapper"
            className="mt-5 grid grid-cols-12 gap-6"
          >
            {loading ? (
              <div className="col-span-12 flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              factories.map((item) => {
                const firstImage = item.images
                  ? getFirstImage(item.images)
                  : null;
                return (
                  <div
                    key={item.id}
                    className="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
                  >
                    <div className="box">
                      <div className="p-5">
                        <div className="image-fit h-40 overflow-hidden rounded-md before:absolute before:left-0 before:top-0 before:z-10 before:block before:h-full before:w-full before:bg-gradient-to-t before:from-black before:to-black/10 2xl:h-56 relative">
                          {firstImage ? (
                            <img
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              className="rounded-md"
                              src={`/mnt/tmkupload/factory-images/${firstImage}`}
                              alt={item.name}
                            />
                          ) : (
                            <img
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              className="rounded-md"
                              src="/public/image/3.jpg"
                              alt="Default factory"
                            />
                          )}

                          <div className="absolute right-2 top-1 z-10 left-auto">
                            <div className="flex gap-2">
                              <button
                                className="flex items-center text-primary bg-white/80 hover:bg-white px-2 py-1 rounded"
                                onClick={() => showFactoryEditModal(item.id)}
                              >
                                <svg
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
                                    clipRule="evenodd"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                className="flex items-center text-red-500 bg-white/80 hover:bg-white px-2 py-1 rounded"
                                onClick={() =>
                                  showDeleteConfirmModal(item.id, item.name)
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 1.414.586L16 3h3a1 1 0 1 1 0 2h-1v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V5H5a1 1 0 0 1 0-2h3l.586-.414ZM10 6a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="absolute bottom-0 z-10 px-5 pb-6 text-white">
                            {item.name}
                          </div>
                        </div>
                        <div className="mt-5 text-slate-600 dark:text-slate-500">
                          <div className="p-5">
                            <div className="preview relative [&.hide]:overflow-hidden [&.hide]:h-0">
                              <div className="w-full bg-slate-200 rounded dark:bg-black/20 h-4 my-2">
                                <div
                                  role="progressbar"
                                  aria-valuenow={item.work_persent}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  className="bg-primary h-full rounded text-xs text-white flex justify-center items-center"
                                  style={{ width: `${item.work_persent}%` }}
                                >
                                  {item.work_persent}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            id={`factory-params-${item.id}`}
                            className="sortable-params"
                          >
                            {item.factoryParams?.map((param) => (
                              <div
                                key={param.id}
                                className="factory-param-item flex justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-darkmode-400"
                                data-id={param.id}
                              >
                                <div className="flex justify-between items-center gap-1 mt-2">
                                  <button className="drag-handle">
                                    <svg
                                      width="20"
                                      height="20"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle cx="7" cy="7" r="2" fill="#888" />
                                      <circle
                                        cx="7"
                                        cy="17"
                                        r="2"
                                        fill="#888"
                                      />
                                      <circle
                                        cx="17"
                                        cy="7"
                                        r="2"
                                        fill="#888"
                                      />
                                      <circle
                                        cx="17"
                                        cy="17"
                                        r="2"
                                        fill="#888"
                                      />
                                    </svg>
                                  </button>
                                  <div
                                    className={`flex flex-col cursor-pointer ${
                                      param.visible ? "" : "hidden"
                                    }`}
                                    onClick={() => showCommentHistory(param.id)}
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
                                          src={`/public/image/${
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
                                              param.latestLog?.value &&
                                              param.latestLog.value.length > 2
                                                ? "inline"
                                                : "none",
                                          }}
                                        >
                                          {param.latestLog?.value &&
                                          param.latestLog.value.length > 2
                                            ? param.latestLog.value
                                            : ""}
                                        </span>
                                      ) : null}
                                    </div>
                                    {param.latestLog?.izoh ? (
                                      <span
                                        data-param-id={param.id.toString()}
                                        id={param.id.toString()}
                                        className={`text-xs ${
                                          param.visible ? "flex" : "hidden"
                                        }`}
                                      >
                                        Изох: {param.latestLog.izoh}
                                      </span>
                                    ) : (
                                      <span
                                        data-param-id={param.id.toString()}
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
                                  onClick={() =>
                                    showParameterModal(
                                      item.id,
                                      param.param.id,
                                      param.param.name,
                                      param.param.type,
                                      param.id,
                                      param.status
                                    )
                                  }
                                >
                                  <svg
                                    className="w-6 h-6 text-primary dark:text-primary"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
                                      clipRule="evenodd"
                                    />
                                    <path
                                      fillRule="evenodd"
                                      d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center border-t border-slate-200/60 p-5 dark:border-darkmode-400 lg:justify-end">
                        <button
                          id="parameter-control-btn"
                          onClick={() => showParametrControlModal(item.id)}
                          className="text-primary flex gap-1 items-center"
                        >
                          Параметрларини Бошкариш
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="mr-2"
                          >
                            <rect
                              x="3"
                              y="5"
                              width="14"
                              height="2"
                              rx="1"
                              fill="currentColor"
                            />
                            <circle cx="18" cy="6" r="3" fill="currentColor" />
                            <rect
                              x="3"
                              y="11"
                              width="8"
                              height="2"
                              rx="1"
                              fill="currentColor"
                            />
                            <circle cx="12" cy="12" r="3" fill="currentColor" />
                            <rect
                              x="3"
                              y="17"
                              width="10"
                              height="2"
                              rx="1"
                              fill="currentColor"
                            />
                            <circle cx="15" cy="18" r="3" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryIndex;
