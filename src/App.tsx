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

import { AuthProvider } from "./shared/context/AuthContext";
import { NotificationProvider } from "./shared/context/NotificationContext";

export default function App() {
  const [activePage, setActivePage] = useState<"home" | "auth" | "booking">("home");

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen">
          {activePage === "home" && (
            <Header
              onBookClick={() => setActivePage("booking")}
              onAuthClick={() => setActivePage("auth")}
            />
          )}

          <main>
            {activePage === "home" && (
              <>
                <HeroSection onBookClick={() => setActivePage("booking")} />
                <AboutSection />
                <AmenitiesSection />
                <GallerySection />
                <ContactSection />
              </>
            )}
            {activePage === "auth" && (
              <div className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-100 min-h-screen">
                <AuthPage onBack={() => setActivePage("home")} />
              </div>
            )}
            {activePage === "booking" && (
              <BookingPage
                onBack={() => setActivePage("home")}
                onRequireAuth={() => setActivePage("auth")}
              />
            )}
          </main>

          {activePage === "home" && <Footer />}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

