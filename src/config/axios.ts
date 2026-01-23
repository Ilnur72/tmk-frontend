import axios from "axios";
import i18n from "../i18n";

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8085",
  timeout: 30000,
});

// Add request interceptor to automatically add lang parameter
axiosInstance.interceptors.request.use(
  (config) => {
    // Get current language
    const lang = i18n.language || "uz";

    // Map language codes
    const languageMap: { [key: string]: string } = {
      uz: "uz",
      ru: "ru",
      en: "en",
      "uz-UZ": "uz",
      "ru-RU": "ru",
      "en-US": "en",
    };

    const currentLang = languageMap[lang] || "uz";

    // Add lang parameter to URL
    if (config.url) {
      // Check if URL already has parameters
      const separator = config.url.includes("?") ? "&" : "?";

      // Only add lang if not already present
      if (!config.url.includes("lang=")) {
        config.url = `${config.url}${separator}lang=${currentLang}`;
      }
    }

    console.log("🌐 API Request:", config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to log responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.config?.url, error.response?.data);
    return Promise.reject(error);
  },
);

export default axiosInstance;
