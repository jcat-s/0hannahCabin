import { ImageWithFallback } from "../ImageWithFallback";

export function AboutSection() {
  const features = [
    "Private swimming pool",
    "Outdoor dining area",
    "BBQ facilities",
    "Garden and lawn area",
    "24/7 security",
    "Housekeeping services",
    "Scenic mountain views",
    "Pet-friendly (with prior arrangement)",
  ];

  return (
    <section id="about" className="py-16 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">About Ohannah Cabin</h2>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl text-gray-900">Our Story</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Ohannah Cabin is a stunning modern retreat located in the peaceful town of Malvar, Batangas, Philippines.
                Our distinctive A-frame architecture stands as a testament to contemporary design harmoniously blended
                with the natural beauty of the Philippine countryside.
              </p>
              <p>
                Built with the vision of providing guests a perfect escape from the hustle and bustle of city life,
                Ohannah Cabin offers an exclusive experience where you can reconnect with nature while enjoying
                modern comforts and amenities.
              </p>
              <p>
                Whether you're planning a family reunion, a getaway with friends, or a peaceful retreat, our cabin
                provides the perfect backdrop for creating lasting memories.
              </p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1671621556604-24b24da21886?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJhbWUlMjBob3VzZSUyMGFyY2hpdGVjdHVyZSUyMG1vZGVybnxlbnwxfHx8fDE3NzA1MTk4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Ohannah Cabin exterior"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
        </div>

        {/* Property Features */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl text-center mb-8 text-gray-900">Property Features</h3>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-700 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mt-16 text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-3xl text-gray-900">Location</h3>
          <p className="text-xl text-green-700">Malvar, Batangas, Philippines</p>
          <p className="text-gray-600">
            Conveniently located in Malvar, Batangas, Ohannah Cabin is easily accessible from Manila
            and surrounding areas. The location offers the perfect balance of privacy and accessibility,
            with local attractions and amenities within reach.
          </p>
          <div className="pt-8 space-y-2">
            <p className="text-gray-700">
              <strong>Approximate travel times:</strong>
            </p>
            <ul className="text-gray-600 space-y-1">
              <li>• From Manila: 1.5 - 2 hours</li>
              <li>• From Lipa City: 30 minutes</li>
              <li>• From Tagaytay: 45 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
