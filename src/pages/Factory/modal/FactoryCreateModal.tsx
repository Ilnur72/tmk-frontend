import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Minus } from "lucide-react";
import { showToast } from "../../../utils/toast";
import axios from "axios";
import MapComponent from "../components/MapComponent";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (status: string) => void;
}

interface CustomField {
  key: string;
  value: string;
}

interface ProjectValue {
  key: string;
  amount: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
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
  const [markerIcon, setMarkerIcon] = useState("factory");
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, [isOpen]);

  const initializeMap = () => {
    if (
      typeof window !== "undefined" &&
      (window as any).maplibregl &&
      mapContainerRef.current
    ) {
      const maplibregl = (window as any).maplibregl;

      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style:
          "https://api.maptiler.com/maps/019644f4-f546-7d75-81ed-49e8e52c20c7/style.json?key=Ql4Zhf4TMUJJKxx8Xht6",
        center: [coordinates.lng, coordinates.lat],
        attributionControl: false,
        zoom: 10,
      });

      markerRef.current = new maplibregl.Marker({ draggable: true })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(mapRef.current);

      markerRef.current.on("drag", () => {
        const lngLat = markerRef.current.getLngLat();
        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
      });

      markerRef.current.on("dragend", () => {
        const lngLat = markerRef.current.getLngLat();
        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
      });

      mapRef.current.on("click", (e: any) => {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;

        markerRef.current.remove();
        markerRef.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        setCoordinates({ lat, lng });

        markerRef.current.on("drag", () => {
          const lngLat = markerRef.current.getLngLat();
          setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        });

        markerRef.current.on("dragend", () => {
          const lngLat = markerRef.current.getLngLat();
          setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        });
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
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
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Add coordinates
      formData.append("latitude", coordinates.lat.toString());
      formData.append("longitude", coordinates.lng.toString());
      formData.append("marker_icon", markerIcon);

      // Add images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

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

      // Get selected status for statistics update
      const selectedStatus = (
        form.querySelector('select[name="status"]') as HTMLSelectElement
      ).value;

      const response = await axios.post("/factory/create", formData);
      if (response.status !== 201) {
        throw new Error("Network response was not ok");
      }

      onClose();
      onSuccess(selectedStatus);
      showToast("Лойиҳа муваффақиятли қўшилди!", "success");
    } catch (error) {
      console.error("Error creating project:", error);
      showToast("Лойиҳа қўшишда хато юз берди!", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MapLibre GL JS Script */}
      <script src="https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.js"></script>
      <link
        href="https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.css"
        rel="stylesheet"
      />

      <div className="modal show bg-black/60 transition-[visibility,opacity] w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50">
        <div className="w-[60%] mx-auto bg-white relative rounded-md shadow-md transition-[margin-top,transform] duration-[0.4s,0.3s] mt-2 sm:w-[950px] max-h-[90vh] overflow-y-auto">
          <div className="p-2 text-center">
            <div className="flex justify-between items-center p-4">
              <h3 className="text-3xl font-medium">Янги лойиҳа қўшиш</h3>
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
                      defaultValue="0"
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
                    <label className="block mb-2 text-sm font-medium">
                      Лойиҳа расмлари
                    </label>
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() =>
                        document.getElementById("imageInput")?.click()
                      }
                    >
                      <div className="text-gray-600">
                        📷 Расмларни танланг *
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
                    {selectedImages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
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
                    )}
                  </div>

                  {/* Custom Fields */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Қўшимча майдонлар
                    </label>
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 mb-2">
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
                    {/* <div ref={mapContainerRef} className="h-64 md:h-[400px] w-full rounded border"></div> */}
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
                    <div className="pt-3 flex gap-2">
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
                      <div key={index} className="flex gap-2 mb-2">
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
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "⏳ Сақланмоқда..." : "Сақлаш"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;
