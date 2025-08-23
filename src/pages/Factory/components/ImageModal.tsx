import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function ImageModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        navigateImage(-1);
      } else if (event.key === "ArrowRight") {
        navigateImage(1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const navigateImage = (direction: number) => {
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = images.length - 1;
    } else if (newIndex >= images.length) {
      newIndex = 0;
    }

    onNavigate(newIndex);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigateImage(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigateImage(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Container */}
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto">
          <img
            src={`http://localhost:8085/mnt/tmkupload/factory-images/${images[currentIndex]}`}
            alt={`Project image ${currentIndex + 1}`}
            className="w-full h-[70vh] object-contain mx-auto block"
          />
          <div className="p-4 bg-gray-50">
            <p className="text-center text-gray-600 font-medium">
              {currentIndex + 1} / {images.length}
            </p>
            <p className="text-center text-gray-800 mt-1">
              Лойиҳа расми {currentIndex + 1}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
