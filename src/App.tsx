import React, { useState } from "react";
import { Header } from "./user-site/components/Header";
import { Footer } from "./user-site/components/Footer";

import { HeroSection } from "./user-site/sections/HeroSection";
import { AboutSection } from "./user-site/sections/AboutSection";
import { AmenitiesSection } from "./user-site/sections/AmenitiesSection";
import { GallerySection } from "./user-site/sections/GallerySection";
import { ContactSection } from "./user-site/sections/ContactSection";

import { AuthPage } from "./user-site/Page/AuthPage";
import { BookingPage } from "./user-site/Page/BookingPage";
import { ProfilePage } from "./user-site/Page/ProfilePage"; // Siguraduhing imported ito

import { AuthProvider } from "./shared/context/AuthContext";
import { NotificationProvider } from "./shared/context/NotificationContext";

export default function App() {
  // Dagdagan ng "profile" sa types
  const [activePage, setActivePage] = useState<"home" | "auth" | "booking" | "profile">("home");

  const goBack = () => setActivePage("home");

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-[#FDFCFB]">

          {/* HEADER: Dapat laging visible o depende sa page */}
          <Header
            onBookClick={() => setActivePage("booking")}
            onNavigate={(page: any) => setActivePage(page)}
          />

          <main>
            {/* HOME PAGE */}
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

            {/* AUTH PAGE / GUEST PORTAL */}
            {activePage === "auth" && (
              <AuthPage />
            )}

            {/* BOOKING PAGE */}
            {activePage === "booking" && (
              <BookingPage
                onBack={goBack}
                onRequireAuth={() => setActivePage("auth")}
              />
            )}

            {/* PROFILE PAGE */}
            {activePage === "profile" && (
              <ProfilePage onBack={goBack} />
            )}
          </main>

        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}