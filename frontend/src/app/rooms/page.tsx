
"use client";

import { useEffect, useRef, useState } from "react";
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
    image: "/room-deluxe.webp",
    description: "Wake up to peaceful valley views, warm wooden interiors, Wi-Fi, and breakfast included.",
  },
  {
    name: "Premium Family Suite",
    price: 4499,
    image: "/room-suite.webp",
    description: "A spacious family suite with a private lounge, mountain-facing balcony, and extra comfort.",
  },
  {
    name: "Garden View Room",
    price: 2499,
    image: "/room-garden.webp",
    description: "A cozy garden-facing room for couples and solo travelers looking for a calm retreat.",
  },
];

function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/8 backdrop-blur-md">
      <div className="h-60 w-full animate-pulse bg-slate-700/40" />
      <div className="p-6 space-y-3">
        <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-700/40" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-slate-700/40" />
        <div className="h-4 w-5/6 animate-pulse rounded-lg bg-slate-700/40" />
        <div className="mt-4 flex gap-2">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-7 w-20 animate-pulse rounded-lg bg-slate-700/40" />
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-slate-700/40" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-700/40" />
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const section = sectionRef.current;
    const background = backgroundRef.current;
    if (!section || !background) return;

    let frame = 0;

    const updateBackground = () => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollStart = Math.max(sectionTop - viewportHeight, 0);
      const scrollEnd = sectionTop + sectionHeight;
      const progress = Math.min(Math.max((window.scrollY - scrollStart) / (scrollEnd - scrollStart), 0), 1);
      const panX = progress * 28;
      const panY = progress * 52;
      const scale = 1.03 + progress * 0.05;

      background.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
      background.style.filter = `brightness(${0.78 + progress * 0.08}) saturate(${0.96 + progress * 0.06})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        updateBackground();
        frame = 0;
      });
    };

    updateBackground();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main ref={sectionRef} className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%),linear-gradient(180deg,#08111e_0%,#0b1220_58%,#050816_100%)] pt-24 text-slate-100">
        <div
          ref={backgroundRef}
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-82 will-change-transform transition-[transform,filter] duration-150 ease-out"
          style={{ backgroundImage: 'url("/forest.webp")' }}
        />

        <Container>
          <div className="relative z-10 py-16">
            <SectionTitle
              label="Browse Rooms"
              title="Find Your Perfect Room"
              subtitle="Real-time availability. Book directly for the best rates — no hidden fees."
            />

            {error && (
            <div className="mt-10 mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-5 text-rose-50 backdrop-blur-md animate-fade-up">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-sm">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="animate-button-in mt-2 text-xs text-teal-100 underline underline-offset-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:text-white"
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
                    <p className="text-slate-200 text-lg font-semibold">No rooms available right now.</p>
                    <p className="text-slate-400 text-sm mt-2">Please check back later or contact us directly.</p>
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
