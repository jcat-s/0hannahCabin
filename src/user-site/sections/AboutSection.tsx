export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white scroll-mt-20 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-zinc-50 -z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
            <span className="text-xs uppercase tracking-[0.4em] text-zinc-400 font-semibold">
              The Experience
            </span>
            <span className="h-[1px] w-8 bg-[#D4AF37]"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-zinc-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Enjoy a Stunning <span className="not-italic">A-Frame Cabin</span> <br />
            in Malvar, Batangas
          </h2>
        </div>

        {/* Details Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Image with Luxury Frame */}
          <div className="relative group order-2 lg:order-1">
            {/* The main frame */}
            <div className="relative z-10 bg-white p-3 shadow-2xl border border-zinc-100">
              <div className="overflow-hidden aspect-[4/5]">
                <img
                  src="/section/about.jpg"
                  alt="Ohannah Cabin exterior"
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                />
              </div>
            </div>
            {/* Gold Offset Border */}
            <div className="absolute -bottom-6 -left-6 w-full h-full border border-[#D4AF37] -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />

            {/* Elegant Tag */}
            <div className="absolute top-10 -right-8 bg-black text-white px-6 py-3 transform rotate-90 origin-left uppercase tracking-[0.3em] text-[10px] font-bold">
              Private Sanctuary
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <p className="text-lg text-zinc-600 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-black">
                Enjoy this stunningly beautiful A-frame cabin nestled inside a private
                farm in Malvar, Batangas. Warm up around our cushioned firepit as you melt
                marshmallows for s’mores, sip hot chocolate, and catch up with family and
                friends.
              </p>

              <p className="text-zinc-600 leading-relaxed font-light italic">
                "Go star-gazing while floating in our infinity pool, grill some barbecue,
                enjoy karaoke, or simply bask in the beauty of nature."
              </p>

              <p className="text-zinc-600 leading-relaxed font-light">
                Ohannah Cabin is ideal for family and group get-togethers and is often
                chosen to celebrate special occasions. It features a spacious deck with
                low boho tables, an infinity pool, and a cozy outdoor firepit.
              </p>
            </div>

            {/* Sleeping Arrangement Cards */}
            <div className="bg-zinc-50 border-l-4 border-[#D4AF37] p-8 space-y-6 shadow-sm">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D4AF37] rotate-45"></span>
                Sleeping Arrangement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-900">Bedroom Area</p>
                  <p className="text-zinc-500">2 Queen Beds</p>
                  <p className="text-[10px] text-zinc-400 italic font-medium">+ Optional floor bed</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-900">The Loft</p>
                  <p className="text-zinc-500">2 Queen Beds</p>
                  <p className="text-[10px] text-zinc-400 italic font-medium">Extra beds available upon request</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <p className="text-xs font-bold text-zinc-900">TOTAL CAPACITY:</p>
                <p className="text-sm text-[#D4AF37] font-serif italic">Up to 5 Queen Beds & 2 Single Beds</p>
              </div>
            </div>

            {/* Warning / Notes */}
            <div className="p-4 bg-zinc-100 rounded flex items-start gap-4">
              <span className="text-lg">⚠️</span>
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 leading-loose">
                Cooking & smoking <span className="text-black font-bold">strictly prohibited</span> inside.
                Outdoor griller provided. Please respect our artificial grass.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}