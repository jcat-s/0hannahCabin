import { useEffect, useState } from "react";
import { Bell, User, Menu, X } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";
import React from "react";

const logoImage = "/section/logo.png";

interface HeaderProps {
  onBookClick: () => void;
  onAuthClick: () => void;
}

export function Header({ onBookClick, onAuthClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { hasUnread } = useNotifications();

  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ["home", "about", "amenities", "gallery", "contact"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "amenities", label: "Amenities" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-white/80 backdrop-blur-lg border-b border-zinc-100 py-3 shadow-sm"
          : "bg-transparent py-5"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo with slight hover lift */}
        <button
          onClick={() => scrollToSection("home")}
          className="flex-shrink-0 transition-transform hover:scale-105 focus:outline-none"
        >
          <img
            src={logoImage}
            alt="Ohannah Cabin"
            className={`transition-all duration-300 ${isScrolled ? "h-10" : "h-12"} w-auto`}
          />
        </button>

        {/* Desktop Navigation - Clean & Elegant */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`text-[11px] uppercase tracking-[0.25em] transition-all relative group ${activeSection === link.id
                  ? "text-black font-bold"
                  : "text-zinc-500 hover:text-black"
                }`}
            >
              {link.label}
              {/* Gold Underline for Active/Hover */}
              <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-[#D4AF37] transition-all duration-300 ${activeSection === link.id ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
            </button>
          ))}
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {user && (
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full border-2 border-white" />
              )}
            </button>
          )}

          {/* User Profile / Auth Button */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${isScrolled
                  ? "border-zinc-200 hover:border-black"
                  : "border-black/10 hover:border-black"
                }`}
              onClick={() => (!user ? onAuthClick() : setIsUserMenuOpen(!isUserMenuOpen))}
            >
              <User className="w-4 h-4 text-zinc-800" strokeWidth={1.5} />
              {!user && <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-800">Sign In</span>}
            </button>

            {/* Premium User Dropdown */}
            {user && isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-zinc-100 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-zinc-50">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">Account</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 transition-colors"
                  onClick={() => { setIsUserMenuOpen(false); scrollToSection("bookings"); }}
                >
                  My Reservations
                </button>
                <button
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  onClick={async () => { setIsUserMenuOpen(false); await logout(); }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-800"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-white z-50 p-8 space-y-8 animate-in slide-in-from-right">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-2xl font-serif text-left ${activeSection === link.id ? "text-[#D4AF37] italic" : "text-black"}`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {link.label}
              </button>
            ))}
          </div>
          <button
            onClick={onBookClick}
            className="w-full py-4 bg-black text-white text-xs uppercase tracking-[0.3em] font-bold border border-[#D4AF37]"
          >
            Reserve Now
          </button>
        </div>
      )}
    </header>
  );
}