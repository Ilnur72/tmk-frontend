import axios from "axios";
import i18n from "../i18n";

// Add request interceptor to automatically add lang parameter
axios.interceptors.request.use(
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
      const url = new URL(config.url, window.location.origin);
      url.searchParams.set("lang", currentLang);

      // If URL is relative, use pathname + search
      if (config.url.startsWith("/") || config.url.startsWith("http")) {
        config.url = config.url.startsWith("http")
          ? url.toString()
          : url.pathname + url.search;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
