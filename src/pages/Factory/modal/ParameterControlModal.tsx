import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

interface ParamItem {
  id: number;
  visible: boolean;
  param: {
    name: string;
  };
}

interface ParameterControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryId: number | null;
  onSuccess: () => void;
}

const ParameterControlModal: React.FC<ParameterControlModalProps> = ({
  isOpen,
  onClose,
  factoryId,
  onSuccess,
}) => {
  const [params, setParams] = useState<ParamItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && factoryId) {
      fetchParams();
    }
  }, [isOpen, factoryId]);

  const fetchParams = async () => {
    if (!factoryId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/factory/param-control/${factoryId}`);
      setParams(response.data); // serverdan array qaytadi
    } catch (error) {
      console.error("Error fetching parameter control:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleParam = (id: number) => {
    setParams((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p
      )
    );
  };

  const handleSave = async () => {
    if (!factoryId) return;

    try {
      const response = await axios.put(`/factory/param-control/${factoryId}`, {
        params: params.map((p) => ({ id: p.id, visible: p.visible })),
      });

      if (response.status === 200) {
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating parameter control:", error);
    }
  };

  if (!isOpen || !factoryId) return null;

  return (
    <div className="modal show bg-black/60 fixed inset-0 z-50 flex items-center justify-center">
      <div className="w-[90%] sm:w-[460px] bg-white rounded-lg shadow-lg">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold">Лойиҳа Параметрларини Бошқариш</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form id="parameter-control-modal-form" className="flex flex-col max-h-[65vh] overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500">Юкланмоқда...</p>
          ) : (
            params.map((item) => (
              <label
                key={item.id}
                className="inline-flex my-2 items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={() => toggleParam(item.id)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-200 rounded-full peer-focus:outline-none dark:bg-gray-700 
                                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                                after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 
                                after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                <span className="ms-3 text-sm font-medium">{item.param.name}</span>
              </label>
            ))
          )}
        </form>

        <div className="border-t py-4 flex justify-end space-x-3 px-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-100"
          >
            Ёпиш
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#00a0c6] text-white px-6 py-2.5 rounded-md hover:bg-[#008fb0]"
          >
            Сақлаш
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParameterControlModal;
