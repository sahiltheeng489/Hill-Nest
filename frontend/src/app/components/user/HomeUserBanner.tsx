"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/services/authService";

export default function HomeUserBanner() {
  const [user, setUser] = useState<{ name: string; role?: "user" | "admin" } | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = getStoredUser();
      setUser(stored ?? null);
    });
  }, []);

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const dashboardHref = user.role === "admin" ? "/admin" : "/user";

  return (
    <div className="mt-12 animate-fade-up delay-600">
      <div className="glass rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-white/14">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl border border-white/18 bg-white/14 flex items-center justify-center text-white font-bold text-lg tracking-tight backdrop-blur-xl flex-shrink-0">
          {initial}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-200 mb-1">
            Welcome back
          </p>
          <p className="text-slate-100 font-semibold text-base truncate">
            {user.name} — your profile is ready ✓
          </p>
          <p className="text-slate-300 text-xs mt-0.5">
            Manage bookings and explore rooms from your dashboard.
          </p>
        </div>

        {/* CTA */}
        <Link
          href={dashboardHref}
          className="animate-button-in flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/16 bg-white/10 text-white text-sm font-semibold backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/16 active:scale-95"
          style={{ animationDelay: "0.1s" }}
        >
          My Dashboard
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
