import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Hero from "@/app/sections/Hero";
import Rooms from "@/app/sections/Rooms";
import Amenities from "@/app/sections/Amenities";
import GalleryAndTestimonials from "@/app/sections/GalleryAndTestimonials";
import WhatsAppButton from "@/app/components/ui/ui/WhatsAppButton";
import ChatBot from "@/app/components/ui/ui/ChatBot";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-gray-900">
        <div className="overflow-x-hidden">
          <Hero />
          <Rooms />
          <Amenities />
          <GalleryAndTestimonials />
          <Footer />
        </div>
      </main>

      {/* Floating widgets */}
      <WhatsAppButton />
      <ChatBot />
    </>
  );
}

