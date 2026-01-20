import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Minus } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/const";
import MapComponent from "../components/MapComponent";
import { toast } from "react-toastify";
import ImageViewer from "react-simple-image-viewer";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryId: number | null;
  onSuccess: () => void;
}

interface CustomField {
  key: string;
  value: string;
}

interface ProjectValue {
  key: string;
  amount: string;
}

interface ObjectType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

interface ProjectData {
  name: string;
  enterprise_name: string;
  project_goal: string;
  region: string;
  work_persent: number;
  status: string;
  latitude: number;
  longitude: number;
  marker_icon: string;
  custom_fields?: Record<string, string>;
  project_values?: Record<string, any>;
  images?: string[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  factoryId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { key: "", value: "" },
  ]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [markerIcon, setMarkerIcon] = useState("factory");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 41.2995,
    lng: 69.2401,
  });
  const [projectValues, setProjectValues] = useState<ProjectValue[]>([
    { key: "", amount: "" },
  ]);
  const [projectValueTotal, setProjectValueTotal] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [selectedObjectType, setSelectedObjectType] = useState<string>("");
  const [showAddObjectType, setShowAddObjectType] = useState(false);
  const [newObjectType, setNewObjectType] = useState("");
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const fetchObjectTypes = React.useCallback(async () => {
    try {
      const response = await axios.get("/factory/object-types");
      if (response.data && Array.isArray(response.data)) {
        setObjectTypes(response.data);
      }
    } catch (error) {
      console.error("Object types fetch error:", error);
    }
  }, []);

  const handleAddObjectType = async () => {
    if (!newObjectType.trim()) return;

    try {
      await axios.post("/factory/add-object-type", { name: newObjectType });
      await fetchObjectTypes();
      setSelectedObjectType(newObjectType);
      setNewObjectType("");
      setShowAddObjectType(false);
      toast("Yangi obyekt tipi qo'shildi!", { type: "success" });
    } catch (error) {
      console.error("Add object type error:", error);
      toast("Obyekt tipi qo'shishda xato!", { type: "error" });
    }
  };

  const fetchProjectData = React.useCallback(async () => {
    if (!factoryId) return;

    setFetchingData(true);
    try {
      const response = await axios.get(`/factory/${factoryId}`);
      if (response.status !== 200) {
        throw new Error("Failed to fetch project data");
      }
      const data = response.data;
      setProjectData(data);

      // Populate form fields
      // Prefer explicit latitude/longitude fields from backend, fallback to coords array/string
      let lat = 41.2995;
      let lng = 69.2401;

      if (data.latitude !== undefined && data.longitude !== undefined) {
        lat = data.latitude;
        lng = data.longitude;
      } else if (data.coords) {
        try {
          const parsed =
            typeof data.coords === "string"
              ? JSON.parse(data.coords.replace(/'/g, '"'))
              : data.coords;
          if (Array.isArray(parsed) && parsed.length >= 2) {
            // stored as [lng, lat] in many places
            lng = Number(parsed[0]) || lng;
            lat = Number(parsed[1]) || lat;
          }
        } catch (err) {
          // ignore and keep defaults
        }
      }

      setCoordinates({ lat, lng });

      // Sanitize marker_icon - remove tuple/array format, quotes, and extension
      let cleanMarkerIcon = (data.marker_icon || "factory").toString();
      // Remove tuple/array format: ("factory","factory") → factory
      cleanMarkerIcon = cleanMarkerIcon.replace(
        /^\(["']?(.+?)["']?,.*\)$/,
        "$1",
      );
      // Remove brackets and parentheses
      cleanMarkerIcon = cleanMarkerIcon.replace(/[\[\]()]/g, "");
      // Remove quotes
      cleanMarkerIcon = cleanMarkerIcon.replace(/['"]/g, "");
      // Remove extension
      cleanMarkerIcon = cleanMarkerIcon.replace(/\.(png|jpg|jpeg|svg)$/i, "");
      // Trim whitespace
      cleanMarkerIcon = cleanMarkerIcon.trim();
      // Fallback to factory if empty
      cleanMarkerIcon = cleanMarkerIcon || "factory";
      setMarkerIcon(cleanMarkerIcon);

      setSelectedObjectType(data.object_type || "");
      const images =
        typeof data.images === "string" ? JSON.parse(data.images) : data.images;
      // Set existing images
      if (data.images) {
        setExistingImages(images);

        setPreviewImages(
          images.map(
            (image: string) =>
              `${API_URL}/mnt/tmkupload/factory-images/${image}`,
          ),
        );
      }

      // Set custom fields
      if (data.custom_fields) {
        const fields = Object.entries(data.custom_fields).map(
          ([key, value]) => ({
            key,
            value: value as string,
          }),
        );
        setCustomFields(fields.length > 0 ? fields : [{ key: "", value: "" }]);
      }

      // Set project values
      if (data.project_values) {
        const totalValue =
          data.project_values[t("modal.project_total_value_key")] || "";
        setProjectValueTotal(totalValue);

        if (data.project_values.child) {
          const values = Object.entries(data.project_values.child).map(
            ([key, amount]) => ({
              key,
              amount: amount as string,
            }),
          );
          setProjectValues(
            values.length > 0 ? values : [{ key: "", amount: "" }],
          );
        }
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setFetchingData(false);
    }
  }, [factoryId, t]);

  useEffect(() => {
    if (isOpen && factoryId) {
      // Reset image-related transient state when opening modal to avoid
      // accumulating previews or selected files across opens.
      setSelectedImages([]);
      setDeletedImages([]);
      setPreviewImages([]);

      fetchProjectData();
      fetchObjectTypes();
    }
  }, [isOpen, factoryId, fetchProjectData, fetchObjectTypes]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedImages((prev) => {
      const newSelectedImages = [...prev, ...files];

      // Update preview images
      const newPreviewImages = [
        ...existingImages.map(
          (image) => `${API_URL}/mnt/tmkupload/factory-images/${image}`,
        ),
        ...newSelectedImages.map((file) => URL.createObjectURL(file)),
      ];
      setPreviewImages(newPreviewImages);

      return newSelectedImages;
    });
  };

  const openImageViewer = (index: number) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  };

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  // Tuzatilgan removeImage funksiyasi
  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newSelectedImages = prev.filter((_, i) => i !== index);

      // Update preview images after removing selected image
      const newPreviewImages = [
        ...existingImages.map(
          (image) => `${API_URL}/mnt/tmkupload/factory-images/${image}`,
        ),
        ...newSelectedImages.map((file) => URL.createObjectURL(file)),
      ];
      setPreviewImages(newPreviewImages);

      return newSelectedImages;
    });
  };

  // Tuzatilgan removeExistingImage funksiyasi
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => {
      const removedImage = prev[index]; // olib tashlangan rasm
      setDeletedImages((del) => [...del, removedImage]); // deletedImages ga qo‘shamiz

      const newExistingImages = prev.filter((_, i) => i !== index);

      // Previewni yangilash
      const newPreviewImages = [
        ...newExistingImages.map(
          (image) => `${API_URL}/mnt/tmkupload/factory-images/${image}`,
        ),
        ...selectedImages.map((file) => URL.createObjectURL(file)),
      ];
      setPreviewImages(newPreviewImages);

      return newExistingImages;
    });
  };

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    if (customFields.length > 1) {
      setCustomFields((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateCustomField = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setCustomFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addProjectValue = () => {
    setProjectValues((prev) => [...prev, { key: "", amount: "" }]);
  };

  const removeProjectValue = (index: number) => {
    if (projectValues.length > 1) {
      setProjectValues((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateProjectValue = (
    index: number,
    field: "key" | "amount",
    value: string,
  ) => {
    setProjectValues((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleLocationSearch = () => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter([coordinates.lng, coordinates.lat]);
      markerRef.current.setLngLat([coordinates.lng, coordinates.lat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;

    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Add factory ID
      formData.append("factory_id", factoryId.toString());

      // Add coordinates
      formData.append("latitude", coordinates.lat.toString());
      formData.append("longitude", coordinates.lng.toString());

      // Sanitize marker_icon before sending - ensure clean value without any formatting
      let cleanMarkerIcon = markerIcon.toString();
      // Remove any tuple/array format
      cleanMarkerIcon = cleanMarkerIcon.replace(
        /^\(["']?(.+?)["']?,.*\)$/,
        "$1",
      );
      // Remove brackets and parentheses
      cleanMarkerIcon = cleanMarkerIcon.replace(/[\[\]()]/g, "");
      // Remove quotes
      cleanMarkerIcon = cleanMarkerIcon.replace(/['"]/g, "");
      // Remove extension if present
      cleanMarkerIcon = cleanMarkerIcon.replace(/\.(png|jpg|jpeg|svg)$/i, "");
      // Trim and fallback
      cleanMarkerIcon = cleanMarkerIcon.trim() || "factory";
      formData.append("marker_icon", cleanMarkerIcon);

      // Add object type
      if (selectedObjectType) {
        formData.append("object_type", selectedObjectType);
      }
      if (deletedImages.length > 0) {
        formData.append("deleted_images", JSON.stringify(deletedImages));
      }
      // Add new images (files)
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      // NOTE: do NOT send `existing_images` here. Backend should treat
      // `images` as files to append and `deleted_images` as items to remove.
      // Sending `existing_images` as well may cause duplication if the
      // server appends rather than replaces the list.

      // Add custom fields
      const validCustomFields = customFields.filter(
        (field) => field.key.trim() && field.value.trim(),
      );
      if (validCustomFields.length > 0) {
        const customFieldsObj = validCustomFields.reduce(
          (acc, field) => {
            acc[field.key] = field.value;
            return acc;
          },
          {} as Record<string, string>,
        );
        formData.append("custom_fields", JSON.stringify(customFieldsObj));
      }

      // Add project values
      const validProjectValues = projectValues.filter(
        (value) => value.key.trim() && value.amount.trim(),
      );
      const projectValuesObj: Record<string, any> = {};

      if (projectValueTotal.trim()) {
        projectValuesObj[t("modal.project_total_value_key")] =
          projectValueTotal;
        if (validProjectValues.length > 0) {
          const childValues = validProjectValues.reduce(
            (acc, value) => {
              acc[value.key] = value.amount;
              return acc;
            },
            {} as Record<string, string>,
          );
          projectValuesObj["child"] = childValues;
        }
      }

      if (Object.keys(projectValuesObj).length > 0) {
        formData.append("project_values", JSON.stringify(projectValuesObj));
      }

      const response = await axios.put(
        `${API_URL}/factory/update/${factoryId}`,
        formData,
      );

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error updating project:", error);
      toast(t("modal.project_update_error"), { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !factoryId) return null;

  if (fetchingData) {
    return (
      <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50 pt-7">
        <div className="w-[70%] max-sm:w-[100%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-2 max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">
            <div className="text-xl">⏳ {t("modal.loading_data")}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50">
        <div className="w-[70%] max-sm:w-[100%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-2 max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">
            <div className="text-xl text-red-500">
              {t("modal.error_loading")}
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {t("ui.close", { defaultValue: t("modal.close") })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MapLibre GL JS Script */}
      <script src="https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.js"></script>
      <link
        href="https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.css"
        rel="stylesheet"
      />

      <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50 pt-7">
        <div className="w-[70%] max-sm:w-[100%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-2 max-h-[90vh] overflow-y-auto">
          <div className="p-2 text-center">
            <div className="flex justify-between items-center p-4">
              <h3 className="text-3xl font-medium">
                {t("modal.edit_project")}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={onClose}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="text-left">
              <div className="px-5 flex flex-col md:flex-row gap-4">
                {/* Left Column */}
                <div className="w-full md:w-1/2 flex flex-col gap-3">
                  {/* Project Name */}
                  <div>
                    <input
                      required
                      type="text"
                      placeholder={`${t("modal.project_name")}*`}
                      name="name"
                      defaultValue={projectData.name}
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Enterprise Name */}
                  <div>
                    <input
                      required
                      type="text"
                      placeholder={`${t("modal.enterprise_name")}*`}
                      name="enterprise_name"
                      defaultValue={projectData.enterprise_name}
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Project Goal */}
                  <div>
                    <input
                      required
                      type="text"
                      placeholder={`${t("modal.project_goal")}*`}
                      name="project_goal"
                      defaultValue={projectData.project_goal}
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Region */}
                  <div>
                    <input
                      required
                      type="text"
                      placeholder={`${t("modal.region")}*`}
                      name="region"
                      defaultValue={projectData.region}
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Work Percentage */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {t("modal.work_progress_percent")}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="100"
                      placeholder={t("modal.work_progress_percent")}
                      defaultValue={projectData.work_persent}
                      name="work_persent"
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {t("modal.project_status")}
                    </label>
                    <select
                      required
                      name="status"
                      defaultValue={projectData.status}
                      className="w-full border border-slate-200 bg-white p-2.5 text-sm rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="REGISTRATION">
                        {t("modal.status_registration")}
                      </option>
                      <option value="CONSTRUCTION">
                        {t("modal.status_construction")}
                      </option>
                      <option value="STARTED">
                        {t("modal.status_started")}
                      </option>
                    </select>
                  </div>

                  {/* Object Type (Importance) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      {t("modal.object_type", "Obyekt tipi")}
                    </label>
                    <select
                      value={selectedObjectType}
                      onChange={(e) => setSelectedObjectType(e.target.value)}
                      className="w-full border border-slate-200 bg-white p-2.5 text-sm rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">
                        {t("modal.select_object_type", "Tanlang")}
                      </option>
                      {objectTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>

                    {/* Yangi obyekt tipi qo'shish */}
                    {!showAddObjectType ? (
                      <button
                        type="button"
                        onClick={() => setShowAddObjectType(true)}
                        className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Yangi tip qo'shish
                      </button>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={newObjectType}
                          onChange={(e) => setNewObjectType(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddObjectType()
                          }
                          placeholder="Yangi tip nomi..."
                          className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddObjectType}
                          className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:opacity-80"
                        >
                          Qo'shish
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddObjectType(false);
                            setNewObjectType("");
                          }}
                          className="px-2 py-1.5 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Marker Type */}
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold">
                      {t("modal.marker_type_select")}:
                    </label>
                    <div className="flex justify-center gap-8">
                      {[
                        {
                          value: "factory",
                          src: "/image/factory.png",
                          alt: "Zavod",
                        },
                        { value: "mine", src: "/image/mine.png", alt: "Kon" },
                        {
                          value: "mine-cart",
                          src: "/image/mine-cart.png",
                          alt: "Shaxta",
                        },
                        // {
                        //   value: "tmk-marker",
                        //   src: "/image/tmk-marker.png",
                        //   alt: "Tmk",
                        // },
                      ].map((marker) => (
                        <label
                          key={marker.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={marker.value}
                            checked={markerIcon === marker.value}
                            onChange={(e) => setMarkerIcon(e.target.value)}
                          />
                          <img
                            src={marker.src}
                            alt={marker.alt}
                            className="w-10 h-10"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() =>
                        document.getElementById("imageInput")?.click()
                      }
                    >
                      <div className="text-gray-600">
                        📷 {t("modal.project_images")}
                        <br />
                        <small className="text-gray-500">
                          {t("modal.jpg_png_max_5mb")}
                        </small>
                      </div>
                      <input
                        type="file"
                        id="imageInput"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Image Preview */}
                    {(selectedImages.length || existingImages.length) > 0 && (
                      <div className="mt-3">
                        <label className="block mb-2 text-sm text-gray-600">
                          {t("modal.project_images")}:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {/* Existing Images */}
                          {existingImages.map((image, index) => (
                            <div key={`existing-${index}`} className="relative">
                              <div
                                className="relative group cursor-pointer"
                                onClick={() => openImageViewer(index)}
                              >
                                <img
                                  src={`${API_URL}/mnt/tmkupload/factory-images/${image}`}
                                  alt={`Existing ${index}`}
                                  className="w-20 h-20 object-cover rounded border"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          {/* New Images */}
                          {selectedImages.map((image, index) => (
                            <div key={`new-${index}`} className="relative">
                              <div
                                className="relative group cursor-pointer"
                                onClick={() =>
                                  openImageViewer(existingImages.length + index)
                                }
                              >
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`New ${index}`}
                                  className="w-20 h-20 object-cover rounded border"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Viewer */}
                  {isViewerOpen && (
                    <ImageViewer
                      src={previewImages}
                      currentIndex={currentImage}
                      onClose={closeImageViewer}
                      backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.9)" }}
                      closeOnClickOutside={true}
                    />
                  )}

                  {/* Custom Fields */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      {t("modal.custom_fields")}
                    </label>
                    {customFields.map((field, index) => (
                      <div key={index} className="flex flex-wrap gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={t("modal.field_name_example")}
                          value={field.key}
                          onChange={(e) =>
                            updateCustomField(index, "key", e.target.value)
                          }
                          className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder={t("modal.value_example")}
                          value={field.value}
                          onChange={(e) =>
                            updateCustomField(index, "value", e.target.value)
                          }
                          className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="mt-2 bg-primary text-white px-4 py-2 rounded hover:opacity-80 text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t("modal.add_new_field")}
                    </button>
                  </div>
                </div>

                {/* Right Column */}
                <div className="w-full md:w-1/2">
                  {/* Map */}
                  <div className="mb-4">
                    <label className="block mb-2 font-medium">
                      🗺️ {t("modal.project_location")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>{t("modal.map_instruction")}</strong>
                    </div>
                    <MapComponent
                      containerId="edit-project-map"
                      type="edit"
                      latitude={coordinates.lat}
                      longitude={coordinates.lng}
                      onCoordinatesChange={({ lat, lng }) =>
                        setCoordinates({ lat, lng })
                      }
                    />
                    {/* Coordinates */}
                    <div className="pt-3 flex flex-wrap gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder={t("modal.latitude")}
                        value={coordinates.lat.toFixed(6)}
                        onChange={(e) =>
                          setCoordinates((prev) => ({
                            ...prev,
                            lat: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="flex-1 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder={t("modal.longitude")}
                        value={coordinates.lng.toFixed(6)}
                        onChange={(e) =>
                          setCoordinates((prev) => ({
                            ...prev,
                            lng: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="flex-1 p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleLocationSearch}
                        className="bg-primary text-white px-4 py-2 rounded hover:opacity-80 text-sm"
                      >
                        {t("modal.apply_coordinates")}
                      </button>
                    </div>
                  </div>

                  {/* Project Values */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      {t("modal.project_value")}
                    </label>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder={t("modal.total_project_value")}
                        value={projectValueTotal}
                        onChange={(e) => setProjectValueTotal(e.target.value)}
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <label className="block text-sm font-medium mb-2">
                      {t("modal.project_value_sections")}
                    </label>
                    {projectValues.map((value, index) => (
                      <div key={index} className="flex flex-wrap gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={t("modal.section_name_example")}
                          value={value.key}
                          onChange={(e) =>
                            updateProjectValue(index, "key", e.target.value)
                          }
                          className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder={t("modal.amount_example")}
                          value={value.amount}
                          onChange={(e) =>
                            updateProjectValue(index, "amount", e.target.value)
                          }
                          className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeProjectValue(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addProjectValue}
                      className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {t("modal.add_new_section")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-5 text-end mt-6 pb-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-3 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {t("ui.close", { defaultValue: t("modal.close") })}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                    ? `⏳ ${t("ui.loading", {
                        defaultValue: t("modal.saving"),
                      })}`
                    : t("ui.save", { defaultValue: t("modal.save") })}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProjectModal;
