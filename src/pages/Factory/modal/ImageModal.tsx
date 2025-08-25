import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}) => {
  const showPrevImage = () => {
    if (images.length > 1) {
      const newIndex = (currentIndex - 1 + images.length) % images.length;
      onIndexChange(newIndex);
    }
  };

  const showNextImage = () => {
    if (images.length > 1) {
      const newIndex = (currentIndex + 1) % images.length;
      onIndexChange(newIndex);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          showPrevImage();
          break;
        case "ArrowRight":
          showNextImage();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="image-modal fixed z-[99999] left-0 top-0 w-full h-full bg-black/90"
      style={{ display: "block" }}
      onClick={handleBackdropClick}
    >
      <button
        className="image-modal-close absolute top-4 right-9 text-white text-4xl font-bold cursor-pointer transition-colors hover:text-gray-300 z-[100002]"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {images.length > 1 && (
        <>
          <button
            className="image-modal-nav image-modal-prev absolute top-1/2 left-0 transform -translate-y-1/2 text-white text-3xl font-bold cursor-pointer p-4 select-none transition-colors hover:bg-white/10 z-[100002]"
            onClick={showPrevImage}
          >
            <ChevronLeft size={30} />
          </button>

          <button
            className="image-modal-nav image-modal-next absolute top-1/2 right-0 transform -translate-y-1/2 text-white text-3xl font-bold cursor-pointer p-4 select-none transition-colors hover:bg-white/10 z-[100002]"
            onClick={showNextImage}
          >
            <ChevronRight size={30} />
          </button>
        </>
      )}

      <img
        className="image-modal-content block m-auto max-w-[90%] max-h-[90%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100001]"
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
      />
    </div>
  );
};

export default ImageModal;
