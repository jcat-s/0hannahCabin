import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { FeaturesSection } from "./components/sections/FeaturesSection";
import { AboutSection } from "./components/sections/AboutSection";
import { AmenitiesSection } from "./components/sections/AmenitiesSection";
import { GallerySection } from "./components/sections/GallerySection";
import { ContactSection } from "./components/sections/ContactSection";
import { Footer } from "./components/Footer";
import { BookingModal } from "./components/BookingModal";

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header onBookClick={() => setIsBookingModalOpen(true)} />
      
      <main>
        <HeroSection onBookClick={() => setIsBookingModalOpen(true)} />
        <FeaturesSection />
        <AboutSection />
        <AmenitiesSection />
        <GallerySection />
        <ContactSection />
      </main>

      <Footer />

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
}
