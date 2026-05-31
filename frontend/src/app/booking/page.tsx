"use client";

import { FormEvent, Suspense, useMemo, useEffect, useState } from "react";
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
  image: string;
};

type BookingForm = {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
};

const initialForm: BookingForm = {
  name: "",
  email: "",
  checkIn: "",
  checkOut: "",
  guests: "1",
};

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [room, setRoom] = useState<Room | null>(null);
  const storedUser = getStoredUser();

  const initialFormState = useMemo<BookingForm>(
    () => ({
      ...initialForm,
      name: storedUser?.name || initialForm.name,
      email: storedUser?.email || initialForm.email,
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: searchParams.get("guests") || "1",
    }),
    [searchParams, storedUser?.email, storedUser?.name]
  );

  const [form, setForm] = useState<BookingForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;

    fetch(`${apiBaseUrl}/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data: Room) => setRoom(data))
      .catch(() => setError("Could not load selected room details."));
  }, [apiBaseUrl, roomId]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();

    if (!roomId) {
      setError("Missing room id. Please go back and select a room again.");
      return;
    }

    if (!token) {
      setError("Please login first to create a booking.");
      router.push("/login");
      return;
    }

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setError("Check-out must be after check-in.");
      return;
    }

    setSubmitting(true);
    setError("");

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
        setError(data.message || "Booking failed.");
      } else {
        router.push("/bookings");
      }
    } catch {
      setError("Could not connect to backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24">
        <Container>
          <div className="max-w-2xl mx-auto py-14">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="text-sm text-gray-500 mt-2">
              {room ? `You are booking: ${room.name}` : "Select dates and guest details to confirm."}
            </p>

            <div className="mt-5 p-4 rounded-xl border border-green-100 bg-green-50 text-sm text-green-800">
              Room ID: {roomId || "Not provided"}
            </div>

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

            {!roomId ? (
              <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-sm text-yellow-900">
                <p className="font-semibold">No room selected yet.</p>
                <p className="mt-2 text-sm text-yellow-900/90">
                  Please choose a room first from the rooms list so we can complete your booking.
                </p>
                <Button type="button" variant="primary" className="mt-4" onClick={() => router.push("/rooms")}>
                  Select a room
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <input name="name" type="text" placeholder="Full name" value={form.name} onChange={onChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="checkIn" type="date" value={form.checkIn} onChange={onChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                  <input name="checkOut" type="date" value={form.checkOut} onChange={onChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                </div>

                <select name="guests" value={form.guests} onChange={onChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => router.push("/rooms")}>Back to Rooms</Button>
                  <Button type="submit" disabled={submitting || !roomId}>{submitting ? "Submitting..." : "Confirm Booking"}</Button>
                </div>
              </form>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24" />}>
      <BookingPageContent />
    </Suspense>
  );
}
