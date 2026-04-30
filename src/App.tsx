import React, { useState } from "react";
import { Header } from "./user-site/components/Header";
import { Footer } from "./user-site/components/Footer";
import { HeroSection } from "./user-site/sections/HeroSection";
import { AboutSection } from "./user-site/sections/AboutSection";
import { AmenitiesSection } from "./user-site/sections/AmenitiesSection";
import { GallerySection } from "./user-site/sections/GallerySection";
import { ContactSection } from "./user-site/sections/ContactSection";
import { AuthPage } from "./user-site/Page/AuthPage";
import { BookingContainer } from "./user-site/Page/BookingContainer";
import { ProfilePage } from "./user-site/Page/ProfilePage";
import { AuthProvider } from "./shared/context/AuthContext";
import { NotificationProvider } from "./shared/context/NotificationContext";

export default function App() {
  const [activePage, setActivePage] = useState<"home" | "auth" | "booking" | "profile">("home");

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-[#FDFCFB]">

          {/* Header condition: Itatago lang kung nasa booking confirmation mode sa loob ng BookingPage */}
          <Header
            currentPage={activePage}
            onNavigate={(page) => setActivePage(page)}
          />

          <main>
            {activePage === "home" && (
              <>
                <HeroSection onBookClick={() => setActivePage("booking")} />
                <AboutSection />
                <AmenitiesSection />
                <GallerySection />
                <ContactSection />
                <Footer />
              </>
            )}

            {activePage === "auth" && <AuthPage />}

            {activePage === "booking" && (
              <BookingContainer
                onBack={() => setActivePage("home")}
                onRequireAuth={() => setActivePage("auth")}
              />
            )}

            {activePage === "profile" && (
              <ProfilePage onBack={() => setActivePage("home")} />
            )}
          </main>
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}