"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/ui/Button";
import RoomCard from "@/app/components/ui/room/RoomCard";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
import Container from "@/app/components/ui/ui/Container";

type Room = {
  _id: string;
  name: string;
  price: number;
  image?: string;
};

function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="h-60 w-full bg-gray-100 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-6 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-4 w-full rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-4 w-5/6 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    minPrice: "",
    maxPrice: "",
    roomType: "",
  });
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchRooms = async (searchFilters = filters) => {
    setSearching(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (searchFilters.checkIn) params.set("checkIn", searchFilters.checkIn);
      if (searchFilters.checkOut) params.set("checkOut", searchFilters.checkOut);
      if (searchFilters.minPrice) params.set("minPrice", searchFilters.minPrice.toString());
      if (searchFilters.maxPrice) params.set("maxPrice", searchFilters.maxPrice.toString());
      if (searchFilters.roomType) params.set("roomType", searchFilters.roomType);

      const url = `${apiBaseUrl}/api/rooms${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Could not load rooms.");
      }

      const data: Room[] = await res.json();
      setRooms(data);
    } catch {
      setError("Could not load rooms. Please try again.");
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  // Book Now → redirect to /bookings with roomId & filter params
  const goToBookingPage = (roomId?: string) => {
    if (!roomId) return;

    const params = new URLSearchParams();
    params.set("roomId", roomId);

    if (filters.checkIn) params.set("checkIn", filters.checkIn);
    if (filters.checkOut) params.set("checkOut", filters.checkOut);
    if (filters.guests) params.set("guests", filters.guests.toString());

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24">
        <Container>
          <div className="py-16">
            <SectionTitle
              label="Browse Rooms"
              title="Find Your Perfect Room"
              subtitle="Filter available rooms by date, price, and guest count."
            />

            <div className="mt-8 rounded-3xl bg-white/90 p-6 shadow-sm border border-gray-100">
              <div className="grid gap-4 md:grid-cols-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Check-in</span>
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, checkIn: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Check-out</span>
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, checkOut: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Guests</span>
                  <input
                    type="number"
                    min={1}
                    value={filters.guests}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        guests: Number(event.target.value) || 1,
                      }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Min price</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.minPrice}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, minPrice: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Max price</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.maxPrice}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Room type</span>
                  <select
                    value={filters.roomType}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, roomType: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-green-500 focus:outline-none bg-white"
                  >
                    <option value="">All types</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Garden">Garden</option>
                    <option value="Family">Family</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  {searching ? "Searching available rooms..." : `${rooms.length} rooms found`}
                </p>
                <Button variant="primary" size="md" onClick={() => fetchRooms(filters)}>
                  Search Availability
                </Button>
              </div>
              {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading || searching
                ? (
                  Array.from({ length: 3 }).map((_, i) => <RoomCardSkeleton key={i} />)
                )
                : rooms.length === 0
                ? (
                  <div className="col-span-3 py-20 text-center">
                    <p className="text-gray-500 text-lg">No rooms available with the selected filters.</p>
                  </div>
                )
                : rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    roomId={room._id}
                    title={room.name}
                    price={`${"\u20B9"}${room.price}`}
                    image={room.image || "img.jpg"}
                    onBook={goToBookingPage}
                  />
                ))}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

