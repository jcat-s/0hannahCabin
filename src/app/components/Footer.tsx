export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const teamMembers = [
    { name: "Reg", role: "Manager", image: "/team/reg.jpg" },
    { name: "AJ", role: "Host", image: "/team/aj.jpg" },
    { name: "Bel", role: "Front Desk", image: "/team/bel.jpg" },
    { name: "Jen", role: "Web Dev", image: "/team/jen.jpg" },
  ];

  return (
    <footer className="bg-gray-950 text-gray-300 py-10 text-sm">
      <div className="max-w-6xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-8 items-start">

          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Ohannah Cabin
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
              A peaceful retreat in Malvar, Batangas.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Quick Links
            </h4>

            <div className="flex flex-wrap gap-4">
              {["home", "about", "amenities", "gallery", "contact"].map(
                (section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="hover:text-white transition text-xs"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Team */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Team
            </h4>

            <div className="flex items-start gap-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="text-center w-16">
                  <div className="w-10 h-10 mx-auto rounded-full overflow-hidden border border-gray-700">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] mt-1 text-white">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-gray-800 pt-4 text-center text-[11px] text-gray-500">
          © 2026 Ohannah Cabin
        </div>

      </div>
    </footer>
  );
}