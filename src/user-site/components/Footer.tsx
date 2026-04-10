import { Facebook, Mail } from "lucide-react";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
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
    <footer className="bg-zinc-950 text-zinc-400 py-10 text-[11px] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 items-start">

          {/* 1. Brand & Socials */}
          <div className="space-y-3">
            <h3
              className="text-sm font-serif italic text-white tracking-widest"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ohannah <span className="text-[#D4AF37]">Cabin</span>
            </h3>
            <p className="text-zinc-500 leading-relaxed max-w-[200px]">
              A peaceful retreat in Malvar, Batangas. Designed for serenity.
            </p>

            {/* Social Media Links */}
            <div className="flex gap-4 pt-1">
              <a
                href="https://www.facebook.com/ohannahcabin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-[#D4AF37] transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="mailto:ohannahcabin@gmail.com"
                aria-label="Gmail"
                className="hover:text-[#D4AF37] transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 mb-4 font-bold">Explore</h4>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {["home", "about", "amenities", "gallery", "contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="hover:text-white transition-colors uppercase tracking-widest text-[10px]"
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Team */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 mb-4 font-bold">The Team</h4>
            <div className="flex items-center gap-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="text-center group">
                  <div className="w-10 h-10 mx-auto rounded-full p-[1.5px] border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-all">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full shadow-sm"
                    />
                  </div>
                  <p className="text-[10px] mt-2 text-white font-medium">{member.name}</p>
                  <p className="text-[8px] text-[#D4AF37] uppercase tracking-tighter">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[9px] uppercase tracking-[0.4em] text-zinc-700">
          © 2026 Ohannah Cabin • Batangas
        </div>
      </div>
    </footer>
  );
}