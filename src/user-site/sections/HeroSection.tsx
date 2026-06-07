interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  // Sophisticated Gold Hex Code: #D4AF37
  return (
    <section
      id="home"
      className="relative bg-zinc-50 overflow-hidden pt-10 sm:pt-14 md:pt-20 min-h-screen flex items-center"
    >
      {/* Background Texture (Faint grid pattern) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 z-20">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-[1px] sm:h-[2px] w-12 sm:w-16 bg-black"></div>
                <div className="h-[1px] sm:h-[2px] w-12 sm:w-16 bg-[#D4AF37]"></div>
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-600 font-medium">
                Exclusive Retreat | Nature's Sanctuary
              </p>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif text-black leading-[1.1] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Escape & <span className="italic text-[#D4AF37]">Relax.</span>
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl text-black font-extralight tracking-[0.1em] sm:tracking-[0.15em]">
                OHANNAH<span className="font-semibold">CABIN</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-700 max-w-xl leading-relaxed font-light">
              Experience tranquility amidst nature's beauty in Malvar, Batangas,
              Philippines.
            </p>

            <div className="pt-2 sm:pt-4 flex flex-col gap-4 sm:gap-6 items-start sm:items-center">
              <button
                onClick={onBookClick}
                className="group inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-black text-white rounded-none border-[2px] sm:border-[3px] border-[#D4AF37] hover:border-black hover:bg-[#D4AF37] hover:text-black transition-all duration-300 uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs lg:text-xs font-bold shadow-lg hover:shadow-2xl w-full sm:w-auto"
              >
                Book Now
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-10 pt-6 sm:pt-8 lg:pt-14">
              <a href="https://www.facebook.com/ohannahcabin" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-4 text-zinc-500 hover:text-black transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.5 9.87v-6.99H8.08V12h2.42V9.8c0-2.39 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48V12h2.64l-.42 2.88h-2.22v6.99A10 10 0 0022 12z" /></svg>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold border-b-2 border-[#D4AF37] whitespace-nowrap">Facebook</span>
              </a>
              <a href="mailto:ohannahcabin@gmail.com" className="flex items-center gap-2 sm:gap-4 text-zinc-500 hover:text-black transition-colors" aria-label="Gmail">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2 4h20v16H2V4zm10 7L2 6v2l10 5 10-5V6l-10 5z" /></svg>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold border-b-2 border-[#D4AF37] whitespace-nowrap">Gmail</span>
              </a>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative flex justify-center lg:justify-end items-center mt-8 sm:mt-10 lg:mt-0 z-10 w-full">
            <div className="hidden lg:block absolute -bottom-16 -right-10 text-[20rem] font-serif italic text-zinc-100 opacity-80 pointer-events-none -z-20 select-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              O
            </div>

            <div className="relative z-10 p-2 sm:p-3 lg:p-4 bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] sm:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.15)] lg:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transform hover:scale-105 sm:hover:scale-100 lg:rotate-3 lg:hover:rotate-0 transition-transform duration-700 ease-out border-[8px] sm:border-[10px] lg:border-[14px] border-white max-w-[280px] sm:max-w-[400px] lg:max-w-[550px] w-full rounded-[1.5rem]">
              <div className="p-1 bg-zinc-100 shadow-inner rounded-xl">
                <div className="aspect-[4/3] overflow-hidden bg-zinc-200 shadow-inner rounded-xl">
                  <img
                    src="/gallery/cabin.jpg"
                    alt="Ohannah Cabin"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-in-out"
                  />
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -top-10 -left-10 w-48 h-48 border-l-2 border-t-2 border-[#D4AF37] pointer-events-none -z-10"></div>
            <div className="hidden lg:block absolute top-10 left-10 right-[-10px] bottom-[-10px] border border-zinc-200 pointer-events-none -z-10 rounded-sm"></div>
          </div>

        </div>
      </div>
    </section>
  );
}