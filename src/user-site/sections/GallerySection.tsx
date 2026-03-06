import { useState } from "react";

type ImageType = {
  src: string;
  alt: string;
};

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const images: ImageType[] = [
    { src: "/gallery/bedroom1.png", alt: "Bedroom 1" },
    { src: "/gallery/bedroom2.png", alt: "Bedroom 2" },
    { src: "/gallery/cr.png", alt: "Comfort Room" },
    { src: "/gallery/diningarea.png", alt: "Dining Room" },
    { src: "/gallery/firepit.png", alt: "Firepit" },
    { src: "/gallery/livingroom.png", alt: "Living Room" },
  ];

  return (
    <section id="gallery" className="py-16 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">
          Photo Gallery
        </h2>

        {/* GALLERY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-h-[80vh] max-w-[95vw] object-contain"
          />

          {/* IMAGE NAME */}
          <p className="text-white text-lg font-semibold mt-6">
            {selectedImage.alt}
          </p>
        </div>
      )}
    </section>
  );
}