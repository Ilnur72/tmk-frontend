import React, { useState, useEffect } from "react";
import { X, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/const ";

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
  const [controlContent, setControlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && factoryId) {
      fetchControlContent();
    }
    if (!isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, factoryId]);

  const fetchControlContent = async () => {
    if (!factoryId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios(`${API_URL}/factory/param-control/${factoryId}`);
      if (!response.data) {
        throw new Error('Failed to fetch parameter control content');
      }
      const data = response.data;
      setControlContent(data);
    } catch (error) {
      console.error("Error fetching parameter control content:", error);
      setError("Параметрларни юклашда хатолик юз берди");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!factoryId) return;

    setSaving(true);
    setError(null);

    const switches = document.querySelectorAll(
      '#parameter-control-modal-form input[type="checkbox"]'
    );
    const activeParams: Array<{ id: number; visible: boolean }> = [];

    switches.forEach((checkbox) => {
      const element = checkbox as HTMLInputElement;
      const paramId = element.dataset.paramId;
      const isChecked = element.checked;

      if (paramId) {
        activeParams.push({
          id: parseInt(paramId),
          visible: isChecked,
        });
      }
    });

    try {
      const response = await axios.put(`${API_URL}/factory/param-control/${factoryId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          params: activeParams,
        },
      });

      if (!response.data) {
        throw new Error('Failed to update parameter control');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error updating parameter control:", error);
      setError("Параметрларни сақлашда хатолик юз берди");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !factoryId) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">Параметрларни Бошкариш</h3>
              <p className="text-blue-100 text-sm">Лойиҳа параметрларини созланг</p>
            </div>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
              onClick={onClose}
              disabled={saving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Параметрлар юкланмоқда...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium mb-2">Хатолик юз берди</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchControlContent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                >
                  Қайта уриниб кўринг
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium mb-2">Муваффақиятли сақланди!</p>
                <p className="text-gray-600 text-sm">Параметрлар янгиланди</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div
                  id="parameter-control-modal-form"
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: controlContent }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Бекор қилиш
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                      Сақланмоқда...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 inline" />
                      Сақлаш
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {saving && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Сақланмоқда...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterControlModal;