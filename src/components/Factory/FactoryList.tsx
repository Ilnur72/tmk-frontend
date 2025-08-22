import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FactoryData {
  id: string;
  name: string;
  enterprise_name: string;
  project_goal: string;
  region: string;
  work_persent: number;
  importance: 'HIGH' | 'AVERAGE' | 'LOW';
  status: 'REGISTRATION' | 'CONSTRUCTION' | 'STARTED';
  latitude: number;
  longitude: number;
  marker_icon: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface FactoryListProps {
  factories: FactoryData[];
  onEdit: (factory: FactoryData) => void;
  onDelete: (factoryId: string) => void;
}

const FactoryList: React.FC<FactoryListProps> = ({ factories, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTRATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONSTRUCTION':
        return 'bg-blue-100 text-blue-800';
      case 'STARTED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REGISTRATION':
        return 'Расмийлаштириш';
      case 'CONSTRUCTION':
        return 'Қурилиш';
      case 'STARTED':
        return 'Ишга тушган';
      default:
        return status;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'AVERAGE':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'HIGH':
        return 'Юкори';
      case 'AVERAGE':
        return 'Ўртача';
      case 'LOW':
        return 'Паст';
      default:
        return importance;
    }
  };

  if (factories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Ҳеч қандай лойиҳа топилмади</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {factories.map((factory) => (
        <div key={factory.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Factory Image */}
          <div className="h-48 bg-gray-200 relative">
            {factory.images && factory.images.length > 0 ? (
              <img
                src={`/mnt/tmkupload/factory-images/${factory.images[0]}`}
                alt={factory.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/image/factory.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img src="/image/factory.png" alt="Factory" className="h-16 w-16 opacity-50" />
              </div>
            )}
            
            {/* Image Count Badge */}
            {factory.images && factory.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                +{factory.images.length - 1}
              </div>
            )}
          </div>

          {/* Factory Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {factory.name}
              </h3>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => onEdit(factory)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Таҳрирлаш"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(factory.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Ўчириш"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">{factory.enterprise_name}</p>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{factory.project_goal}</p>

            {/* Status and Importance */}
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(factory.status)}`}>
                {getStatusText(factory.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanceColor(factory.importance)}`}>
                {getImportanceText(factory.importance)}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Жараён</span>
                <span>{factory.work_persent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${factory.work_persent}%` }}
                ></div>
              </div>
            </div>

            {/* Region */}
            <div className="text-sm text-gray-500">
              📍 {factory.region}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FactoryList;
