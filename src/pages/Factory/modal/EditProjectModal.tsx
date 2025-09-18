import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Minus } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../../config/const";
import MapComponent from "../components/MapComponent";
import { toast } from "react-toastify";
import ImageGallery from "./ImageGallery";
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
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { key: "", value: "" },
  ]);
  const [projectValues, setProjectValues] = useState<ProjectValue[]>([
    { key: "", amount: "" },
  ]);
  const [projectValueTotal, setProjectValueTotal] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: 41.2995,
    lng: 69.2401,
  });
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [markerIcon, setMarkerIcon] = useState("factory");
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && factoryId) {
      fetchProjectData();
    }
  }, [isOpen, factoryId]);

  const fetchProjectData = async () => {
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
      setCoordinates({
        lat: data.latitude || 41.2995,
        lng: data.longitude || 69.2401,
      });
      setMarkerIcon(data.marker_icon || "factory");
      const images =
        typeof data.images === "string" ? JSON.parse(data.images) : data.images;
      // Set existing images
      if (data.images) {
        setExistingImages(images);

        setPreviewImages(
          images.map(
            (image: string) =>
              `${API_URL}/mnt/tmkupload/factory-images/${image}`
          )
        );
      }

      // Set custom fields
      if (data.custom_fields) {
        const fields = Object.entries(data.custom_fields).map(
          ([key, value]) => ({
            key,
            value: value as string,
          })
        );
        setCustomFields(fields.length > 0 ? fields : [{ key: "", value: "" }]);
      }

      // Set project values
      if (data.project_values) {
        const totalValue = data.project_values["Лойиҳанинг қиймати"] || "";
        setProjectValueTotal(totalValue);

        if (data.project_values.child) {
          const values = Object.entries(data.project_values.child).map(
            ([key, amount]) => ({
              key,
              amount: amount as string,
            })
          );
          setProjectValues(
            values.length > 0 ? values : [{ key: "", amount: "" }]
          );
        }
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedImages((prev) => {
      const newSelectedImages = [...prev, ...files];

      // Update preview images
      const newPreviewImages = [
        ...existingImages.map(
          (image) => `${API_URL}/mnt/tmkupload/factory-images/${image}`
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
          (image) => `${API_URL}/mnt/tmkupload/factory-images/${image}`
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
          (image) => `${API_URL}/mnt/tmkupload/factory-images/${image}`
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
    value: string
  ) => {
    setCustomFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
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
    value: string
  ) => {
    setProjectValues((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
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
      formData.append("marker_icon", markerIcon);
      if (deletedImages.length > 0) {
        formData.append("deleted_images", JSON.stringify(deletedImages));
      }
      // Add new images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      // Add existing images that weren't removed
      formData.append("existing_images", JSON.stringify(existingImages));

      // Add custom fields
      const validCustomFields = customFields.filter(
        (field) => field.key.trim() && field.value.trim()
      );
      if (validCustomFields.length > 0) {
        const customFieldsObj = validCustomFields.reduce((acc, field) => {
          acc[field.key] = field.value;
          return acc;
        }, {} as Record<string, string>);
        formData.append("custom_fields", JSON.stringify(customFieldsObj));
      }

      // Add project values
      const validProjectValues = projectValues.filter(
        (value) => value.key.trim() && value.amount.trim()
      );
      const projectValuesObj: Record<string, any> = {};

      if (projectValueTotal.trim()) {
        projectValuesObj["Лойиҳанинг қиймати"] = projectValueTotal;
        if (validProjectValues.length > 0) {
          const childValues = validProjectValues.reduce((acc, value) => {
            acc[value.key] = value.amount;
            return acc;
          }, {} as Record<string, string>);
          projectValuesObj["child"] = childValues;
        }
      }

      if (Object.keys(projectValuesObj).length > 0) {
        formData.append("project_values", JSON.stringify(projectValuesObj));
      }

      const response = await axios.put(
        `${API_URL}/factory/update/${factoryId}`,
        formData
      );

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      onClose();
      onSuccess();
      toast("Лойиҳа муваффақиятли янгиланди!", { type: "success" });
    } catch (error) {
      console.error("Error updating project:", error);
      toast("Лойиҳани янгилашда хато юз берди!", { type: "error" });
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
            <div className="text-xl">⏳ Маълумотлар юкланмоқда...</div>
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
              Маълумотларни юклашда хато юз берди
            </div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Ёпиш
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
                Лойиҳа маълумотларини ўзгартириш
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
                      placeholder="Лойиҳа номи*"
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
                      placeholder="Корхона номи*"
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
                      placeholder="Лойиҳа мақсади*"
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
                      placeholder="Регион *"
                      name="region"
                      defaultValue={projectData.region}
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Work Percentage */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Лойиҳа жараёни, %
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Лойиҳа жараёни фоизда"
                      defaultValue={projectData.work_persent}
                      name="work_persent"
                      className="w-full text-sm border border-slate-200 shadow-sm rounded-md p-2.5 placeholder:text-slate-400/90 focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Лойиҳа статуси
                    </label>
                    <select
                      required
                      name="status"
                      defaultValue={projectData.status}
                      className="w-full border border-slate-200 bg-white p-2.5 text-sm rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="REGISTRATION">
                        Расмийлаштириш жараёнида
                      </option>
                      <option value="CONSTRUCTION">Қурилиш жараёнида</option>
                      <option value="STARTED">Ишга тушган</option>
                    </select>
                  </div>

                  {/* Marker Type */}
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold">
                      Маркер турини танланг:
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
                        {
                          value: "tmk-marker",
                          src: "/image/tmk-marker.png",
                          alt: "Tmk",
                        },
                      ].map((marker) => (
                        <label
                          key={marker.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="marker_icon"
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
                        📷 Лойиҳа расмлари
                        <br />
                        <small className="text-gray-500">
                          JPG, PNG форматлари, макс 5MB
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
                          Расмлар:
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
                      Қўшимча майдонлар
                    </label>
                    {customFields.map((field, index) => (
                      <div key={index} className="flex flex-wrap gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Майдон номи (масалан: Иш ўрни)"
                          value={field.key}
                          onChange={(e) =>
                            updateCustomField(index, "key", e.target.value)
                          }
                          className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Қиймати (масалан: 220та)"
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
                      Янги майдон қўшиш
                    </button>
                  </div>
                </div>

                {/* Right Column */}
                <div className="w-full md:w-1/2">
                  {/* Map */}
                  <div className="mb-4">
                    <label className="block mb-2 font-medium">
                      🗺️ Лойиҳа жойлашуви{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Кўрсатма:</strong> Харитада керакли жойни босинг
                      ёки маркерни судраб кўчиринг
                    </div>
                    <MapComponent
                      containerId="create-project-map"
                      type="create"
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
                        placeholder="Кенглик"
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
                        placeholder="Узунлик"
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
                        Кидириш
                      </button>
                    </div>
                  </div>

                  {/* Project Values */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Лойиҳанинг қиймати
                    </label>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Умумий қиймати (масалан: 150 млн доллар)"
                        value={projectValueTotal}
                        onChange={(e) => setProjectValueTotal(e.target.value)}
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <label className="block text-sm font-medium mb-2">
                      Лойиҳа қийматларининг бўлимлари
                    </label>
                    {projectValues.map((value, index) => (
                      <div key={index} className="flex flex-wrap gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Бўлим номи (масалан: ФРРУ)"
                          value={value.key}
                          onChange={(e) =>
                            updateProjectValue(index, "key", e.target.value)
                          }
                          className="flex-1 p-2 border rounded text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Миқдори (масалан: 16,5 млн долл)"
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
                      Янги бўлим қўшиш
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
                  Ёпиш
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "⏳ Янгиланмоқда..." : "Янгилаш"}
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
