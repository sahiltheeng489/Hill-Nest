"use client";

import { useEffect, useRef, useState } from "react";
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
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const handleAvailSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    router.push(`/rooms${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;

    let frame = 0;

    const updateBackground = () => {
      const heroHeight = window.innerHeight * 0.55;
      const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      const panX = progress * 42;
      const panY = progress * 58;
      const scale = 1.05 + progress * 0.045;

      background.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
      background.style.filter = `brightness(${0.92 - progress * 0.06}) saturate(${1.05 + progress * 0.04})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        updateBackground();
        frame = 0;
      });
    };

    updateBackground();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-black"
    >
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform transition-[transform,filter] duration-150 ease-out"
        style={{ backgroundImage: 'url("/hero.png")' }}
      />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_28%)]" />
      </div>

      <div className="pointer-events-none absolute right-16 top-24 h-80 w-80 rounded-full bg-slate-400/8 blur-3xl animate-pulse" />

      <div className="relative z-10 w-full pb-16 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="animate-fade-up">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-teal-200">
                <span className="h-2 w-2 rounded-full bg-teal-300 animate-pulse-ring" />
                HillNest Homestay - Near Siliguri, West Bengal
              </span>
            </div>

            <h1 className="mt-6 animate-fade-up text-5xl font-black leading-tight tracking-tight text-white delay-100 md:text-6xl lg:text-7xl">
              A Calm Mountain Stay Near Siliguri
            </h1>

            <p className="mt-6 max-w-lg animate-fade-up text-lg leading-relaxed text-gray-200 delay-200">
              Panoramic valley views, farm-fresh breakfast, and warm mountain hospitality - your perfect highland retreat is just one booking away.
            </p>

            <div className="relative z-20 mt-9 flex min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:gap-4 flex-col gap-3 animate-fade-up delay-300">
              <Link
                id="hero-book-btn"
                href="/rooms"
                className="animate-button-in inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/14 px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/18 active:scale-95"
                style={{ animationDelay: "0.15s" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </Link>

              <Link
                id="hero-check-btn"
                href="/rooms"
                className="animate-button-in inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/8 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/14 active:scale-95"
                style={{ animationDelay: "0.25s" }}
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
              ].map((text, index) => (
                <span key={text} className="animate-button-in flex items-center gap-2 text-sm text-slate-300" style={{ animationDelay: `${0.32 + index * 0.06}s` }}>
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-200">
                    ✓
                  </span>
                  {text}
                </span>
              ))}
            </div>

            <div className="mt-9 animate-fade-up delay-500">
              <div className="glass inline-flex w-full max-w-xl flex-wrap items-end gap-3 rounded-2xl p-4">
                <div className="min-w-[130px] flex-1">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-teal-200">
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
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-teal-200">
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
                  className="animate-button-in inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/14 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/18 active:scale-95"
                  style={{ animationDelay: "0.55s" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  See Rooms
                </button>
              </div>
            </div>

            <HomeUserBanner />
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 animate-fade-up delay-600 sm:grid-cols-4">
            {stats.map(({ value, label }, index) => (
              <div
                key={label}
                className="glass rounded-2xl p-4 text-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${0.6 + index * 0.08}s` }}
              >
                <p className="text-2xl font-black tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 bg-white/6 pt-1.5 backdrop-blur-md">
          <div className="h-2.5 w-1 rounded-full bg-teal-200/80 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
