"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Container from "@/app/components/ui/ui/Container";
import Button from "@/app/components/ui/ui/Button";
import { getStoredUser, getToken } from "@/services/authService";

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
  createdAt: string;
};

type BookingForm = {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking form state (shown when roomId is present)
  const storedUser = getStoredUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<BookingForm>({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: searchParams.get("guests") || "1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ─── Fetch selected room details ──────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    fetch(`${apiBaseUrl}/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data: Room) => setRoom(data))
      .catch(() => setFormError("Could not load selected room details."));
  }, [apiBaseUrl, roomId]);

  // ─── Fetch user bookings ──────────────────────────────────────────────────
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setError("Please login to view your bookings.");
      setLoading(false);
      router.push("/login");
      return;
    }

    fetch(`${apiBaseUrl}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data: Booking[]) => setBookings(data))
      .catch(() => setError("Could not load bookings. Please ensure backend is running."))
      .finally(() => setLoading(false));
  }, [apiBaseUrl, router]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Submit booking form ──────────────────────────────────────────────────
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();

    if (!roomId) {
      setFormError("Missing room id. Please go back and select a room.");
      return;
    }

    if (!token) {
      setFormError("Please login first to create a booking.");
      router.push("/login");
      return;
    }

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setFormError("Check-out must be after check-in.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room: roomId,
          name: form.name,
          email: form.email,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guests: Number(form.guests),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Booking failed.");
      } else {
        // Refresh the page without the roomId param to show the updated list
        router.replace("/bookings");
      }
    } catch {
      setFormError("Could not connect to backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24">
        <Container>
          <section className="py-14">

            {/* ── Booking Form (shown only when a roomId is present) ──────── */}
            {roomId && (
              <div className="mb-14">
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

                {room && (
                  <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-2.5">
                    <span className="text-green-700 font-semibold text-sm">{room.name}</span>
                    <span className="text-green-600 text-sm">₹{room.price} / night</span>
                  </div>
                )}

                {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

                <form
                  onSubmit={onSubmit}
                  className="mt-6 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-in</label>
                      <input
                        name="checkIn"
                        type="date"
                        value={form.checkIn}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Check-out</label>
                      <input
                        name="checkOut"
                        type="date"
                        value={form.checkOut}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <select
                    name="guests"
                    value={form.guests}
                    onChange={onChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:border-green-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>

                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? "Submitting…" : "Confirm Booking"}
                  </Button>
                </form>

                <hr className="mt-14 border-gray-100" />
              </div>
            )}

            {/* ── Bookings History ────────────────────────────────────────── */}
            {!roomId && (
              <>
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-sm text-gray-500 mt-2">All bookings created from your account.</p>
              </>
            )}

            {roomId && (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h2>
            )}

            {loading ? <p className="mt-8 text-gray-500">Loading bookings…</p> : null}
            {error ? <p className="mt-8 text-red-600">{error}</p> : null}

            {!loading && !error && bookings.length === 0 ? (
              <p className="mt-8 text-gray-500">No bookings yet.</p>
            ) : null}

            {!loading && !error && bookings.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookings.map((booking) => (
                  <article
                    key={booking._id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">
                      {booking.room?.name || "Room unavailable"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Booked by {booking.name} ({booking.email})
                    </p>

                    <div className="mt-4 text-sm text-gray-700 space-y-1">
                      <p>Check-in: {formatDate(booking.checkIn)}</p>
                      <p>Check-out: {formatDate(booking.checkOut)}</p>
                      <p>Guests: {booking.guests}</p>
                      <p>
                        Total per night:{" "}
                        {booking.room ? `₹${booking.room.price}` : "N/A"}
                      </p>
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                      Created on {formatDate(booking.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
