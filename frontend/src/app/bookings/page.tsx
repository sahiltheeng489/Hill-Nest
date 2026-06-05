"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Container from "@/app/components/ui/ui/Container";
import PaymentButton from "@/app/components/ui/payment/PaymentButton";
import { buildApiUrl } from "@/services/api";
import { getStoredUser, getToken } from "@/services/authService";

// ── Types ─────────────────────────────────────────────────────────────────────
type Room = {
  _id: string;
  name: string;
  price: number;
};

type Booking = {
  _id: string;
  room: Room | null;
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status?: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  payment?: {
    razorpayPaymentId?: string;
    amount?: number;
    status?: string;
  };
};

type BookingForm = {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const nightsBetween = (from: string, to: string): number => {
  if (!from || !to) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / msPerDay));
};

const getStatusClasses = (status: Booking["status"]) => {
  if (status === "confirmed") return "bg-blue-50 text-blue-700 border-blue-100";
  if (status === "cancelled") return "bg-red-50 text-red-700 border-red-100";
  return "bg-amber-50 text-amber-700 border-amber-100";
};

// ── Main page content ─────────────────────────────────────────────────────────
function BookingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const queryString = searchParams.toString();
  const loginRedirectPath = `/bookings${queryString ? `?${queryString}` : ""}`;
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("Please login to view your bookings.");

  // Booking form
  const [room, setRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<BookingForm>({
    name: "",
    email: "",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: searchParams.get("guests") || "1",
  });
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "active" | "cancelled">("all");

  // ── Auth init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const nextToken = getToken();
    const storedUser = getStoredUser();

    if (!nextToken) {
      queueMicrotask(() => {
        setError("Please login to view your bookings.");
        setLoading(false);
      });
      router.replace(`/login?next=${encodeURIComponent(loginRedirectPath)}`);
      return;
    }

    queueMicrotask(() => {
      setToken(nextToken);
      if (storedUser) {
        setForm((prev) => ({
          ...prev,
          name: prev.name || storedUser.name,
          email: prev.email || storedUser.email,
        }));
      }
      setAuthReady(true);
    });
  }, [loginRedirectPath, router]);

  // ── Fetch room details ───────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    fetch(buildApiUrl(`/rooms/${roomId}`))
      .then((res) => res.json())
      .then((data: Room) => setRoom(data))
      .catch(() => setFormError("Could not load room details."));
  }, [roomId]);

  // ── Fetch bookings list ──────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    const res = await fetch(buildApiUrl("/bookings"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    const data: Booking[] = await res.json();
    setBookings(data);
  }, [token]);

  useEffect(() => {
    if (!authReady || !token) return;
    queueMicrotask(() => {
      void fetchBookings()
        .catch(() => setError("Could not load bookings. Please ensure backend is running."))
        .finally(() => setLoading(false));
    });
  }, [authReady, fetchBookings, token]);

  // ── Form field change ────────────────────────────────────────────────────
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  // ── Validate form before opening payment modal ───────────────────────────
  // ── Cancel booking ───────────────────────────────────────────────────────
  const cancelBooking = async (bookingId: string) => {
    if (!token) return;
    setActionError("");
    setCancellingId(bookingId);
    try {
      const response = await fetch(buildApiUrl(`/bookings/${bookingId}/cancel`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setActionError(data.message || "Could not cancel booking.");
        return;
      }
      await fetchBookings();
    } catch {
      setActionError("Could not connect to backend.");
    } finally {
      setCancellingId(null);
    }
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalBookings = bookings.length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const activeBookings = totalBookings - cancelledBookings;
  const visibleBookings = bookings.filter((b) => {
    const s = b.status || "pending";
    if (viewFilter === "active") return s !== "cancelled";
    if (viewFilter === "cancelled") return s === "cancelled";
    return true;
  });

  const nights = nightsBetween(form.checkIn, form.checkOut);

  // Payment payload passed to PaymentButton
  const bookingPayload = {
    room: roomId ?? "",
    name: form.name,
    email: form.email,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guests: Number(form.guests),
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24">
        <Container>
          <section className="py-14">

            {/* ── Booking Form (only when coming from Book Now) ─────────── */}
            {roomId && (
              <div className="mb-14">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => router.push("/rooms")}
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to Rooms
                </button>

                <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
                <p className="text-sm text-gray-500 mt-2">
                  {room ? `You are booking: ${room.name}` : "Loading room details…"}
                </p>

                {/* Room pill */}
                {room && (
                  <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-2.5">
                    <span className="text-green-700 font-semibold text-sm">{room.name}</span>
                    <span className="text-green-600 text-sm">₹{typeof room.price === "number" ? room.price.toLocaleString("en-IN") : "N/A"} / night</span>
                  </div>
                )}

                {/* Form error */}
                {formError && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {formError}
                  </div>
                )}

                {/* Booking form */}
                <div className="mt-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-2xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                      <input
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in</label>
                      <input
                        name="checkIn"
                        type="date"
                        value={form.checkIn}
                        onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-out</label>
                      <input
                        name="checkOut"
                        type="date"
                        value={form.checkOut}
                        onChange={onChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Guests</label>
                    <select
                      name="guests"
                      value={form.guests}
                      onChange={onChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 transition"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PaymentButton — validates form then opens Razorpay modal */}
                  {room ? (
                    <PaymentButton
                      bookingPayload={bookingPayload}
                      nights={nights}
                      pricePerNight={room.price}
                      disabled={nights <= 0}
                      onSuccess={() => {
                        router.replace("/bookings");
                      }}
                      onError={(msg) => setFormError(msg)}
                    />
                  ) : (
                    <div className="h-[140px] animate-pulse rounded-2xl bg-gray-100" />
                  )}

                  {nights > 0 && room && (
                    <p className="text-xs text-center text-gray-400">
                      {nights} night{nights !== 1 ? "s" : ""} · {formatDate(form.checkIn)} → {formatDate(form.checkOut)}
                    </p>
                  )}
                </div>

                <hr className="mt-14 border-gray-100" />
              </div>
            )}

            {/* ── Page heading ───────────────────────────────────────────── */}
            {!roomId ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-sm text-gray-500 mt-2">All bookings created from your account.</p>
              </>
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
            )}

            {/* ── States ────────────────────────────────────────────────── */}
            {loading && <p className="mt-8 text-gray-500">Loading bookings…</p>}
            {error && <p className="mt-8 text-red-600">{error}</p>}
            {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}

            {!loading && !error && bookings.length === 0 && (
              <p className="mt-8 text-gray-500">No bookings yet.</p>
            )}

            {/* ── Bookings list ──────────────────────────────────────────── */}
            {!loading && !error && bookings.length > 0 && (
              <>
                {/* Stats */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Total: {totalBookings}
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Active: {activeBookings}
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                    Cancelled: {cancelledBookings}
                  </span>
                </div>

                {/* Filter tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All bookings" },
                    { id: "active", label: "Active only" },
                    { id: "cancelled", label: "Cancelled only" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setViewFilter(filter.id as "all" | "active" | "cancelled")}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        viewFilter === filter.id
                          ? "border-green-700 bg-green-700 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-700"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Booking cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {visibleBookings.map((booking) => {
                    const bookingStatus = booking.status || "pending";
                    const bookingNights = nightsBetween(booking.checkIn, booking.checkOut);
                    return (
                      <article
                        key={booking._id}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-lg font-semibold text-gray-900">
                            {booking.room?.name || "Room unavailable"}
                          </h2>
                          <span
                            className={`inline-flex flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(bookingStatus)}`}
                          >
                            {bookingStatus}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                          {booking.name} · {booking.email}
                        </p>

                        <div className="mt-4 text-sm text-gray-700 space-y-1">
                          <p>Check-in: <span className="font-medium">{formatDate(booking.checkIn)}</span></p>
                          <p>Check-out: <span className="font-medium">{formatDate(booking.checkOut)}</span></p>
                          <p>Guests: {booking.guests} · {bookingNights} night{bookingNights !== 1 ? "s" : ""}</p>
                          {booking.room && (
                            <p className="font-semibold text-green-700">
                              Total: {typeof booking.room.price === "number" ? `₹${(booking.room.price * bookingNights).toLocaleString("en-IN")}` : "N/A"}
                            </p>
                          )}
                        </div>

                        {/* Payment badge */}
                        {booking.payment?.status === "paid" && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Payment Confirmed
                          </div>
                        )}

                        <p className="mt-3 text-xs text-gray-400">
                          Booked on {formatDate(booking.createdAt)}
                        </p>

                        {bookingStatus !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {cancellingId === booking._id ? "Cancelling…" : "Cancel Booking"}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>

                {visibleBookings.length === 0 && (
                  <p className="mt-6 text-sm text-gray-500">No bookings found for this filter.</p>
                )}
              </>
            )}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24" />}>
      <BookingsPageContent />
    </Suspense>
  );
}
