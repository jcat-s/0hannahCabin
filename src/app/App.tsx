import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { AboutSection } from "./components/sections/AboutSection";
import { AmenitiesSection } from "./components/sections/AmenitiesSection";
import { GallerySection } from "./components/sections/GallerySection";
import { ContactSection } from "./components/sections/ContactSection";
import { Footer } from "./components/Footer";
import { AuthProvider } from "../context/AuthContext";
import { NotificationProvider } from "../context/NotificationContext";

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

