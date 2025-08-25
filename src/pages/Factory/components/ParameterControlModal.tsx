import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ParameterControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryId: number | null;
  onSuccess: () => void;
}

const ParameterControlModal: React.FC<ParameterControlModalProps> = ({ isOpen, onClose, factoryId, onSuccess }) => {
  const [controlContent, setControlContent] = useState('');

  useEffect(() => {
    if (isOpen && factoryId) {
      fetchControlContent();
    }
  }, [isOpen, factoryId]);

  const fetchControlContent = async () => {
    if (!factoryId) return;

    try {
      const response = await fetch(`/factory/param-control/${factoryId}`);
      const data = await response.text();
      setControlContent(data);
    } catch (error) {
      console.error('Error fetching parameter control content:', error);
    }
  };

  const handleSave = async () => {
    if (!factoryId) return;

    const switches = document.querySelectorAll('#parameter-control-modal-form input[type="checkbox"]');
    const activeParams: Array<{id: number, visible: boolean}> = [];

    switches.forEach((checkbox) => {
      const element = checkbox as HTMLInputElement;
      const paramId = element.dataset.paramId;
      const isChecked = element.checked;

      if (paramId) {
        activeParams.push({
          id: parseInt(paramId),
          visible: isChecked
        });
      }
    });

    try {
      const response = await fetch(`/factory/param-control/${factoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ params: activeParams })
      });

      if (response.ok) {
        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating parameter control:', error);
    }
  };

  if (!isOpen || !factoryId) return null;

  return (
    <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50">
      <div className="w-[90%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-16 dark:bg-darkmode-600 sm:w-[460px]">
        <div className="p-5 text-center">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl">Лойиҳа Параметрларини Бошкариш</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-2 text-slate-500" dangerouslySetInnerHTML={{ __html: controlContent }} />
          <div className="mt-4">
            <button
              onClick={handleSave}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
              style={{ backgroundColor: '#00a0c6' }}
            >
              Сақлаш
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterControlModal;