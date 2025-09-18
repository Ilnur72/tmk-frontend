import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ParameterData } from "../types/factory";
import { showToast } from "../../../utils/toast";
import { API_URL } from "../../../config/const";
import axios from "axios";

interface ParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameter: ParameterData | null;
  onSuccess: () => void;
}

const ParameterModal: React.FC<ParameterModalProps> = ({
  isOpen,
  onClose,
  parameter,
  onSuccess,
}) => {
  const [status, setStatus] = useState("1");
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && parameter) {
      loadParameterData();
    }
  }, [isOpen, parameter]);

  const loadParameterData = async () => {
    if (!parameter) return;

    try {
      const response = await axios.get(
        `/factory/param/${parameter.factoryParamId}`
      );
      const data = response.data;

      if (parameter.paramType === "date") {
        try {
          const logResponse = await axios.get(
            `/factory/log?query[factoryParamId]=${parameter.factoryParamId}`
          );
          const logData = logResponse.data;
          if (logData[0]?.value) {
            const dateValue = new Date(logData[0].value);
            if (!isNaN(dateValue.getTime())) {
              setStatus(dateValue.toISOString().split("T")[0]);
            }
          }
        } catch (error) {
          setStatus(new Date().toISOString().split("T")[0]);
        }
      } else {
        setStatus(data.status?.toString() || "1");
      }

      setComment(data.izoh || "");
    } catch (error) {
      console.error("Error loading parameter data:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (
        !selectedFiles.some((f) => f.name === file.name && f.size === file.size)
      ) {
        setSelectedFiles((prev) => [...prev, file]);
      }
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameter) return;

    setLoading(true);

    try {
      // Update parameter status if not date
      if (status.length < 2) {
        const response = await axios.put(
          `/factory/param/update/${parameter.factoryParamId}`,
          {
            status: status,
          }
        );

        if (response.status === 200) {
          const data = response.data;
          // Update UI status image
          const img = document.getElementById(
            parameter.factoryParamId.toString()
          );
          if (img) {
            const imgElement = img as HTMLImageElement;
            if (+data.data.status === 0) {
              imgElement.src = "/image/error.png";
            } else if (+data.data.status === 1) {
              imgElement.src = "/image/ok.png";
            } else {
              imgElement.src = `/image/${data.data.status}.png`;
            }
          }
        }
      }

      // Create log entry
      const logFormData = new FormData();
      logFormData.append("factory_id", parameter.factoryId.toString());
      logFormData.append("params_id", parameter.paramId.toString());
      logFormData.append(
        "factory_params_id",
        parameter.factoryParamId.toString()
      );
      logFormData.append("value", status);
      logFormData.append("izoh", comment || "");
      logFormData.append("date_update", new Date().toISOString());

      // Add files
      selectedFiles.forEach((file) => {
        logFormData.append("files", file);
      });

      const logResponse = await axios.post(
        `${API_URL}/factory/log`,
        logFormData
      );

      if (logResponse.status === 201) {
        const logData = logResponse.data;

        // Update UI
        const paramComment = document.querySelector(
          `[data-param-id="${parameter.factoryParamId}"]`
        );
        const paramDate = document.querySelector(
          `#factory-param-date-${parameter.factoryParamId}`
        );

        if (status.length > 2) {
          if (paramDate) {
            (paramDate as HTMLElement).textContent = status;
            paramDate.classList.remove("d-none");
            (paramDate as HTMLElement).style.display = "inline";
          }
        } else {
          if (paramDate) {
            (paramDate as HTMLElement).textContent = "";
            paramDate.classList.add("d-none");
            (paramDate as HTMLElement).style.display = "none";
          }
        }

        if (paramComment && logData.data?.izoh) {
          paramComment.classList.add("flex");
          paramComment.classList.remove("hidden");
          (
            paramComment as HTMLElement
          ).textContent = `Изох: ${logData.data.izoh}`;
        } else if (paramComment && !logData.data?.izoh) {
          paramComment.classList.add("hidden");
          paramComment.classList.remove("flex");
        }

        onClose();
        onSuccess();
        showToast("Параметр статуси муваффақиятли янгиланди", "success");
      }
    } catch (error) {
      console.error("Error updating parameter:", error);
      showToast("Хатолик юз берди. Илтимос, қайтадан уриниб кўринг.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !parameter) return null;

  return (
    <div className="modal show bg-black/60 transition-all duration-300 ease-in-out opacity-100 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex">
      <div className="relative p-4 w-1/2 max-sm:w-full max-w-2xl max-h-full transform transition-all duration-300 ease-out scale-100 translate-y-0">
        <div className="relative rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <h3 className="text-xl font-medium text-gray-900">
              Параметр статусини янгилаш: {parameter.paramName}
            </h3>
            <button
              type="button"
              className="ml-auto inline-flex items-center text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-4">
            <div className="space-y-5 pb-5">
              <div>
                <label
                  htmlFor="param-status"
                  className="mb-2 block text-base font-normal text-gray-900"
                >
                  Статус
                </label>
                {parameter.paramType === "date" ? (
                  <input
                    type="date"
                    id="param-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white p-2.5 text-base text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    id="param-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white p-2.5 text-base text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="1">Мавжуд</option>
                    <option value="0">Мавжуд эмас</option>
                  </select>
                )}
              </div>

              <div>
                <label
                  htmlFor="param-comment"
                  className="mb-2 block text-base font-normal text-gray-900"
                >
                  Изоҳ
                </label>
                <textarea
                  id="param-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white p-2.5 text-base text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Изоҳ киритинг..."
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="param-files"
                  className="inline-block bg-blue-50 text-blue-700 font-semibold py-2 px-4 rounded-md cursor-pointer hover:bg-blue-100"
                >
                  Choose Files
                </label>
                <input
                  type="file"
                  id="param-files"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-slate-100 rounded px-2 py-1 text-sm text-gray-700 mr-2 mb-1"
                    >
                      {file.name}
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700 font-bold"
                        onClick={() => removeFile(index)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Бекор қилиш
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md px-6 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                style={{ backgroundColor: "#00a0c6" }}
              >
                {loading ? "⏳ Сақланмоқда..." : "Сақлаш"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParameterModal;
