import { Wifi, Car, Utensils, Wind, Tv, Users } from "lucide-react";

export function AmenitiesSection() {
  const amenities = [
    { icon: Wifi, name: "Free WiFi", description: "High-speed internet throughout the property" },
    { icon: Car, name: "Free Parking", description: "Ample parking space for guests" },
    { icon: Utensils, name: "Full Kitchen", description: "Fully equipped kitchen with modern appliances" },
    { icon: Wind, name: "Air Conditioning", description: "Climate control in all rooms" },
    { icon: Tv, name: "Entertainment", description: "Smart TV and entertainment system" },
    { icon: Users, name: "Sleeps 8-10", description: "Comfortable accommodation for groups" },
  ];

  return (
    <section id="amenities" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((amenity) => (
            <div key={amenity.name} className="bg-gray-50 p-6 rounded-lg shadow-md space-y-3 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <amenity.icon className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-xl text-gray-900">{amenity.name}</h3>
              <p className="text-gray-600">{amenity.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
