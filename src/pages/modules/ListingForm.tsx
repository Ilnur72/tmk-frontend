import React, { useState, useCallback } from "react";
import MapComponent from "../Factory/components/MapComponent";
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
  "Automation & Control",
  "Control Systems",
  "Sensors & Instrumentation",
  "Catering & Camp Services",
  "Accommodation & Food",
  "Facilities Management",
  "Construction & Civil Works",
  "Fabrication",
  "Structural & Earthworks",
  "Environmental Services",
  "Monitoring & Compliance",
  "Rehabilitation",
  "Explosives & Blasting",
  "Explosives & Accessories",
  "Finance & Insurance",
  "Capital Equipment Financing",
  "Insurance",
  "Geology & Exploration",
];

const ListingForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>("General");
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

  const steps = ["General", "Images", "Contact Information", "Location"];

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
      alert("You must be logged in to submit an application");
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      alert(
        "Please fill in all required fields: Title, Description, and Location"
      );
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

      alert(
        "🎉 Application submitted successfully! You will be redirected to dashboard."
      );

      // Redirect to dashboard or applications list
      window.location.href = "/partner-portal/dashboard";
    } catch (error: any) {
      console.error("❌ Application submission failed:", error);

      if (error.response?.data?.message) {
        alert("Error: " + error.response.data.message);
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case "General":
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter listing title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tagline">Tagline</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="Enter tagline"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <div className="editor-toolbar">
                <button type="button">B</button>
                <button type="button">I</button>
                <button type="button">•</button>
                <button type="button">1.</button>
                <button type="button">🔗</button>
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows={8}
              />
            </div>
          </div>
        );

      case "Images":
        return (
          <div className="step-content">
            <div className="form-group">
              <label>
                Cover Image <span className="optional">(optional)</span>
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
              <p className="file-info">Maximum file size: 512 MB.</p>
            </div>

            <div className="form-group">
              <label>
                Gallery Images <span className="optional">(optional)</span>
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
              <p className="file-info">Maximum file size: 512 MB.</p>
            </div>
          </div>
        );

      case "Contact Information":
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Enter contact email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                Phone Number <span className="optional">(optional)</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="categories-grid">
                {categories.map((category, index) => (
                  <label key={index} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "Location":
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="region">Country/Region</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, region: e.target.value }))
                }
              >
                <option value="">Select a country/region</option>
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
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder='e.g. "London"'
              />
            </div>

            <MapComponent
              containerId="listing-map"
              type="create"
              latitude={coordinates.lat}
              longitude={coordinates.lng}
              onCoordinatesChange={({ lat, lng }: { lat: number; lng: number }) => {
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
                <strong>Tanlangan joylashuv:</strong>
              </p>
              <p>Lat: {coordinates.lat.toFixed(6)}</p>
              <p>Lng: {coordinates.lng.toFixed(6)}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="listing-form-container">
      <div className="p-2">
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
          ← Back to Dashboard
        </button>
      </div>
      <div className="listing-form-header">
        <h1>Your listing details</h1>
      </div>

      <div className="listing-form-content">
        <div className="sidebar-listing">
          <ul className="steps-list">
            {steps.map((step, index) => (
              <li
                key={step}
                className={`step-item ${activeStep === step ? "active" : ""}`}
                onClick={() => setActiveStep(step)}
              >
                <span className="step-icon">
                  {step === "General" && "📝"}
                  {step === "Images" && "📷"}
                  {step === "Contact Information" && "📞"}
                  {step === "Location" && "📍"}
                </span>
                {step}
              </li>
            ))}
          </ul>

          <div className="language-selector">🇬🇧 English ▼</div>
        </div>

        <div className="main-content">
          <div className="step-header">
            <span className="step-icon">
              {activeStep === "General" && "📝"}
              {activeStep === "Images" && "📷"}
              {activeStep === "Contact Information" && "📞"}
              {activeStep === "Location" && "📍"}
            </span>
            <h2>{activeStep}</h2>
          </div>

          {renderStepContent()}

          {activeStep === "Location" && (
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
              {isSubmitting ? "⏳ Submitting..." : "🚀 Submit listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingForm;
