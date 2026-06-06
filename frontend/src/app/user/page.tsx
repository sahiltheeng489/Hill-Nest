"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthUser, fetchWithAuth, getProfile, getStoredUser, logoutUser } from "@/services/authService";

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
  { icon: "🛏️", label: "Browse Rooms", desc: "Explore all available rooms", href: "/rooms", color: "from-[#04151A]/95 to-[#092828]/85", border: "border-white/10", iconBg: "bg-white/8", textColor: "text-white" },
  { icon: "📋", label: "My Bookings", desc: "View & manage your stays", href: "/bookings", color: "from-[#092828]/95 to-[#163E3C]/80", border: "border-white/10", iconBg: "bg-white/8", textColor: "text-white" },
  { icon: "🏠", label: "Go Home", desc: "Back to the main page", href: "/", color: "from-[#163E3C]/95 to-[#325F57]/75", border: "border-white/10", iconBg: "bg-white/8", textColor: "text-white" },
];

function StatCard({ value, label, icon, colorClass, delay }: { value: number; label: string; icon: string; colorClass: string; delay: string; }) {
  return (
    <div className={`dash-card rounded-2xl border ${colorClass} p-5 animate-fade-up`} style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-black tracking-tight text-gray-900 animate-count-up">{value}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  );
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [bookingStats, setBookingStats] = useState<BookingStats>({ total: 0, active: 0, cancelled: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileAndBookings = async () => {
      const stored = getStoredUser();
      if (stored) {
        if (stored.role === "admin") {
          router.replace("/admin");
          return;
        }
        setUser(stored);
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
        setError(err instanceof Error ? err.message : "Unable to load your profile");
        setStatus("error");
        router.replace("/login");
        return;
      }

      try {
        const res = await fetchWithAuth("/bookings");
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
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "?";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#04151A,#092828_48%,#04151A)] text-white">
      <div className="border-b border-white/10 bg-white/6 text-white backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/8 backdrop-blur-md transition-colors group-hover:bg-white/12"><span className="text-lg">🌿</span></div>
              <span className="text-lg font-bold">Hill<span className="text-[#6F9487]">Nest</span></span>
            </Link>
            <span className="text-lg text-white/25">/</span>
            <span className="text-sm font-medium text-white/70">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/rooms" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/12"><span>🛏️</span> Browse Rooms</Link>
            <button type="button" id="dashboard-logout-btn" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-red-500/15 hover:border-red-300/20"><span>→</span> Logout</button>
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
          <div className="rounded-3xl border border-red-300/15 bg-red-500/10 p-8 text-center animate-fade-up backdrop-blur-md">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-3 text-xl font-bold text-red-100">Could not load profile</h2>
            <p className="mt-2 text-sm text-red-100/80">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-red-500/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500/30">Try Again</button>
          </div>
        )}

        {status === "ready" && user && (
          <div className="space-y-7">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(4,21,26,0.92),rgba(9,40,40,0.72))] shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl animate-fade-up">
              <div className="h-2 bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487]" />
              <div className="p-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#163E3C] to-[#6F9487] text-3xl font-bold tracking-tight text-white shadow-lg">{initials}</div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#04151A] bg-[#6F9487]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">{user.role}</span>
                    <span className="text-xs text-white/35">· Active member</span>
                  </div>
                  <h1 className="truncate text-2xl font-black tracking-tight text-white">Welcome back, {user.name}!</h1>
                  <p className="mt-0.5 text-sm text-white/55">{user.email}</p>
                </div>

                <Link href="/rooms" id="dashboard-book-btn" className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Book a Room
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard value={bookingStats.total} label="Total Bookings" icon="📊" colorClass="border-white/10 bg-white/8 backdrop-blur-md" delay="0.1s" />
              <StatCard value={bookingStats.active} label="Active Stays" icon="🛏️" colorClass="border-white/10 bg-white/8 backdrop-blur-md" delay="0.2s" />
              <StatCard value={bookingStats.cancelled} label="Cancelled" icon="✕" colorClass="border-white/10 bg-white/8 backdrop-blur-md" delay="0.3s" />
            </div>

            <div className="animate-fade-up delay-300">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/45">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map(({ icon, label, desc, href, color, border, iconBg, textColor }) => (
                  <Link key={label} href={href} className={`dash-card group flex items-start gap-4 rounded-2xl border ${border} bg-gradient-to-br ${color} p-5 transition-all duration-300 hover:bg-white/10`}>
                    <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
                    <div>
                      <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
                      <p className="mt-0.5 text-xs text-white/45">{desc}</p>
                    </div>
                    <svg className={`w-4 h-4 ml-auto mt-0.5 ${textColor} opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/8 p-7 shadow-[0_18px_50px_rgba(2,6,23,0.16)] backdrop-blur-2xl animate-fade-up delay-400">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold tracking-tight text-white">Recent Bookings</h2>
                <Link href="/bookings" className="text-sm font-semibold text-[#6F9487] transition-colors hover:text-white hover:underline underline-offset-2">View all →</Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl">🏡</span>
                  <p className="mt-3 text-sm text-white/50">No bookings yet.</p>
                  <Link href="/rooms" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#163E3C] via-[#325F57] to-[#6F9487] px-5 py-2.5 text-sm font-semibold text-white transition-colors">Explore Rooms</Link>
                </div>
              ) : (
                <div className="divide-y divide-white/8">
                  {recentBookings.map((booking, i) => (
                    <div key={booking._id} className="py-4 flex items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-lg backdrop-blur-md">🛏️</div>
                        <div>
                          <p className="text-sm font-semibold text-white">{booking.room?.name ?? "Room"}</p>
                          <p className="mt-0.5 text-xs text-white/45">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} {" → "} {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${booking.status === "cancelled" ? "border-red-300/20 bg-red-500/10 text-red-100" : "border-white/10 bg-white/8 text-white/80"}`}>{booking.status ?? "confirmed"}</span>
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
