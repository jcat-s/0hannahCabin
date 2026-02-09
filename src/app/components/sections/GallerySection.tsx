import { ImageWithFallback } from "../ImageWithFallback";

export function GallerySection() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1629711129507-d09c820810b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjB0cm9waWNhbCUyMHJlc29ydHxlbnwxfHx8fDE3NzA1MTk5Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Swimming pool"
    },
    {
      src: "https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcwNDkzMzAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Bedroom interior"
    },
    {
      src: "https://images.unsplash.com/photo-1751563680742-ed7d75a0e4cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwZGluaW5nJTIwdGVycmFjZSUyMG5hdHVyZXxlbnwxfHx8fDE3NzA1MTk5NDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Outdoor dining area"
    },
    {
      src: "https://images.unsplash.com/photo-1729869705220-86eef27eec3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBjYWJpbiUyMG5hdHVyZSUyMHBvb2x8ZW58MXx8fHwxNzcwNTE5ODgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Cabin exterior view"
    },
    {
      src: "https://images.unsplash.com/photo-1661200797567-6ba1d1e7ffb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGNhYmluJTIwcmV0cmVhdCUyMHBoaWxpcHBpbmVzfGVufDF8fHx8MTc3MDUxOTg4MXww&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "Tropical surroundings"
    },
    {
      src: "https://images.unsplash.com/photo-1671621556604-24b24da21886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJhbWUlMjBob3VzZSUyMGFyY2hpdGVjdHVyZSUyMG1vZGVybnxlbnwxfHx8fDE3NzA1MTk4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      alt: "A-frame architecture"
    }
  ];

  return (
    <section id="gallery" className="py-16 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">Photo Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-lg aspect-[4/3] group">
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
