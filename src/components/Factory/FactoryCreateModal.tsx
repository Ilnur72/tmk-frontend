import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
}

interface FactoryModalProps {
  factory: FactoryData | null;
  onSave: (factory: any) => void;
  onClose: () => void;
}

const FactoryCreateModal: React.FC<FactoryModalProps> = ({ factory, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    enterprise_name: '',
    project_goal: '',
    region: '',
    work_persent: 0,
    importance: 'AVERAGE' as 'HIGH' | 'AVERAGE' | 'LOW',
    status: 'REGISTRATION' as 'REGISTRATION' | 'CONSTRUCTION' | 'STARTED',
    latitude: 0,
    longitude: 0,
    marker_icon: 'factory',
    images: [] as File[]
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (factory) {
      setFormData({
        name: factory.name || '',
        enterprise_name: factory.enterprise_name || '',
        project_goal: factory.project_goal || '',
        region: factory.region || '',
        work_persent: factory.work_persent || 0,
        importance: factory.importance || 'AVERAGE',
        status: factory.status || 'REGISTRATION',
        latitude: factory.latitude || 0,
        longitude: factory.longitude || 0,
        marker_icon: factory.marker_icon || 'factory',
        images: []
      });
      setExistingImages(factory.images || []);
    }
  }, [factory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      work_persent: Number(formData.work_persent),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude)
    };

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {factory ? 'Лойиҳани таҳрирлаш' : 'Янги лойиҳа яратиш'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Лойиҳа номи</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Корхона номи</label>
                    <input
                      type="text"
                      name="enterprise_name"
                      value={formData.enterprise_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Лойиҳа мақсади</label>
                    <textarea
                      name="project_goal"
                      value={formData.project_goal}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Регион</label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Лойиҳа жараёни (%)</label>
                    <input
                      type="number"
                      name="work_persent"
                      value={formData.work_persent}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Лойиҳа ахамияти</label>
                    <select
                      name="importance"
                      value={formData.importance}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="HIGH">● Юкори</option>
                      <option value="AVERAGE">● Ўртача</option>
                      <option value="LOW">● Паст</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Лойиҳа статуси</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="REGISTRATION">Расмийлаштириш жараёнида</option>
                      <option value="CONSTRUCTION">Қурилиш жараёнида</option>
                      <option value="STARTED">Ишга тушган</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Маркер турини танланг</label>
                    <div className="flex justify-center gap-4">
                      {[
                        { value: 'factory', src: '/image/factory.png', alt: 'Завод' },
                        { value: 'mine', src: '/image/mine.png', alt: 'Кон' },
                        { value: 'mine-cart', src: '/image/mine-cart.png', alt: 'Кон машинаси' },
                        { value: 'tmk-marker', src: '/image/tmk-marker.png', alt: 'ТМК' }
                      ].map((marker) => (
                        <label key={marker.value} className="flex flex-col items-center cursor-pointer">
                          <input
                            type="radio"
                            name="marker_icon"
                            value={marker.value}
                            checked={formData.marker_icon === marker.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <img
                            src={marker.src}
                            alt={marker.alt}
                            className={`w-10 h-10 rounded border-2 ${
                              formData.marker_icon === marker.value ? 'border-blue-500' : 'border-gray-300'
                            }`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Кенглик</label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        step="any"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Узунлик</label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        step="any"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Лойиҳа расмлари</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-gray-600">
                          📷 Расмларни танланг ёки бу ерга судранг
                          <br />
                          <small className="text-gray-500">JPG, PNG форматлари, макс 5MB</small>
                        </div>
                      </label>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Мавжуд расмлар</h4>
                        <div className="flex flex-wrap gap-2">
                          {existingImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`/mnt/tmkupload/factory-images/${image}`}
                                alt="Existing"
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Images */}
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Янги расмлар</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt="New"
                                className="w-20 h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Сақлаш
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Ёпиш
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FactoryCreateModal;
