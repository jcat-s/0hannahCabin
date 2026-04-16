import { useEffect, useState } from "react";
import { User, LogOut, Calendar, CircleUser } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import React from "react";

interface HeaderProps {
  onNavigate: (page: "home" | "auth" | "booking" | "profile") => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    if (currentPage !== 'home') onNavigate('home');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 100);
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "amenities", label: "Amenities" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || currentPage !== 'home' ? "bg-white/90 backdrop-blur-xl py-3 shadow-sm border-b border-zinc-100" : "bg-transparent py-6"
      }`}>
      <nav className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex-shrink-0 transition-transform hover:scale-105">
          <img src="/section/logo.png" alt="Logo" className="h-10 w-auto" />
        </button>

        {/* Lilitaw lang ang links kung nasa Home */}
        {currentPage === 'home' && (
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => handleNavClick(link.id)} className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black transition-colors">
                {link.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative">
            {user ? (
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-100 transition-all">
                <CircleUser size={24} strokeWidth={1.5} className="text-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                  {user.displayName?.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-black/20 hover:bg-black hover:text-white transition-all group" onClick={() => onNavigate('auth')}>
                <User size={14} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black">Sign In</span>
              </button>
            )}

            {user && isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-4 w-64 bg-white border border-zinc-100 rounded-[1.5rem] shadow-2xl py-3 z-20">
                  <div className="px-5 py-4 border-b border-zinc-50 mb-2">
                    <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest">Account Overview</p>
                    <p className="text-sm font-bold text-zinc-900 truncate">{user.email}</p>
                  </div>
                  <button className="w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 flex items-center gap-3 transition-colors" onClick={() => { setIsUserMenuOpen(false); onNavigate('profile'); }}>
                    <Calendar size={14} className="text-[#D4AF37]" /> My Reservations
                  </button>
                  <div className="border-t border-zinc-50 mt-2 pt-2">
                    <button className="w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors" onClick={async () => { await logout(); setIsUserMenuOpen(false); onNavigate('home'); }}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}