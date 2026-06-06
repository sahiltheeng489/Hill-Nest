"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import Container from "@/app/components/ui/ui/Container";
import PaymentButton from "@/app/components/ui/payment/PaymentButton";
import { buildApiUrl } from "@/services/api";
import { getProfile, getStoredUser } from "@/services/authService";

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

const createInitialForm = (searchParams: ReturnType<typeof useSearchParams>): BookingForm => ({
  name: "",
  email: "",
  checkIn: searchParams.get("checkIn") || "",
  checkOut: searchParams.get("checkOut") || "",
  guests: searchParams.get("guests") || "1",
});

const today = new Date().toISOString().split("T")[0];

const getNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

export default function BookingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [loadedRoom, setLoadedRoom] = useState<LoadedRoom | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<RoomError | null>(null);
  const [form, setForm] = useState<BookingForm>(() => createInitialForm(searchParams));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const room = loadedRoom?.roomId === roomId ? loadedRoom.data : null;
  const selectedRoomError = roomLoadError?.roomId === roomId ? roomLoadError.message : "";
  const loadingRoom = Boolean(roomId && !room && !selectedRoomError);
  const nights = getNights(form.checkIn, form.checkOut);
  const estimatedTotal = room && nights > 0 ? room.price * nights : 0;
  const readyForPayment = Boolean(roomId && room && nights > 0 && form.name && form.email);
  const bookingPayload = {
    room: roomId ?? "",
    name: form.name,
    email: form.email,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guests: Number(form.guests),
  };

  useEffect(() => {
    if (!roomId || room || selectedRoomError) {
      return;
    }

    const controller = new AbortController();

    fetch(buildApiUrl(`/rooms/${roomId}`), { signal: controller.signal })
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
  }, [roomId, room, selectedRoomError]);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const storedUser = getStoredUser();
      if (storedUser && isMounted) {
        setForm((prev) => ({
          ...prev,
          name: prev.name || storedUser.name,
          email: prev.email || storedUser.email,
        }));
      }

      try {
        const profile = await getProfile();
        if (!isMounted) return;

        if (profile.user.role === "admin") {
          router.replace("/admin");
          return;
        }

        setForm((prev) => ({
          ...prev,
          name: prev.name || profile.user.name,
          email: prev.email || profile.user.email,
        }));
      } catch {
        if (!isMounted) return;
        const nextPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    };

    void syncSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#payment") {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById("payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [roomId, room]);

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

    setError("");
    document.getElementById("payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%),linear-gradient(180deg,#08111e_0%,#0b1220_58%,#050816_100%)] pt-24 text-slate-100">
        <Container>
          <div className="py-10 md:py-14">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-200">Secure booking</p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
                Complete your HillNest stay
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Confirm the room, choose dates, add guest details, then continue to payment. Your booking is checked against availability before it is created.
              </p>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-5 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
                  <div className="flex flex-wrap gap-3">
                    {["Room", "Dates", "Guest", "Payment"].map((step, index) => (
                      <div
                        key={step}
                        className={`flex min-h-11 flex-1 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
                          index === 0 || (index === 1 && nights > 0) || (index === 2 && form.name && form.email)
                            ? "border-teal-300/20 bg-teal-500/10 text-teal-50"
                            : "border-white/8 bg-white/5 text-slate-300"
                        }`}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white">
                          {index + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <section className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Selected room</p>
                      <h2 className="mt-2 text-xl font-bold text-white">
                        {loadingRoom ? "Loading room details..." : room?.name ?? "Choose a room first"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {room
                          ? "Breakfast, Wi-Fi, and standard house policies are included with this room."
                          : "A room selection is required before dates and payment can be confirmed."}
                      </p>
                    </div>
                    {room ? (
                      <div className="rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-right backdrop-blur-md">
                        <p className="text-xs text-teal-100">From</p>
                        <p className="text-xl font-extrabold text-white">₹{room.price.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-teal-100">per night</p>
                      </div>
                    ) : null}
                  </div>

                  {!roomId ? (
                    <div className="mt-5 rounded-xl border border-teal-300/20 bg-teal-500/10 px-4 py-3 text-sm text-teal-50">
                      Please choose a room before completing a booking.
                    </div>
                  ) : null}
                  {selectedRoomError ? (
                    <div className="mt-5 rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
                      {selectedRoomError}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Dates and guests</p>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-300">Check-in</span>
                      <input
                        name="checkIn"
                        type="date"
                        min={today}
                        value={form.checkIn}
                        onChange={onChange}
                        required
                        className="input-base mt-1"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-slate-300">Check-out</span>
                      <input
                        name="checkOut"
                        type="date"
                        min={form.checkIn || today}
                        value={form.checkOut}
                        onChange={onChange}
                        required
                        className="input-base mt-1"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-slate-300">Guests</span>
                      <select
                        name="guests"
                        value={form.guests}
                        onChange={onChange}
                        className="input-base mt-1"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {form.checkIn && form.checkOut && nights === 0 ? (
                    <p className="mt-3 text-sm text-red-600">Check-out must be after check-in.</p>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Guest details</p>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-300">Full name</span>
                      <input
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={onChange}
                        required
                        className="input-base mt-1"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-slate-300">Email</span>
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={onChange}
                        required
                        className="input-base mt-1"
                      />
                    </label>
                  </div>
                </section>

                <section id="payment" className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Payment</p>
                      <h2 className="mt-2 text-xl font-bold text-white">Secure checkout</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Review your total and open the payment gateway to complete your booking.
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-teal-100">
                      Razorpay
                    </span>
                  </div>

                  <div className="mt-5">
                    {room ? (
                      <PaymentButton
                        bookingPayload={bookingPayload}
                        nights={nights}
                        pricePerNight={room.price}
                        disabled={!readyForPayment || loadingRoom}
                        onSuccess={() => {
                          setSuccess("Payment complete. Your booking has been confirmed.");
                          setForm(createInitialForm(searchParams));
                          router.replace("/bookings");
                        }}
                        onError={(message) => setError(message)}
                      />
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                        Select a room before payment.
                      </div>
                    )}
                  </div>
                </section>

                {error ? (
                  <div className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">{error}</div>
                ) : null}
                {success ? (
                  <div className="rounded-xl border border-teal-300/20 bg-teal-500/10 px-4 py-3 text-sm text-teal-50">{success}</div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => router.push("/rooms")}
                    className="min-h-12 rounded-xl border border-white/10 bg-white/8 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur-md transition hover:border-teal-300/30 hover:bg-white/12"
                  >
                    Back to Rooms
                  </button>
                  <button
                    type="submit"
                    disabled={!roomId || loadingRoom || !readyForPayment}
                    className="min-h-12 rounded-xl border border-white/10 bg-gradient-to-r from-teal-500/90 via-teal-500/90 to-slate-500/90 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition hover:from-teal-400 hover:via-teal-400 hover:to-slate-400 disabled:cursor-not-allowed disabled:from-slate-500 disabled:via-slate-500 disabled:to-slate-500"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>

              <aside className="rounded-2xl border border-white/10 bg-white/8 p-6 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-md lg:sticky lg:top-28">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Booking summary</p>
                <h2 className="mt-3 text-2xl font-bold text-white">{room?.name ?? "No room selected"}</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-300">Dates</dt>
                    <dd className="text-right font-medium text-white">
                      {form.checkIn && form.checkOut ? `${form.checkIn} to ${form.checkOut}` : "Select dates"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-300">Guests</dt>
                    <dd className="font-medium text-white">{form.guests}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-300">Nights</dt>
                    <dd className="font-medium text-white">{nights || "-"}</dd>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-300">Estimated total</dt>
                      <dd className="text-xl font-extrabold text-teal-100">
                        {estimatedTotal ? `₹${estimatedTotal.toLocaleString("en-IN")}` : "-"}
                      </dd>
                    </div>
                  </div>
                </dl>
                <div className="mt-5 rounded-xl border border-white/10 bg-white/8 p-4 text-xs leading-6 text-slate-300">
                  Includes breakfast and Wi-Fi. Final payment status is confirmed after the booking request is accepted.
                </div>
              </aside>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
