"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HomeUserBanner from "@/app/components/user/HomeUserBanner";

const stats = [
  { value: "500+", label: "Happy Guests" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "3", label: "Room Types" },
  { value: "10+", label: "Years" },
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/48 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      </div>

      {/* Decorative orbs */}
      <div className="absolute top-24 right-16 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-24 right-1/3 w-56 h-56 bg-emerald-300/8 rounded-full blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-green-300 text-xs font-semibold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-ring" />
                HillNest Homestay · Siliguri
              </span>
            </div>

            {/* Headline */}
            <h2 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white animate-fade-up delay-100">
              A Calm Mountain Stay{" "}
              <span className="gradient-text">Near Siliguri</span>
            </h2>

            {/* Subtext */}
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg animate-fade-up delay-200">
              Escape to peaceful rooms with fresh mountain air, warm hospitality,
              and breathtaking valley views — your perfect highland retreat awaits.
            </p>

            {/* ── CTA Buttons — side by side, consistent palette ── */}
            <div className="mt-9 flex flex-wrap items-center gap-4 animate-fade-up delay-300">
              {/* Primary: solid green gradient */}
              <button
                id="hero-book-btn"
                onClick={handleBookNow}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-700 to-emerald-500 text-white font-semibold text-base shadow-xl shadow-green-900/30 hover:from-green-600 hover:to-emerald-400 hover:shadow-green-900/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </button>

              {/* Secondary: white outline on dark bg */}
              <button
                id="hero-check-btn"
                onClick={handleCheckAvailability}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/60 text-white font-semibold text-base backdrop-blur-sm hover:bg-white hover:text-green-800 hover:border-white hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                Check Availability
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-9 flex flex-wrap items-center gap-5 animate-fade-up delay-400">
              {[
                "Free Cancellation",
                "Breakfast Included",
                "Panoramic Views",
                "Free Wi-Fi",
              ].map((text) => (
                <span key={text} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">
                    ✓
                  </span>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl animate-fade-up delay-500">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="glass rounded-2xl p-4 text-center hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
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
