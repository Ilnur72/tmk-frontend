import React from 'react';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;

  return (
    <div 
      className={`
        fixed top-5 right-5 z-50 px-6 py-4 rounded-md shadow-lg transform transition-transform duration-300
        ${show ? 'translate-x-0' : 'translate-x-full'}
        ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
      `}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
