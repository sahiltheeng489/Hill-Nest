"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleAvailSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.push(`/rooms${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // Compute today's date for min date on check-in
  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.png"
          alt="HillNest Homestay — A tranquil mountain retreat near Siliguri"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Single subtle decorative orb */}
      <div className="absolute top-24 right-16 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-green-300 text-xs font-semibold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-ring" />
                HillNest Homestay · Near Siliguri, West Bengal
              </span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white animate-fade-up delay-100">
              A Calm Mountain Stay{" "}
              <span className="gradient-text">Near Siliguri</span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-lg text-gray-200 leading-relaxed max-w-lg animate-fade-up delay-200">
              Panoramic valley views, farm-fresh breakfast, and warm mountain hospitality — your perfect highland retreat is just one booking away.
            </p>

            {/* CTA Buttons */}
            <div className="relative z-20 mt-9 flex flex-col gap-3 animate-fade-up delay-300 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:gap-4">
              <Link
                id="hero-book-btn"
                href="/rooms"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-700 to-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-green-900/30 transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-400 hover:shadow-green-900/40 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </Link>

              <Link
                id="hero-check-btn"
                href="/rooms"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/60 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white hover:bg-white hover:text-green-800 active:scale-95"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                Browse Rooms
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap items-center gap-5 animate-fade-up delay-400">
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

            {/* ── Availability Widget ── */}
            <div className="mt-9 animate-fade-up delay-500">
              <div className="glass rounded-2xl p-4 inline-flex flex-wrap items-end gap-3 w-full max-w-xl">
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-xs text-green-300 font-semibold mb-1.5 uppercase tracking-wide">Check-in</label>
                  <input
                    type="date"
                    id="hero-checkin"
                    value={checkIn}
                    min={today}
                    onChange={e => setCheckIn(e.target.value)}
                    className="avail-input"
                  />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-xs text-green-300 font-semibold mb-1.5 uppercase tracking-wide">Check-out</label>
                  <input
                    type="date"
                    id="hero-checkout"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={e => setCheckOut(e.target.value)}
                    className="avail-input"
                  />
                </div>
                <button
                  id="hero-avail-btn"
                  onClick={handleAvailSearch}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-green-900/25"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  See Rooms
                </button>
              </div>
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl animate-fade-up delay-600">
            {stats.map(({ value, label }, i) => (
              <div
                key={label}
                className="glass rounded-2xl p-4 text-center hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${0.6 + i * 0.08}s` }}
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
