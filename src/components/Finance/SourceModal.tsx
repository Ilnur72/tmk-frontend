import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface SourceFormData {
  name: string;
  url: string;
  description: string;
}

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: SourceFormData;
  setFormData: React.Dispatch<React.SetStateAction<SourceFormData>>;
  isLoading: boolean;
}

const SourceModal: React.FC<SourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isLoading,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
              <form onSubmit={onSubmit}>
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t("ui.add", { defaultValue: t("finance.add_new_source") })}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        {t("finance.source_name")}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="mt-1 w-full border rounded-md p-2"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        {t("finance.source_url")}
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        className="mt-1 w-full border rounded-md p-2"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        {t("finance.description")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 w-full border rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-white border rounded-md"
                  >
                    {t("ui.cancel", { defaultValue: t("finance.cancel") })}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                  >
                    {isLoading
                      ? t("ui.loading", { defaultValue: t("finance.loading") })
                      : t("ui.save", { defaultValue: t("finance.save") })}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SourceModal;
