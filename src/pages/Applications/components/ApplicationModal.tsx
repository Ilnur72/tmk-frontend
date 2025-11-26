import React, { useState, useRef } from "react";
import {
  X,
  Save,
  MapPin,
  Phone,
  Mail,
  Building,
  Image,
  Upload,
} from "lucide-react";
import {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "../../../types/application";
import {
  uploadImage,
  uploadMultipleImages,
} from "../../../services/applicationsService";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    applicationData: CreateApplicationDto | UpdateApplicationDto
  ) => void;
  application?: Application | null;
  mode: "create" | "edit" | "view";
  isLoading?: boolean;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  application,
  mode,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateApplicationDto>({
    title: application?.title || "",
    description: application?.description || "",
    location: application?.location || "",
    phoneNumber: application?.phoneNumber || "",
    contactEmail: application?.contactEmail || "",
    region: application?.region || "",
    tagline: application?.tagline || "",
    coverImage: application?.coverImage || "",
    coordinates: application?.coordinates || { lat: 0, lng: 0 },
    galleryImages: application?.galleryImages || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);
  const coverImageRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);

  const regions = [
    "Тошкент шаҳри",
    "Тошкент вилояти",
    "Андижон вилояти",
    "Бухоро вилояти",
    "Фарғона вилояти",
    "Жиззах вилояти",
    "Хоразм вилояти",
    "Наманган вилояти",
    "Навоий вилояти",
    "Қашқадарё вилояти",
    "Қорақалпоғистон Республикаси",
    "Самарқанд вилояти",
    "Сирдарё вилояти",
    "Сурхондарё вилояти",
  ];

  React.useEffect(() => {
    if (application && mode !== "create") {
      setFormData({
        title: application.title || "",
        description: application.description || "",
        location: application.location || "",
        phoneNumber: application.phoneNumber || "",
        contactEmail: application.contactEmail || "",
        region: application.region || "",
        tagline: application.tagline || "",
        coverImage: application.coverImage || "",
        coordinates: application.coordinates || { lat: 0, lng: 0 },
        galleryImages: application.galleryImages || [],
      });
    } else if (mode === "create") {
      setFormData({
        title: "",
        description: "",
        location: "",
        phoneNumber: "",
        contactEmail: "",
        region: "",
        tagline: "",
        coverImage: "",
        coordinates: { lat: 0, lng: 0 },
        galleryImages: [],
      });
    }
    setErrors({});
  }, [application, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Ариза сарлавҳаси киритиш шарт";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Ариза тафсилоти киритиш шарт";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Жой киритиш шарт";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Телефон рақами киритиш шарт";
    } else if (!/^[+]?[0-9\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Телефон рақами нотўғри форматда";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Электрон почта киритиш шарт";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Электрон почта нотўғри форматда";
    }

    if (!formData.region.trim()) {
      newErrors.region = "Вилоят танлаш шарт";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === "edit" && application) {
      onSave(formData as UpdateApplicationDto);
    } else {
      onSave(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "coordinates.lat" || name === "coordinates.lng") {
      const coordType = name.split(".")[1] as "lat" | "lng";
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          ...prev.coordinates!,
          [coordType]: parseFloat(value) || 0,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, coverImage: imageUrl }));
    } catch (error) {
      console.error("Cover image upload error:", error);
    }
    setImageUploading(false);
  };

  const handleGalleryImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageUploading(true);
    try {
      const imageUrls = await uploadMultipleImages(files);
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...imageUrls],
      }));
    } catch (error) {
      console.error("Gallery images upload error:", error);
    }
    setImageUploading(false);
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index) || [],
    }));
  };

  if (!isOpen) return null;

  const modalTitle =
    mode === "create"
      ? "Янги ариза яратиш"
      : mode === "edit"
      ? "Аризани таҳрирлаш"
      : "Ариза маълумотлари";

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {modalTitle}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ариза сарлавҳаси *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="Лойиҳа номи"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тафсилот *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="Лойиҳа ҳақида батафсил маълумот..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Жойлашув *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i ${
                      errors.location ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="Аниқ манзил"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Вилоят *
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i ${
                      errors.region ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-50" : ""}`}
                  >
                    <option value="">Вилоятни танланг</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="mt-1 text-sm text-red-600">{errors.region}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Телефон рақами *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i ${
                      errors.phoneNumber ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="+998 90 123 45 67"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Электрон почта *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i ${
                      errors.contactEmail ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-50" : ""}`}
                    placeholder="example@email.com"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                {/* Tagline */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Қисқа изоҳ
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i border-gray-300 ${
                      isReadOnly ? "bg-gray-50" : ""
                    }`}
                    placeholder="Лойиҳа ҳақида қисқача"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Кенглик (Latitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="coordinates.lat"
                    value={formData.coordinates?.lat || ""}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i border-gray-300 ${
                      isReadOnly ? "bg-gray-50" : ""
                    }`}
                    placeholder="41.2995"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Узунлик (Longitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="coordinates.lng"
                    value={formData.coordinates?.lng || ""}
                    onChange={handleInputChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-i border-gray-300 ${
                      isReadOnly ? "bg-gray-50" : ""
                    }`}
                    placeholder="69.2401"
                  />
                </div>

                {/* Cover Image */}
                {!isReadOnly && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Image className="inline h-4 w-4 mr-1" />
                      Асосий расм
                    </label>
                    <div className="flex items-center space-x-4">
                      {formData.coverImage && (
                        <img
                          src={formData.coverImage}
                          alt="Cover"
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => coverImageRef.current?.click()}
                        disabled={imageUploading}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {imageUploading ? "Юкланмоқда..." : "Расм юклаш"}
                      </button>
                      <input
                        ref={coverImageRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {!isReadOnly && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Галерея расмлари
                    </label>
                    <div className="space-y-4">
                      {formData.galleryImages &&
                        formData.galleryImages.length > 0 && (
                          <div className="grid grid-cols-4 gap-4">
                            {formData.galleryImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Gallery ${index + 1}`}
                                  className="h-20 w-20 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      <button
                        type="button"
                        onClick={() => galleryImagesRef.current?.click()}
                        disabled={imageUploading}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {imageUploading ? "Юкланмоқда..." : "Расмлар қўшиш"}
                      </button>
                      <input
                        ref={galleryImagesRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Status display for view/edit modes */}
                {mode !== "create" && application && (
                  <div className="sm:col-span-2 border-t pt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Статус
                        </label>
                        <div className="mt-1">
                          {application.status === "approved" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Тасдиқланган
                            </span>
                          )}
                          {application.status === "pending" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Кутилмоқда
                            </span>
                          )}
                          {application.status === "in-review" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Кўриб чиқилмоқда
                            </span>
                          )}
                          {application.status === "rejected" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Рад этилган
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Яратилган сана
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(application.createdAt).toLocaleDateString(
                            "uz-UZ",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          {mode !== "view" && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || imageUploading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-i sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сақланмоқда...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === "create" ? "Яратиш" : "Сақлаш"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-i sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Ёпиш
              </button>
            </div>
          )}

          {mode === "view" && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-i sm:w-auto sm:text-sm"
              >
                Ёпиш
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
