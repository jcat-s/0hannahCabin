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
    { src: "/gallery/diningarea.png", alt: "Kitchen & Dining" },
    { src: "/gallery/firepit.png", alt: "Firepit" },
    { src: "/gallery/livingroom.png", alt: "Living Room" },
  ];

  return (
    <section id="gallery" className="py-16 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">
          Photo Gallery
        </h2>

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
                className="w-full h-64 sm:h-72 md:h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto"
            />
            <p className="text-center text-lg font-semibold p-4">
              {selectedImage.alt}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
