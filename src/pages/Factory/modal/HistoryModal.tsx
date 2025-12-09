import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import axios from "axios";

interface HistoryFile {
  id: number;
  izoh: string;
  date_update: string;
  files: string[];
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryParamId: number | null;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  factoryParamId,
}) => {
  const { t } = useTranslation();
  const [historyData, setHistoryData] = useState<HistoryFile[]>([]);

  const fetchHistory = React.useCallback(async () => {
    if (!factoryParamId) return;
    if (!factoryParamId) return;

    try {
      const response = await axios.get(
        `/factory/log-history?query[factoryParamId]=${factoryParamId}`
      );
      setHistoryData(response.data || []);
    } catch (error) {
      console.error("Error fetching parameter history:", error);
    }
  }, [factoryParamId]);

  useEffect(() => {
    if (isOpen && factoryParamId) {
      fetchHistory();
    }
  }, [isOpen, factoryParamId, fetchHistory]);

  if (!isOpen || !factoryParamId) return null;

  return (
    <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50">
      <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-16 dark:bg-darkmode-600 sm:w-[600px]">
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">
              {t("modal.parameter_history")}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col max-h-[65vh] overflow-y-auto text-start">
            {historyData.length > 0 ? (
              historyData.map((item) => (
                <div key={item.id} className="my-2">
                  <p className="text-xs text-gray-500">
                    {new Date(item.date_update).toLocaleString()}
                  </p>
                  <h2 className="ms-3 text-sm font-medium">
                    Изох: {item.izoh}
                  </h2>

                  {item.files?.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-sm font-medium">Файллар:</h3>
                      <ul className="list-disc pl-5">
                        {item.files.map((file, idx) => (
                          <li key={idx}>
                            <a
                              href={`/uploads/factory-param-files/${file}`}
                              download={file}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {file}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <hr className="mt-2" />
                </div>
              ))
            ) : (
              <h1 className="ms-3 text-xl text-center font-medium text-gray-500 py-4">
                {t("modal.history_empty")}
              </h1>
            )}
          </div>

          <div className="border-t py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer border-secondary text-gray-500 hover:bg-gray-100 dark:border-darkmode-100/40"
            >
              {t("ui.close", { defaultValue: t("modal.close") })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
