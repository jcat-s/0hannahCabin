interface HeroSectionProps {
  onBookClick: () => void;
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-teal-50 to-green-50 overflow-hidden pt-24"
    >
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
              Experience tranquility amidst nature's beauty in Malvar, Batangas,
              Philippines.
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
              {/* Facebook */}
              <a
                href="https://www.facebook.com/ohannahcabin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-green-700 transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12a10 10 0 10-11.5 9.87v-6.99H8.08V12h2.42V9.8c0-2.39 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48V12h2.64l-.42 2.88h-2.22v6.99A10 10 0 0022 12z" />
                </svg>
              </a>

              {/* Gmail */}
              <a
                href="mailto:ohannahcabin@gmail.com"
                className="text-gray-900 hover:text-green-700 transition-colors"
                aria-label="Gmail"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 4h20v16H2V4zm10 7L2 6v2l10 5 10-5V6l-10 5z" />
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
