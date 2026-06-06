import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Hero from "@/app/sections/Hero";
import Rooms from "@/app/sections/Rooms";
import Amenities from "@/app/sections/Amenities";
import GalleryAndTestimonials from "@/app/sections/GalleryAndTestimonials";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_32%),linear-gradient(180deg,#08111e_0%,#0b1220_56%,#050816_100%)] text-slate-100">
        <div className="overflow-x-hidden">
          <Hero />
          <Rooms />
          <Amenities />
          <GalleryAndTestimonials />
          <Footer />
        </div>
      </main>
    </>
  );
}
