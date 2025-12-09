import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  factory: { id: number; name: string } | null;
  onSuccess: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  factory,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!factory) return;

    setLoading(true);

    try {
      const response = await axios.delete(`/factory/${factory.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      onClose();
      onSuccess();
      toast("Лойиҳани ўчириш муваффақиятли амалга оширилди!", {
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting factory:", error);
      toast("Лойиҳани ўчиришда хато юз берди!", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "Enter") {
      handleDelete();
    }
  };

  if (!isOpen || !factory) return null;

  return (
    <div
      className="modal show bg-black/60 transition-all duration-300 w-screen h-screen fixed left-0 top-0 visible opacity-100 z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-dialog transition-all duration-300 ease-out relative w-auto h-full flex items-center justify-center p-4">
        <div className="modal-content bg-white relative flex flex-col rounded-md shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="text-xl font-semibold text-gray-900 mb-2">
              {t("ui.confirm_delete", {
                defaultValue: t("modal.delete_confirm"),
              })}
            </div>
            <div className="text-gray-600 mb-6">
              {t("ui.confirm_delete", {
                defaultValue: t("modal.confirm_delete", { name: factory.name }),
                name: factory.name,
              })}
            </div>

            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t("ui.cancel", { defaultValue: t("modal.close") })}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-md bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {loading
                  ? `⏳ ${t("ui.loading", {
                      defaultValue: t("modal.deleting"),
                    })}`
                  : t("ui.delete", { defaultValue: t("modal.delete") })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
