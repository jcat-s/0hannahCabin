import { useEffect, useState } from "react";
import { Bell, User, Menu, X } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotifications } from "../../shared/context/NotificationContext";
import { AuthModal } from "./AuthModal";
const logoImage = "/section/logo.png";


interface HeaderProps {
  onBookClick: () => void;
}

export function Header({ onBookClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { hasUnread } = useNotifications();

  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Update active section based on scroll position
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
      const offset = 80; // Account for sticky header
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/40 backdrop-blur-md shadow-md"
        : "bg-transparent"
        }`}
    >

      <nav className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollToSection("home")}
          className="flex-shrink-0 focus:outline-none"
        >
          <img
            src={logoImage}
            alt="Ohannah Cabin"
            className="h-10 md:h-12 w-auto"
          />
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`text-base transition-colors ${activeSection === link.id
                ? "text-gray-900 font-medium"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Side Icons */}
        <div className="relative flex items-center gap-4">
          {/* Bell: only when logged in */}
          {user && (
            <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          )}
          {/* User icon */}
          <div className="hidden md:block relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsUserMenuOpen((prev) => !prev);
                }
              }}
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>
            {/* Dropdown when logged in */}
            {user && isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    scrollToSection("profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    scrollToSection("bookings");
                  }}
                >
                  My Bookings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile auth shortcut */}
          {!user && (
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsUserMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              aria-label="Sign in"
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
            {/* Auth / account row */}
            {!user ? (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign in / Create account
              </button>
            ) : (
              <div className="w-full rounded-lg border border-gray-200 px-4 py-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email ?? "Signed in"}
                </p>
                <button
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}

            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left py-2 text-lg transition-colors ${activeSection === link.id
                  ? "text-gray-900 font-medium"
                  : "text-gray-600"
                  }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onBookClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal open={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}

