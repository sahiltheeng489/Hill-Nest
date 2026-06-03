"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Container from "@/app/components/ui/ui/Container";

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

type LoadedRoom = {
  roomId: string;
  data: Room;
};

type RoomError = {
  roomId: string;
  message: string;
};

const initialForm: BookingForm = {
  name: "",
  email: "",
  checkIn: "",
  checkOut: "",
  guests: "1",
};

export default function BookingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const [loadedRoom, setLoadedRoom] = useState<LoadedRoom | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<RoomError | null>(null);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const room = loadedRoom?.roomId === roomId ? loadedRoom.data : null;
  const selectedRoomError = roomLoadError?.roomId === roomId ? roomLoadError.message : "";
  const loadingRoom = Boolean(roomId && !room && !selectedRoomError);

  useEffect(() => {
    if (!roomId || room || selectedRoomError) {
      return;
    }

    const controller = new AbortController();

    fetch(`${apiBaseUrl}/rooms/${roomId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not load selected room.");
        }

        return res.json();
      })
      .then((data: Room) => {
        setLoadedRoom({ roomId, data });
      })
      .catch((fetchError: Error) => {
        if (fetchError.name === "AbortError") {
          return;
        }

        setRoomLoadError({
          roomId,
          message: "Could not load selected room details. Please go back and choose a room again.",
        });
      });

    return () => controller.abort();
  }, [apiBaseUrl, roomId, room, selectedRoomError]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!roomId) {
      setError("Missing room id. Please go back and select a room again.");
      return;
    }

    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
      setError("Check-out must be after check-in.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${apiBaseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setSuccess("Booking created successfully.");
        setForm(initialForm);
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
          <div className="mx-auto max-w-2xl py-14">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="mt-2 text-sm text-gray-500">
              {loadingRoom
                ? "Loading selected room..."
                : room
                  ? `You are booking: ${room.name}`
                  : "Select a room first, then enter dates and guest details to confirm."}
            </p>

            <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              Room ID: {roomId || "Not provided"}
            </div>

            {selectedRoomError ? <p className="mt-4 text-sm text-red-600">{selectedRoomError}</p> : null}
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            {success ? <p className="mt-4 text-sm text-green-700">{success}</p> : null}

            {!roomId ? (
              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
                Please choose a room before completing a booking.
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <input
                name="name"
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="checkIn"
                  type="date"
                  value={form.checkIn}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />

                <input
                  name="checkOut"
                  type="date"
                  value={form.checkOut}
                  onChange={onChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />
              </div>

              <select
                name="guests"
                value={form.guests}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/rooms")}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-700 hover:text-green-700"
                >
                  Back to Rooms
                </button>
                <button
                  type="submit"
                  disabled={submitting || !roomId || loadingRoom}
                  className="rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-green-900/20 transition hover:from-green-600 hover:to-green-500 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
                >
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
