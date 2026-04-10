import {
  Wifi,
  Car,
  Utensils,
  Tv,
  Bath,
  Home,
  Flame,
  PawPrint,
  Waves, // Pinalitan ang Users ng Waves para sa Pool
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
    { icon: Waves, title: "Pool", details: "Private swimming pool" },
    { icon: Car, title: "Parking", details: "Free parking on premises" },
    { icon: PawPrint, title: "Pets", details: "Pets allowed. Assistance animals always allowed" },
  ];

  return (
    <section id="amenities" className="py-24 bg-[#FCFCFC] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">
              Comforts
            </span>
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-zinc-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ohannah Cabin <span className="not-italic">Amenities</span>
          </h2>
          <p className="text-zinc-500 font-light tracking-wide">
            Everything you need for a soulful and comfortable stay.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {amenities.map((item) => (
            <div
              key={item.title}
              className="group relative flex flex-col items-start space-y-4 transition-all duration-300"
            >
              {/* Icon with Gold Accent */}
              <div className="relative">
                <div className="absolute -inset-2 bg-[#D4AF37]/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                <item.icon className="w-7 h-7 text-zinc-800 group-hover:text-[#D4AF37] transition-colors duration-300" strokeWidth={1.2} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-zinc-900">
                  {item.title}
                </h3>
                <div className="h-[1px] w-8 bg-zinc-200 group-hover:w-16 group-hover:bg-[#D4AF37] transition-all duration-500"></div>
                <p className="text-zinc-500 text-sm leading-relaxed font-light max-w-[280px]">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative Bottom Accent */}
        <div className="mt-24 flex justify-center">
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-zinc-300 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}