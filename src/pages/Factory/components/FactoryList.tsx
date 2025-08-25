import React from "react";
import { ReactSortable } from "react-sortablejs";
import { API_URL } from "../../../config/const ";

interface FactoryParam {
  id: number;
  param: {
    id: number;
    name: string;
    type: string;
  };
  visible: boolean;
  status: number;
  latestLog?: {
    value: string;
    izoh: string;
  };
}

interface FactoryData {
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
  images?: string[];
  created_at: string;
  updated_at: string;
  factoryParams?: FactoryParam[];
}

interface FactoryCardsProps {
  factories: FactoryData[];
  onEdit: (factoryId: any) => void;
  onDelete: (factoryId: number, name: string) => void;
  onParameterEdit?: (
    factoryId: number,
    paramId: number,
    paramName: string,
    paramType: string,
    factoryParamId: number,
    status: number
  ) => void;
  onParameterControl?: (factoryId: number) => void;
  onCommentHistory?: (paramId: number) => void;
}

const FactoryCards: React.FC<FactoryCardsProps> = ({
  factories,
  onEdit,
  onDelete,
  onParameterEdit,
  onParameterControl,
  onCommentHistory,
}) => {
  const getFirstImage = (images: string[] | string) => {
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed[0] : null;
      } catch {
        return null;
      }
    }
    if (Array.isArray(images)) {
      return images[0] || null;
    }
    return null;
  };

  const handleParamOrderUpdate = async (
    factoryId: number,
    newOrder: FactoryParam[]
  ) => {
    const sortedIds = newOrder.map((param) => param.id);
    try {
      await fetch(`/factory/${factoryId}/update-param-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factoryId,
          order: sortedIds,
        }),
      });
    } catch (error) {
      console.error("Error updating parameter order:", error);
    }
  };

  return (
    <div className="mt-5 grid grid-cols-12 gap-6">
      {factories.map((item) => {
        const firstImage = item.images ? getFirstImage(item.images) : null;

        return (
          <div
            key={item.id}
            className="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
          >
            <div className="box">
              <div className="p-5">
                <div className="image-fit h-40 overflow-hidden rounded-md before:absolute before:left-0 before:top-0 before:z-10 before:block before:h-full before:w-full before:bg-gradient-to-t before:from-black before:to-black/10 2xl:h-56">
                  {firstImage ? (
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      className="rounded-md"
                      src={`${API_URL}/mnt/tmkupload/factory-images/${firstImage}`}
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
                      alt="Default factory image"
                    />
                  )}

                  <div className="absolute right-2 top-1 z-10 left-auto">
                    <div className="flex gap-2">
                      <button
                        className="flex items-center text-primary bg-white/80 hover:bg-white px-2 py-1 rounded"
                        onClick={() => onEdit(item.id)}
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
                        onClick={() => onDelete(item.id, item.name)}
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

                  <ReactSortable
                    list={item.factoryParams || []}
                    setList={(newOrder:any) =>
                      handleParamOrderUpdate(item.id, newOrder)
                    }
                    animation={150}
                    handle=".drag-handle"
                    ghostClass="bg-slate-100"
                    className="sortable-params"
                  >
                    {(item.factoryParams || []).map((param) => (
                      <div
                        key={param.id}
                        className="factory-param-item flex justify-between mb-2 pb-2 border-b border-slate-200/60 dark:border-darkmode-400"
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
                              <circle cx="7" cy="17" r="2" fill="#888" />
                              <circle cx="17" cy="7" r="2" fill="#888" />
                              <circle cx="17" cy="17" r="2" fill="#888" />
                            </svg>
                          </button>
                          <div
                            className="flex flex-col cursor-pointer"
                            // onClick={() => onCommentHistory(param.id)}
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
                                      param.latestLog?.value?.length &&
                                      param.latestLog.value.length > 2
                                        ? "inline"
                                        : "none",
                                  }}
                                >
                                  {param.latestLog?.value?.length &&
                                  param.latestLog.value.length > 2
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
                          // onClick={() =>
                          //   onParameterEdit(
                          //     item.id,
                          //     param.param.id,
                          //     param.param.name,
                          //     param.param.type,
                          //     param.id,
                          //     param.status
                          //   )
                          // }
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
                  </ReactSortable>
                </div>
              </div>
              <div className="flex items-center justify-center border-t border-slate-200/60 p-5 dark:border-darkmode-400 lg:justify-end">
                <button
                  // onClick={() => onParameterControl(item.id)}
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
      })}
    </div>
  );
};

export default FactoryCards;
