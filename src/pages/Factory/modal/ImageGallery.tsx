interface ImageGalleryProps {
  images: string[];
  API_URL: string;
  selectedIndex: number | null;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  API_URL,
  selectedIndex,
  setSelectedIndex,
}) => {
  if (selectedIndex === null) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999]"
      onClick={() => setSelectedIndex(null)} // tashqariga bosilsa yopiladi
    >
      <div
        className="relative max-w-4xl w-full overflow-x-auto flex gap-4 p-4"
        onClick={(e) => e.stopPropagation()} // ichiga bosilganda yopilmasin
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={`${API_URL}/mnt/tmkupload/factory-images/${image}`}
            alt={`Full ${index}`}
            className={`max-h-[80vh] object-contain rounded ${
              index === selectedIndex ? "border-4 border-white" : ""
            }`}
          />
        ))}
      </div>
      <button
        onClick={() => setSelectedIndex(null)}
        className="absolute top-4 right-4 text-white text-2xl font-bold"
      >
        ✕
      </button>
    </div>
  );
};

export default ImageGallery;