import { useState } from "react";
import { X, Maximize2 } from "lucide-react";

type ImageType = {
  src: string;
  alt: string;
  category: string;
};

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  const images: ImageType[] = [
    { src: "/gallery/bedroom1.jpg", alt: "Bedroom 1", category: "Interior" },
    { src: "/gallery/nightstand.jpg", alt: "Nightstand Details", category: "Interior" },
    { src: "/gallery/bedroom2.jpg", alt: "Bedroom 2", category: "Interior" },
    { src: "/gallery/loftview.jpg", alt: "Interior View of the Pool", category: "Interior" },

    { src: "/gallery/cr.jpg", alt: "Comfort Room", category: "Interior" },
    { src: "/gallery/cr2.jpg", alt: "Comfort Room", category: "Interior" },

    { src: "/gallery/diningarea.jpg", alt: "Dining Room", category: "Interior" },
    { src: "/gallery/livingroom.jpg", alt: "Living Room", category: "Interior" },

    { src: "/gallery/petfriendly.jpg", alt: "Pet-friendly", category: "" },
    { src: "/gallery/firepit.jpg", alt: "Firepit", category: "Outdoor" },
    { src: "/gallery/swimmingpool.jpg", alt: "Swimming Pool", category: "Outdoor" },
    { src: "/gallery/aerialview.jpg", alt: "Aerial View", category: "Outdoor" },


  ];

  return (
    <section id="gallery" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
                Visual Journey
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif italic text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Capturing <span className="not-italic text-zinc-400">the</span> Moments
            </h2>
          </div>
          <p className="text-zinc-500 font-light max-w-xs text-sm leading-relaxed">
            A glimpse into the serene architecture and soulful interiors of Ohannah Cabin.
          </p>
        </div>

        {/* GALLERY GRID - Dynamic Editorial Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {images.map((image, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden bg-zinc-100 cursor-pointer ${index === 0 || index === 4 ? "lg:row-span-1" : ""
                }`}
              onClick={() => setSelectedImage(image)}
            >
              {/* Image with subtle zoom */}
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
              />

              {/* Sophisticated Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
                    {image.category}
                  </p>
                  <h3 className="text-white text-xl font-serif italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {image.alt}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-white/60 text-[10px] uppercase tracking-widest">
                    <Maximize2 size={12} /> View Full
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN MODAL - Luxury Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-zinc-950/95 flex flex-col items-center justify-center z-[100] animate-in fade-in duration-500"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
            <X size={32} strokeWidth={1} />
          </button>

          <div className="relative max-w-5xl w-full px-4">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto max-h-[75vh] object-contain shadow-2xl border-t border-b border-white/10"
            />

            {/* Modal Info Overlay */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-[#D4AF37] text-xs uppercase tracking-[0.5em] font-bold">
                {selectedImage.category}
              </p>
              <h3 className="text-white text-3xl font-serif italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {selectedImage.alt}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}