import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MapComponent from "../Factory/components/MapComponent";
import LanguageSwitcher from "../../components/UI/LanguageSwitcher";
import "./ListingForm.css";
import {
  applicationsAPI,
  CreateApplicationData,
} from "./services/applicationsAPI";
import { useModulesAuth } from "./hooks/useModulesAuth";
import countries from "world-countries";

interface ListingFormData {
  // General
  title: string;
  tagline: string;
  description: string;

  // Images
  coverImage: File | null;
  galleryImages: File[];

  // Contact Information
  contactEmail: string;
  phoneNumber: string;
  categories: string[];

  // Location
  region: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
}

const categories = [
  "automation_control",
  "control_systems",
  "sensors_instrumentation",
  "catering_camp",
  "accommodation_food",
  "facilities_management",
  "construction_civil",
  "fabrication",
  "structural_earthworks",
  "environmental_services",
  "monitoring_compliance",
  "rehabilitation",
  "explosives_blasting",
  "explosives_accessories",
  "finance_insurance",
  "capital_equipment_financing",
  "insurance",
  "geology_exploration",
];

const ListingForm: React.FC = () => {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  // Removed currentStep, mapContainer, map refs (handled in MapComponent)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 41.2995,
    lng: 69.2401,
  });

  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    tagline: "",
    description: "",
    coverImage: null,
    galleryImages: [],
    contactEmail: "",
    phoneNumber: "",
    categories: [],
    region: "",
    location: "",
    coordinates: null,
  });

  const steps = [
    t("listing.steps.general"),
    t("listing.steps.images"),
    t("listing.steps.contact"),
    t("listing.steps.location"),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "gallery"
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (type === "cover") {
      setFormData((prev) => ({
        ...prev,
        coverImage: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...Array.from(files)],
      }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useModulesAuth();

  const handleSubmit = async () => {
    if (!token) {
      alert(t("listing.errors.login_required"));
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      alert(t("listing.errors.required_fields"));
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("📤 Submitting application data:", formData);

      // Create application data
      const applicationData: CreateApplicationData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        phoneNumber: formData.phoneNumber || undefined,
        contactEmail: formData.contactEmail || undefined,
        region: formData.region || undefined,
        tagline: formData.tagline || undefined,
        coordinates: formData.coordinates || undefined,
      };

      // Submit application
      const createdApplication = await applicationsAPI.create(applicationData);

      console.log("✅ Application created successfully:", createdApplication);

      // Handle file uploads if there are any
      if (formData.coverImage) {
        try {
          await applicationsAPI.uploadCoverImage(
            createdApplication.id!,
            formData.coverImage
          );
          console.log("✅ Cover image uploaded");
        } catch (error) {
          console.error("❌ Cover image upload failed:", error);
        }
      }

      if (formData.galleryImages && formData.galleryImages.length > 0) {
        try {
          await applicationsAPI.uploadImages(
            createdApplication.id!,
            formData.galleryImages
          );
          console.log("✅ Gallery images uploaded");
        } catch (error) {
          console.error("❌ Gallery images upload failed:", error);
        }
      }

      alert(t("listing.submitted_success"));

      // Redirect to dashboard or applications list
      window.location.href = "/partner-portal/dashboard";
    } catch (error: any) {
      console.error("❌ Application submission failed:", error);

      if (error.response?.data?.message) {
        alert(
          t("listing.submit_failed") +
            (error.response?.data?.message
              ? ": " + error.response.data.message
              : "")
        );
      } else {
        alert(t("listing.submit_failed_try"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStepIndex) {
      case 0:
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="title">{t("listing.fields.title")}</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t("listing.placeholders.title")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">{t("listing.fields.tagline")}</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder={t("listing.placeholders.tagline")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                {t("listing.fields.description")}
              </label>
              <div className="editor-toolbar">
                <button type="button" aria-label={t("listing.editor.bold")}>
                  B
                </button>
                <button type="button" aria-label={t("listing.editor.italic")}>
                  I
                </button>
                <button
                  type="button"
                  aria-label={t("listing.editor.bullet_list")}
                >
                  •
                </button>
                <button
                  type="button"
                  aria-label={t("listing.editor.ordered_list")}
                >
                  1.
                </button>
                <button type="button" aria-label={t("listing.editor.link")}>
                  🔗
                </button>
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t("listing.placeholders.description")}
                rows={8}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <div className="form-group">
              <label>
                {t("listing.fields.cover_image")}{" "}
                <span className="optional">{t("optional")}</span>
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "cover")}
                />
                <div className="upload-placeholder">
                  <span>📁</span>
                </div>
              </div>
              <p className="file-info">{t("listing.file_info_max")}</p>
            </div>

            <div className="form-group">
              <label>
                {t("listing.fields.gallery_images")}{" "}
                <span className="optional">{t("optional")}</span>
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, "gallery")}
                />
                <div className="upload-placeholder">
                  <span>📁</span>
                </div>
              </div>
              <p className="file-info">{t("listing.file_info_max")}</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="contactEmail">
                {t("listing.fields.contact_email")}
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder={t("listing.placeholders.contact_email")}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                {t("listing.fields.phone_number")}{" "}
                <span className="optional">{t("optional")}</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder={t("listing.placeholders.phone_number")}
              />
            </div>

            <div className="form-group">
              <label>{t("listing.fields.category")}</label>
              <div className="categories-grid">
                {categories.map((categoryKey, index) => (
                  <label key={index} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(categoryKey)}
                      onChange={() => handleCategoryChange(categoryKey)}
                    />
                    {t(`listing.categories.${categoryKey}`)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="region">{t("listing.fields.region")}</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, region: e.target.value }))
                }
              >
                <option value="">{t("listing.select_country")}</option>
                {countries
                  .sort((a, b) => a.name.common.localeCompare(b.name.common))
                  .map((country) => (
                    <option
                      key={country.cca2}
                      value={country.name.common
                        .toLowerCase()
                        .replace(/\s+/g, "-")}
                    >
                      {country.flag} {country.name.common}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">{t("listing.fields.location")}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder={t("listing.placeholders.location_example")}
              />
            </div>

            <MapComponent
              containerId="listing-map"
              type="create"
              latitude={coordinates.lat}
              longitude={coordinates.lng}
              onCoordinatesChange={({
                lat,
                lng,
              }: {
                lat: number;
                lng: number;
              }) => {
                setCoordinates({ lat, lng });
                setFormData((prev) => ({
                  ...prev,
                  location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                  coordinates: { lat, lng },
                }));
              }}
            />
            <div className="selected-location">
              <p>
                <strong>{t("listing.selected_location")}</strong>
              </p>
              <p>
                {t("listing.lat")} {coordinates.lat.toFixed(6)}
              </p>
              <p>
                {t("listing.lng")} {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="listing-form-container">
      <div className="p-2 flex justify-between items-center ">
        <button
          type="button"
          onClick={() => (window.location.href = "/partner-portal/dashboard")}
          style={{
            background: "#primary",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "15px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← {t("listing.back_to_dashboard")}
        </button>

        <div>
          <LanguageSwitcher />
        </div>
      </div>
      <div className="listing-form-header">
        <h1>{t("listing.header")}</h1>
      </div>

      <div className="listing-form-content">
        <div className="sidebar-listing">
          <ul className="steps-list">
            {steps.map((step, index) => (
              <li
                key={`${index}-${step}`}
                className={`step-item ${
                  activeStepIndex === index ? "active" : ""
                }`}
                onClick={() => setActiveStepIndex(index)}
              >
                <span className="step-icon">
                  {index === 0 && "📝"}
                  {index === 1 && "📷"}
                  {index === 2 && "📞"}
                  {index === 3 && "📍"}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          <div className="step-header">
            <span className="step-icon">
              {activeStepIndex === 0 && "📝"}
              {activeStepIndex === 1 && "📷"}
              {activeStepIndex === 2 && "📞"}
              {activeStepIndex === 3 && "📍"}
            </span>
            <h2>{steps[activeStepIndex]}</h2>
          </div>

          {renderStepContent()}

          {activeStepIndex === 3 && (
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting
                ? t("ui.loading", { defaultValue: t("listing.submitting") })
                : t("ui.save", { defaultValue: t("listing.submit_button") })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingForm;
