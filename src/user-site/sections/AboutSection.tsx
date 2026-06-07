export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-white scroll-mt-20 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="hidden md:block absolute top-0 right-0 w-1/3 h-full bg-zinc-50 -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-zinc-400 font-semibold">
              The Experience
            </span>
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-zinc-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enjoy a Stunning <span className="not-italic">A-Frame Cabin</span>
            <span className="block md:inline"> in Malvar, Batangas</span>
          </h2>
        </div>

        {/* Details Content (Flex layout para sa fluid Desktop View sa mobile) */}
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 lg:gap-16 items-center justify-between">

          {/* Left: Image with Luxury Frame (Kontrolado ang laki para sakto lang sa screen) */}
          <div className="relative group order-2 md:order-1 w-full md:max-w-[45%] flex-1 px-4 sm:px-0">
            {/* The main frame */}
            <div className="relative z-10 bg-white p-2 sm:p-3 shadow-xl border border-zinc-100 rounded-3xl overflow-hidden">
              {/* Binago mula 4/5 patungong 16/10 o mas compact na aspect ratio para hindi masyadong mahaba pababa */}
              <div className="overflow-hidden aspect-[4/3] sm:aspect-[3/2] md:aspect-[4/3] rounded-3xl">
                <img
                  src="/section/about.jpg"
                  alt="Ohannah Cabin exterior"
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-transform duration-1000"
                />
              </div>
            </div>
            {/* Gold Offset Border */}
            <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-full h-full border border-[#D4AF37] -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500 rounded-3xl" />

            {/* Elegant Tag */}
            <div className="hidden lg:flex absolute top-10 -right-8 bg-black text-white px-4 py-2 transform rotate-90 origin-left uppercase tracking-[0.3em] text-[9px] font-bold rounded-sm">
              Private Sanctuary
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="space-y-6 order-1 md:order-2 w-full md:max-w-[50%] flex-1">
            <div className="space-y-4 text-zinc-600 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Enjoy this stunningly beautiful A-frame cabin nestled inside a private farm in Malvar, Batangas. Warm up around our cushioned firepit as you melt marshmallows for s’mores, sip hot chocolate, and catch up with family and friends.
              </p>

              <p className="italic border-l-2 border-[#D4AF37] pl-4 my-2 text-zinc-700">
                "Go star-gazing while floating in our infinity pool, grill some barbecue, enjoy karaoke, or simply bask in the beauty of nature."
              </p>

              <p>
                Ohannah Cabin is ideal for family and group get-togethers and is often chosen to celebrate special occasions. It features a spacious deck with low boho tables, an infinity pool, and a cozy outdoor firepit.
              </p>
            </div>

            {/* Sleeping Arrangement Cards */}
            <div className="bg-zinc-50 border-l-4 border-[#D4AF37] p-5 sm:p-6 space-y-4 shadow-sm rounded-2xl">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D4AF37] rotate-45"></span>
                Sleeping Arrangement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-900">Bedroom Area</p>
                  <p className="text-zinc-500">2 Queen Beds</p>
                  <p className="text-[10px] text-zinc-400 italic font-medium">+ Optional floor bed</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-900">The Loft</p>
                  <p className="text-zinc-500">2 Queen Beds</p>
                  <p className="text-[10px] text-zinc-400 italic font-medium">Extra beds available upon request</p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-bold text-zinc-900 tracking-wider">TOTAL CAPACITY:</p>
                <p className="text-xs sm:text-sm text-[#D4AF37] font-serif italic font-semibold">Up to 5 Queen Beds & 2 Single Beds</p>
              </div>
            </div>

            {/* Warning / Notes */}
            <div className="p-3 sm:p-4 bg-zinc-100 rounded-2xl flex items-start gap-3">
              <span className="text-sm mt-0.5">⚠️</span>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-500 leading-relaxed">
                Cooking & smoking <span className="text-black font-bold">strictly prohibited</span> inside. Outdoor griller provided. Please respect our artificial grass.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}