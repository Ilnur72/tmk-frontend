import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryParamId: number | null;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, factoryParamId }) => {
  const [historyContent, setHistoryContent] = useState('');

  useEffect(() => {
    if (isOpen && factoryParamId) {
      fetchHistory();
    }
  }, [isOpen, factoryParamId]);

  const fetchHistory = async () => {
    if (!factoryParamId) return;

    try {
      const response = await fetch(`/factory/log-history?query[factoryParamId]=${factoryParamId}`);
      const data = await response.text();
      setHistoryContent(data);
    } catch (error) {
      console.error('Error fetching parameter history:', error);
    }
  };

  if (!isOpen || !factoryParamId) return null;

  return (
    <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50">
      <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-16 dark:bg-darkmode-600 sm:w-[460px]">
        <div className="p-5 text-center">
          <div className="flex justify-between items-center mb-4">
            <h3 className="mt-5 text-3xl">Параметр тарихи:</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2 text-slate-500" dangerouslySetInnerHTML={{ __html: historyContent }} />
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;