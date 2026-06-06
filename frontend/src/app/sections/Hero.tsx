"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeUserBanner from "@/app/components/user/HomeUserBanner";

const stats = [
  { value: "500+", label: "Happy Guests" },
  { value: "4.9/5", label: "Avg Rating" },
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/hero.png")' }}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="pointer-events-none absolute right-16 top-24 h-80 w-80 rounded-full bg-green-400/8 blur-3xl animate-pulse" />

      <div className="relative z-10 w-full pb-16 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="animate-fade-up">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse-ring" />
                HillNest Homestay - Near Siliguri, West Bengal
              </span>
            </div>

            <h1 className="mt-6 animate-fade-up font-serif text-5xl font-bold leading-tight text-white delay-100 md:text-6xl lg:text-7xl">
              A Calm Mountain Stay{" "}
              <span className="gradient-text">Near Siliguri</span>
            </h1>

            <p className="mt-6 max-w-lg animate-fade-up text-lg leading-relaxed text-gray-200 delay-200">
              Panoramic valley views, farm-fresh breakfast, and warm mountain hospitality - your perfect highland retreat is just one booking away.
            </p>

            <div className="relative z-20 mt-9 flex min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:gap-4 flex-col gap-3 animate-fade-up delay-300">
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

            <div className="mt-7 flex flex-wrap items-center gap-5 animate-fade-up delay-400">
              {[
                "Free Cancellation",
                "Breakfast Included",
                "Panoramic Views",
                "Free Wi-Fi",
              ].map((text) => (
                <span key={text} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">
                    OK
                  </span>
                  {text}
                </span>
              ))}
            </div>

            <div className="mt-9 animate-fade-up delay-500">
              <div className="glass inline-flex w-full max-w-xl flex-wrap items-end gap-3 rounded-2xl p-4">
                <div className="min-w-[130px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-green-300">
                    Check-in
                  </label>
                  <input
                    type="date"
                    id="hero-checkin"
                    value={checkIn}
                    min={today}
                    onChange={(event) => setCheckIn(event.target.value)}
                    className="avail-input"
                  />
                </div>
                <div className="min-w-[130px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-green-300">
                    Check-out
                  </label>
                  <input
                    type="date"
                    id="hero-checkout"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(event) => setCheckOut(event.target.value)}
                    className="avail-input"
                  />
                </div>
                <button
                  id="hero-avail-btn"
                  onClick={handleAvailSearch}
                  className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/25 transition-all duration-200 hover:scale-105 hover:bg-green-400 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  See Rooms
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 animate-fade-up delay-600 sm:grid-cols-4">
            {stats.map(({ value, label }, index) => (
              <div
                key={label}
                className="glass rounded-2xl p-4 text-center transition-transform duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${0.6 + index * 0.08}s` }}
              >
                <p className="font-serif text-2xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <HomeUserBanner />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 pt-1.5">
          <div className="h-2.5 w-1 rounded-full bg-white/70 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
