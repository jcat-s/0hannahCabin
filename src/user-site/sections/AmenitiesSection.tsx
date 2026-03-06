import {
  Wifi,
  Car,
  Utensils,
  Tv,
  Bath,
  Home,
  Flame,
  PawPrint,
  Users,
} from "lucide-react";

type AmenityType = {
  icon: any;
  title: string;
  details: string;
};

export function AmenitiesSection() {
  const amenities: AmenityType[] = [
    { icon: Bath, title: "Bathroom", details: "Shampoo, body soap, bidet, outdoor shower, and cleaning products" },
    { icon: Home, title: "Bedroom", details: "Bed linens, extra pillows & blankets, room-darkening shades, air conditioning and safe" },
    { icon: Tv, title: "Entertainment", details: "Smart TV, sound system, and board games" },
    { icon: Wifi, title: "WiFi", details: "Fast and reliable internet connection" },
    { icon: Utensils, title: "Kitchen", details: "Kitchen, microwave, dishes, silverware, mini fridge, wine glasses & dining table" },
    { icon: Flame, title: "Outdoor", details: "Private backyard, fire pit, BBQ grill & outdoor dining area" },
    { icon: Users, title: "Pool", details: "Private swimming pool" },
    { icon: Car, title: "Parking", details: "Free parking on premises" },
    { icon: PawPrint, title: "Pets", details: "Pets allowed. Assistance animals always allowed" },
  ];

  return (
    <section id="amenities" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl text-center mb-12 text-gray-900">Amenities</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {amenities.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <item.icon className="w-8 h-8 text-green-700 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}