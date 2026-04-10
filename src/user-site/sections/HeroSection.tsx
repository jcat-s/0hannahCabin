interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  // Sophisticated Gold Hex Code: #D4AF37
  return (
    <section
      id="home"
      className="relative bg-zinc-50 overflow-hidden pt-20 min-h-[95vh] flex items-center"
    >
      {/* Background Texture (Faint grid pattern) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 w-full">
        {/* Adjusted Grid - Fixed layout to ensure 2 columns side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* Left Content - Luxury Typography and Gold Accents */}
          <div className="space-y-10 z-20">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                {/* Fixed Plain Black Line */}
                <div className="h-[2px] w-16 bg-black"></div>
                {/* NEW GOLD Line Accent */}
                <div className="h-[2px] w-16 bg-[#D4AF37]"></div>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-600 font-medium">
                Exclusive Retreat | Nature's Sanctuary
              </p>
            </div>

            <div className="space-y-3">
              {/* Gold Italicized Text */}
              <h1 className="text-6xl md:text-8xl font-serif text-black leading-[1.1] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Escape & <span className="italic text-[#D4AF37]">Relax.</span>
              </h1>
              {/* Brand Name (Sans-serif, light) */}
              <h2 className="text-3xl md:text-5xl text-black font-extralight tracking-[0.15em]">
                OHANNAH<span className="font-semibold">CABIN</span>
              </h2>
            </div>

            {/* Adjusted description: text-lg, font-light */}
            <p className="text-xl text-zinc-700 max-w-xl leading-relaxed font-light">
              Experience tranquility amidst nature's beauty in Malvar, Batangas,
              Philippines.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Premium Button with Gold Border (Museum Plate style) */}
              <button
                onClick={onBookClick}
                className="group inline-flex items-center justify-center px-10 py-5 bg-black text-white rounded-none border-[3px] border-[#D4AF37] hover:border-black hover:bg-[#D4AF37] hover:text-black transition-all duration-300 uppercase tracking-widest text-xs font-bold shadow-2xl"
              >
                Book Now
              </button>
            </div>

            {/* Social Media Icons (Fixed position, with gold label) */}
            <div className="flex gap-10 pt-16">
              {/* Facebook */}
              <a href="https://www.facebook.com/ohannahcabin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-zinc-500 hover:text-black transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.5 9.87v-6.99H8.08V12h2.42V9.8c0-2.39 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48V12h2.64l-.42 2.88h-2.22v6.99A10 10 0 0022 12z" /></svg>
                <span className="text-[10px] uppercase tracking-widest font-semibold border-b-2 border-[#D4AF37]">Facebook</span>
              </a>
              {/* Gmail */}
              <a href="mailto:ohannahcabin@gmail.com" className="flex items-center gap-4 text-zinc-500 hover:text-black transition-colors" aria-label="Gmail">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2 4h20v16H2V4zm10 7L2 6v2l10 5 10-5V6l-10 5z" /></svg>
                <span className="text-[10px] uppercase tracking-widest font-semibold border-b-2 border-[#D4AF37]">Gmail</span>
              </a>
            </div>
          </div>

          {/* Right Content - Fixed Frame Layout and Gold Decorations */}
          <div className="relative flex justify-center lg:justify-end items-center mt-12 lg:mt-0 z-10 w-full">

            {/* Background 'O' Watermark (Behind everything) */}
            <div className="absolute -bottom-16 -right-10 text-[20rem] font-serif italic text-zinc-100 opacity-80 pointer-events-none -z-20 select-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              O
            </div>

            {/* The Image Frame - Museum Style with original landscape ratio */}
            <div className="relative z-10 p-4 bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transform lg:rotate-3 hover:rotate-0 transition-transform duration-700 ease-out border-[14px] border-white max-w-[550px] w-full">
              {/* Inner Matting effect */}
              <div className="p-1 bg-zinc-100 shadow-inner">
                {/* Landscape Aspect Ratio [4/3] - ensure your image fills this space */}
                <div className="aspect-[4/3] overflow-hidden bg-zinc-200 shadow-inner">
                  <img
                    src="/gallery/cabin.jpg"
                    alt="Ohannah Cabin"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-in-out"
                  />
                </div>
              </div>
            </div>

            {/* GOLD Geometric Accent (Behind the frame) */}
            <div className="absolute -top-10 -left-10 w-48 h-48 border-l-2 border-t-2 border-[#D4AF37] pointer-events-none -z-10"></div>

            {/* Minimalist offset gold border line art */}
            <div className="absolute top-10 left-10 right-[-10px] bottom-[-10px] border border-zinc-200 pointer-events-none -z-10 rounded-sm"></div>
          </div>

        </div>
      </div>
    </section>
  );
}