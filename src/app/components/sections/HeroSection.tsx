interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section id="home" className="relative bg-gradient-to-br from-teal-50 to-green-50 overflow-hidden pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-teal-700"></div>
                <div className="w-6 h-1 bg-teal-700"></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl text-gray-900 leading-tight">
              Escape & Relax
            </h1>

            <h2 className="text-3xl md:text-4xl text-green-700 font-medium">
              OHANNAH CABIN
            </h2>

            <p className="text-lg text-gray-600 max-w-md">
              Experience tranquility amidst nature's beauty in Malvar, Batangas, Philippines.
            </p>

            <div className="pt-4">
              <button
                onClick={onBookClick}
                className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                Book Now
              </button>
            </div>

            {/* Social Media Icons */}
            <div className="flex gap-6 pt-8">
              <a
                href="#"
                className="text-gray-900 hover:text-green-700 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-900 hover:text-green-700 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"></rect>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"></circle>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"></circle>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-900 hover:text-green-700 transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0a12 12 0 00-4.37 23.17c-.18-1.63-.03-3.58.39-5.35l3.07-13A4.66 4.66 0 0110.8 3a3.35 3.35 0 013.42.21 3.6 3.6 0 011.26 2.87c0 2.22-1.18 5.27-1.83 8.2a2.13 2.13 0 002.17 2.66c2.58 0 4.33-3.32 4.33-7.27 0-3-2-5.25-5.64-5.25a6.45 6.45 0 00-6.8 6.47 3.82 3.82 0 001 2.71.38.38 0 01.1.36l-.4 1.67a.28.28 0 01-.41.2c-1.93-.8-2.82-2.95-2.82-5.36 0-3.88 3.27-8.56 9.73-8.56 5.22 0 8.67 3.76 8.67 7.83 0 5.37-3 9.42-7.45 9.42a3.89 3.89 0 01-3.33-1.66l-.91 3.48a12.55 12.55 0 01-1.62 3.3A12 12 0 1012 0z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] relative">
                <img
                  src="src/assets/oh.jpg"
                  alt="Ohannah Cabin - Modern A-frame architecture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-teal-300 rounded-full opacity-40 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
