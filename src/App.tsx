import { useState } from "react";
import { Header } from "./user-site/components/Header";
import { Footer } from "./user-site/components/Footer";

import { HeroSection } from "./user-site/sections/HeroSection";
import { AboutSection } from "./user-site/sections/AboutSection";
import { AmenitiesSection } from "./user-site/sections/AmenitiesSection";
import { GallerySection } from "./user-site/sections/GallerySection";
import { ContactSection } from "./user-site/sections/ContactSection";

import { AuthProvider } from "./shared/context/AuthContext"
import { NotificationProvider } from "./shared/context/NotificationContext"

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen">
          <Header onBookClick={() => setIsBookingModalOpen(true)} />

          <main>
            <HeroSection onBookClick={() => setIsBookingModalOpen(true)} />
            <AboutSection />
            <AmenitiesSection />
            <GallerySection />
            <ContactSection />
          </main>

          <Footer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

