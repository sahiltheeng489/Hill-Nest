"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/ui/Button";
import Image from "next/image";
import HomeUserBanner from "@/app/components/user/HomeUserBanner";

const stats = [
  { value: "500+", label: "Happy Guests" },
  { value: "4.9★", label: "Average Rating" },
  { value: "3", label: "Room Types" },
  { value: "10+", label: "Years of Hospitality" },
];

export default function Hero() {
  const router = useRouter();

  const handleBookNow = useCallback(() => {
    router.push("/rooms");
  }, [router]);

  const handleCheckAvailability = useCallback(() => {
    const roomsSection = document.getElementById("rooms");

    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push("/rooms");
  }, [router]);
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png"
          alt="HillNest Homestay — A tranquil mountain retreat"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Floating decorative orbs */}
      <div className="absolute top-24 right-16 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-24 right-1/3 w-48 h-48 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="animate-fade-up" style={{ animationDelay: "0s" }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-green-300 text-xs font-semibold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-ring" />
                HillNest Homestay · Siliguri
              </span>
            </div>

            {/* Headline */}
            <h2
              className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white animate-fade-up delay-100"
            >
              A Calm Mountain Stay{" "}
              <span className="gradient-text">Near Siliguri</span>
            </h2>

            {/* Sub */}
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg animate-fade-up delay-200">
              Escape to peaceful rooms with fresh mountain air, warm hospitality,
              and breathtaking valley views — your perfect highland retreat awaits.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-start gap-4 animate-fade-up delay-300">
              <Button id="hero-book-btn" variant="primary" size="lg" onClick={handleBookNow}>
                Book Now
              </Button>
              <Button id="hero-check-btn" variant="secondary" size="lg" onClick={handleCheckAvailability}>
                Check Availability
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-400 animate-fade-up delay-400">
              {[
                { icon: "✓", text: "Free Cancellation" },
                { icon: "✓", text: "Breakfast Included" },
                { icon: "✓", text: "Panoramic Views" },
                { icon: "✓", text: "Free Wi-Fi" },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                    {icon}
                  </span>
                  <span className="text-gray-300">{text}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl animate-fade-up delay-500">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="glass rounded-2xl p-4 text-center hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <p className="text-2xl font-bold text-white font-serif">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <HomeUserBanner />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-white/70 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
