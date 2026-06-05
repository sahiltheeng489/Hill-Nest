
"use client";

import { useEffect, useState } from "react";
import RoomCard from "@/app/components/ui/room/RoomCard";
import Navbar from "@/app/components/ui/layout/Navbar";
import Footer from "@/app/components/ui/layout/Footer";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
import Container from "@/app/components/ui/ui/Container";
import { buildApiUrl } from "@/services/api";

type Room = {
  _id?: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

const fallbackRooms: Room[] = [
  {
    name: "Deluxe Valley Room",
    price: 2999,
    image: "/room-deluxe.png",
    description: "Wake up to peaceful valley views, warm wooden interiors, Wi-Fi, and breakfast included.",
  },
  {
    name: "Premium Family Suite",
    price: 4499,
    image: "/room-suite.png",
    description: "A spacious family suite with a private lounge, mountain-facing balcony, and extra comfort.",
  },
  {
    name: "Garden View Room",
    price: 2499,
    image: "/room-garden.png",
    description: "A cozy garden-facing room for couples and solo travelers looking for a calm retreat.",
  },
];

function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="h-60 w-full bg-gray-100 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-6 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-4 w-full rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-4 w-5/6 rounded-lg bg-gray-100 animate-pulse" />
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-7 w-20 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-8 w-28 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-10 w-28 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [queryString] = useState(() =>
    typeof window === "undefined" ? "" : window.location.search.replace(/^\?/, "")
  );
  const [rooms, setRooms] = useState<Room[]>(fallbackRooms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch(buildApiUrl(`/rooms${queryString ? `?${queryString}` : ""}`))
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not load rooms.");
        }
        return res.json();
      })
      .then((data: Room[]) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Showing sample rooms. Live availability could not be refreshed.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [queryString]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50/30 to-white pt-24">
        <Container>
          <div className="py-16">
            <SectionTitle
              label="Browse Rooms"
              title="Find Your Perfect Room"
              subtitle="Real-time availability. Book directly for the best rates — no hidden fees."
            />

            {error && (
              <div className="mt-10 flex items-start gap-3 max-w-xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-5 animate-fade-up">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-red-700 text-sm">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs text-red-600 underline underline-offset-2 hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading && rooms.length === 0
                ? Array.from({ length: 3 }).map((_, i) => <RoomCardSkeleton key={i} />)
                : rooms.length === 0 && !error
                ? (
                  <div className="py-20 text-center animate-fade-up md:col-span-2 lg:col-span-3">
                    <p className="text-5xl mb-4">🏡</p>
                    <p className="text-gray-500 text-lg font-semibold">No rooms available right now.</p>
                    <p className="text-gray-400 text-sm mt-2">Please check back later or contact us directly.</p>
                  </div>
                )
                : rooms.map((room, i) => (
                  <div key={room._id ?? room.name} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <RoomCard
                      roomId={room._id}
                      title={room.name}
                      price={typeof room.price === "number" ? `₹${room.price.toLocaleString("en-IN")}` : "N/A"}
                      image={room.image}
                      description={room.description}
                      bookHref={room._id ? `/booking?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(queryString).entries()), roomId: room._id }).toString()}#payment` : "/rooms"}
                    />
                  </div>
                ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
