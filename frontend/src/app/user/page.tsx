"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { buildApiUrl } from "@/services/api";
import { AuthUser, getProfile, getStoredUser, getToken, logoutUser, saveAuth } from "@/services/authService";

type BookingStats = {
  total: number;
  active: number;
  cancelled: number;
};

type Booking = {
  _id: string;
  room?: { name?: string };
  checkIn?: string;
  checkOut?: string;
  status?: string;
  guests?: number;
};

const quickActions = [
  { icon: "🛏️", label: "Browse Rooms", desc: "Explore all available rooms", href: "/rooms", color: "from-green-50 to-emerald-50", border: "border-green-100", iconBg: "bg-green-100", textColor: "text-green-700" },
  { icon: "📋", label: "My Bookings", desc: "View & manage your stays", href: "/bookings", color: "from-blue-50 to-indigo-50", border: "border-blue-100", iconBg: "bg-blue-100", textColor: "text-blue-700" },
  { icon: "🏠", label: "Go Home", desc: "Back to the main page", href: "/", color: "from-amber-50 to-orange-50", border: "border-amber-100", iconBg: "bg-amber-100", textColor: "text-amber-700" },
];

function StatCard({ value, label, icon, colorClass, delay }: { value: number; label: string; icon: string; colorClass: string; delay: string; }) {
  return (
    <div className={`dash-card rounded-2xl border ${colorClass} p-5 animate-fade-up`} style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-extrabold text-gray-900 font-serif animate-count-up">{value}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  );
}

function UserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [bookingStats, setBookingStats] = useState<BookingStats>({ total: 0, active: 0, cancelled: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileAndBookings = async () => {
      const authToken = searchParams.get("authToken");
      const authUser = searchParams.get("authUser");

      if (authToken && authUser) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(authUser)) as AuthUser;
          saveAuth({ token: authToken, user: parsedUser });
          if (parsedUser.role === "admin") {
            router.replace("/admin");
            return;
          }
          setUser(parsedUser);
          setStatus("ready");
          window.history.replaceState(null, "", "/user");
        } catch {
          setError("Login succeeded, but the dashboard session could not be restored.");
        }
      }

      const stored = getStoredUser();
      const initialToken = getToken();
      if (stored) {
        if (stored.role === "admin") {
          router.replace("/admin");
          return;
        }
        setUser(stored);
        setStatus("ready");
      } else if (initialToken) {
        setStatus("ready");
      }

      try {
        const data = await getProfile();
        if (!isMounted) return;

        if (data?.user) {
          if (data.user.role === "admin") {
            router.replace("/admin");
            return;
          }
          setUser(data.user);
        }
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;

        if (stored || initialToken) {
          setStatus("ready");
        } else {
          setError(err instanceof Error ? err.message : "Unable to load your profile");
          setStatus("error");
          router.replace("/login");
          return;
        }
      }

      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(buildApiUrl("/bookings"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookings: Booking[] = res.ok ? await res.json() : [];
        if (!isMounted) return;

        const total = bookings.length;
        const cancelled = bookings.filter((b) => b.status === "cancelled").length;
        setBookingStats({ total, cancelled, active: total - cancelled });
        setRecentBookings(bookings.slice(0, 3));
      } catch {
        if (!isMounted) return;
        setBookingStats({ total: 0, active: 0, cancelled: 0 });
      }
    };

    void loadProfileAndBookings();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "?";

  return (
    <main className="min-h-screen bg-[#f5f7f5]">
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors"><span className="text-lg">🌿</span></div>
              <span className="font-bold text-lg">Hill<span className="text-green-300">Nest</span></span>
            </Link>
            <span className="text-white/30 text-lg">/</span>
            <span className="text-sm text-white/70 font-medium">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/rooms" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all duration-200 border border-white/20"><span>🛏️</span> Browse Rooms</Link>
            <button type="button" id="dashboard-logout-btn" onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/50 text-white text-sm font-semibold transition-all duration-200"><span>→</span> Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {status === "loading" && (
          <div className="space-y-6">
            <div className="skeleton h-32 rounded-3xl" />
            <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
            <div className="skeleton h-48 rounded-3xl" />
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center animate-fade-up">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-3 text-xl font-bold text-red-700">Could not load profile</h2>
            <p className="mt-2 text-sm text-red-500">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Try Again</button>
          </div>
        )}

        {status === "ready" && user && (
          <div className="space-y-7">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
              <div className="h-2 bg-gradient-to-r from-green-700 via-emerald-500 to-green-400" />
              <div className="p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-green-900/20 font-serif">{initials}</div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">{user.role}</span>
                    <span className="text-xs text-gray-400">· Active member</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 font-serif truncate">Welcome back, {user.name}!</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                </div>

                <Link href="/rooms" id="dashboard-book-btn" className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white text-sm font-semibold shadow-md shadow-green-900/20 hover:from-green-700 hover:to-emerald-500 hover:shadow-green-900/30 hover:scale-105 active:scale-95 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Book a Room
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard value={bookingStats.total} label="Total Bookings" icon="📊" colorClass="border-gray-100 bg-white" delay="0.1s" />
              <StatCard value={bookingStats.active} label="Active Stays" icon="🟢" colorClass="border-green-100 bg-green-50" delay="0.2s" />
              <StatCard value={bookingStats.cancelled} label="Cancelled" icon="🔴" colorClass="border-red-100 bg-red-50" delay="0.3s" />
            </div>

            <div className="animate-fade-up delay-300">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map(({ icon, label, desc, href, color, border, iconBg, textColor }) => (
                  <Link key={label} href={href} className={`dash-card group flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br ${color} border ${border} hover:shadow-md transition-all duration-300`}>
                    <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
                    <div>
                      <p className={`font-semibold text-sm ${textColor}`}>{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <svg className={`w-4 h-4 ml-auto mt-0.5 ${textColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 animate-fade-up delay-400">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 text-lg font-serif">Recent Bookings</h2>
                <Link href="/bookings" className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline underline-offset-2 transition-colors">View all →</Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl">🏡</span>
                  <p className="mt-3 text-gray-500 text-sm">No bookings yet.</p>
                  <Link href="/rooms" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors">Explore Rooms</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentBookings.map((booking, i) => (
                    <div key={booking._id} className="py-4 flex items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-lg flex-shrink-0">🛏️</div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{booking.room?.name ?? "Room"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} {" → "} {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${booking.status === "cancelled" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>{booking.status ?? "confirmed"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function UserPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f5f7f5]" />}>
      <UserDashboard />
    </Suspense>
  );
}
