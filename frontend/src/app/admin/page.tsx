"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Container from "@/app/components/ui/ui/Container";
import { buildApiUrl } from "@/services/api";
import { AuthUser, getProfile, getStoredUser, getToken, logoutUser } from "@/services/authService";

type Room = {
  _id: string;
  name: string;
  price: number;
  available?: boolean;
  roomType?: string;
};

type Booking = {
  _id: string;
  room?: Room | null;
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status?: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p className="mt-3 font-serif text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{helper}</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAdminDashboard = async () => {
      const stored = getStoredUser();
      if (!stored) {
        router.replace("/login?next=/admin");
        return;
      }

      if (stored.role !== "admin") {
        router.replace("/user");
        return;
      }

      setUser(stored);

      try {
        const profile = await getProfile();
        if (!isMounted) return;

        if (!profile?.user) {
          throw new Error("Unable to load your profile");
        }

        if (profile.user.role !== "admin") {
          router.replace("/user");
          return;
        }

        setUser(profile.user);

        const token = getToken();
        if (!token) {
          throw new Error("You must be logged in to view the admin dashboard");
        }

        const [roomsRes, bookingsRes] = await Promise.all([
          fetch(buildApiUrl("/rooms")),
          fetch(buildApiUrl("/bookings"), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!isMounted) return;

        const roomsData: Room[] = roomsRes.ok ? await roomsRes.json() : [];
        const bookingsData: Booking[] = bookingsRes.ok ? await bookingsRes.json() : [];

        setRooms(roomsData);
        setBookings(bookingsData);
        setStatus("ready");
      } catch (currentError) {
        if (!isMounted) return;
        setError(currentError instanceof Error ? currentError.message : "Unable to load admin dashboard");
        setStatus("error");
      }
    };

    void loadAdminDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const metrics = useMemo(() => {
    const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");
    const pendingBookings = bookings.filter((booking) => booking.status === "pending");
    const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled");
    const availableRooms = rooms.filter((room) => room.available !== false);
    const estimatedRevenue = confirmedBookings.reduce((sum, booking) => {
      if (!booking.room?.price) return sum;
      const checkIn = new Date(booking.checkIn).getTime();
      const checkOut = new Date(booking.checkOut).getTime();
      const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      return sum + booking.room.price * nights;
    }, 0);

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      pendingBookings: pendingBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRooms: rooms.length,
      availableRooms: availableRooms.length,
      estimatedRevenue,
    };
  }, [bookings, rooms]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f5f7f5] pt-24">
        <Container>
          <section className="py-12">
            <div className="rounded-[2rem] border border-gray-100 bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 p-8 text-white shadow-xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Admin Panel</p>
                  <h1 className="mt-3 font-serif text-4xl font-bold">Control center for HillNest</h1>
                  <p className="mt-3 max-w-2xl text-sm text-emerald-50/80">
                    Review booking activity, room inventory, and the current operating snapshot for the property.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/bookings"
                    className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    View all bookings
                  </Link>
                  <Link
                    href="/rooms"
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Browse rooms
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-red-300 hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {user ? (
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-emerald-50/80">
                  <span className="rounded-full bg-white/10 px-3 py-1">{user.name}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">{user.email}</span>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">Role: {user.role}</span>
                </div>
              ) : null}
            </div>

            {status === "loading" && (
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton h-32 rounded-3xl" />
                ))}
              </div>
            )}

            {status === "error" && (
              <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
                <p className="text-lg font-semibold">Unable to load admin dashboard</p>
                <p className="mt-2 text-sm">{error}</p>
              </div>
            )}

            {status === "ready" && (
              <>
                <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Bookings"
                    value={String(metrics.totalBookings)}
                    helper={`${metrics.confirmedBookings} confirmed · ${metrics.pendingBookings} pending`}
                  />
                  <StatCard
                    label="Rooms"
                    value={String(metrics.totalRooms)}
                    helper={`${metrics.availableRooms} available right now`}
                  />
                  <StatCard
                    label="Revenue"
                    value={`₹${metrics.estimatedRevenue.toLocaleString("en-IN")}`}
                    helper="Estimated from confirmed bookings"
                  />
                  <StatCard
                    label="Cancellations"
                    value={String(metrics.cancelledBookings)}
                    helper="Monitor churn and follow-up needs"
                  />
                </div>

                <div className="mt-10 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-gray-900">Recent bookings</h2>
                        <p className="mt-1 text-sm text-gray-500">Admin view of the latest guest activity.</p>
                      </div>
                      <Link
                        href="/bookings"
                        className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
                      >
                        Open bookings
                      </Link>
                    </div>

                    <div className="mt-6 space-y-4">
                      {bookings.slice(0, 6).map((booking) => (
                        <article
                          key={booking._id}
                          className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{booking.room?.name || "Room unavailable"}</p>
                              <p className="mt-1 text-sm text-gray-500">{booking.name} · {booking.email}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700"
                                : booking.status === "cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}>
                              {booking.status || "pending"}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>Check-in: {new Date(booking.checkIn).toLocaleDateString("en-IN")}</span>
                            <span>Check-out: {new Date(booking.checkOut).toLocaleDateString("en-IN")}</span>
                            <span>Guests: {booking.guests}</span>
                          </div>
                        </article>
                      ))}
                      {bookings.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                          No bookings yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h2 className="font-serif text-2xl font-bold text-gray-900">Room inventory</h2>
                      <p className="mt-1 text-sm text-gray-500">Quick scan of room status and price points.</p>
                      <div className="mt-5 space-y-3">
                        {rooms.slice(0, 6).map((room) => (
                          <div key={room._id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900">{room.name}</p>
                              <p className="text-xs text-gray-500">{room.roomType || "Standard"} · ₹{room.price.toLocaleString("en-IN")}/night</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              room.available === false ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {room.available === false ? "Unavailable" : "Available"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                      <h2 className="font-serif text-2xl font-bold text-gray-900">Actions</h2>
                      <div className="mt-5 grid gap-3">
                        <Link
                          href="/bookings"
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-400 hover:text-green-700"
                        >
                          Review reservation queue
                        </Link>
                        <Link
                          href="/rooms"
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-400 hover:text-green-700"
                        >
                          Check room catalog
                        </Link>
                        <Link
                          href="/"
                          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-400 hover:text-green-700"
                        >
                          Return to homepage
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
