import { FormEvent, useEffect, useState } from "react";
import { Bell, User, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
const logoImage = "/section/logo.png";


interface HeaderProps {
  onBookClick: () => void;
}

export function Header({ onBookClick }: HeaderProps) {
  const { user, loading, loginWithEmail, signupWithEmail, loginWithGoogle, logout } =
    useAuth();
  const { hasUnread } = useNotifications();

  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

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

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || authSubmitting) return;
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      if (isLoginMode) {
        await loginWithEmail(authEmail, authPassword);
      } else {
        await signupWithEmail(authEmail, authPassword);
      }
      setIsAuthModalOpen(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (error: any) {
      setAuthError(error?.message ?? "Something went wrong. Please try again.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading || authSubmitting) return;
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (error: any) {
      setAuthError(error?.message ?? "Unable to sign in with Google.");
    } finally {
      setAuthSubmitting(false);
    }
  };

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
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setIsAuthModalOpen(false)}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-xl font-semibold mb-1">
              {isLoginMode ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {isLoginMode
                ? "Log in to manage your bookings and get updates."
                : "Sign up to start booking your stay at Ohannah Cabin."}
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {authError && (
                <p className="text-sm text-red-600">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authSubmitting || loading}
                className="w-full mt-2 px-4 py-2.5 rounded-md bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {authSubmitting
                  ? isLoginMode
                    ? "Logging in..."
                    : "Creating account..."
                  : isLoginMode
                  ? "Log in"
                  : "Sign up"}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                or
              </span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={authSubmitting || loading}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="text-gray-700">
                {isLoginMode ? "Continue with Google" : "Sign up with Google"}
              </span>
            </button>

            <button
              type="button"
              className="mt-4 w-full text-center text-sm text-gray-600 hover:text-gray-900"
              onClick={() => {
                setIsLoginMode((prev) => !prev);
                setAuthError(null);
              }}
            >
              {isLoginMode
                ? "New here? Create an account"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

