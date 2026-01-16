import i18n from "../i18n";

/**
 * Get current language for API requests
 * Maps i18n language codes to backend expected format
 */
export const getCurrentLanguage = (): string => {
  const lang = i18n.language || "uz";

  // Map language codes if needed
  const languageMap: { [key: string]: string } = {
    uz: "uz",
    ru: "ru",
    en: "en",
    "uz-UZ": "uz",
    "ru-RU": "ru",
    "en-US": "en",
  };

  return languageMap[lang] || "uz";
};

/**
 * Add language query parameter to URL
 */
export const addLangParam = (url: string): string => {
  const lang = getCurrentLanguage();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}lang=${lang}`;
};
