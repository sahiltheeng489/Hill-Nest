"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Container from "@/app/components/ui/ui/Container";
import RoomCard from "../components/ui/room/RoomCard";
import { buildApiUrl } from "@/services/api";

type ApiRoom = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

const rooms = [
  {
    title: "Deluxe Valley Room",
    price: "₹2,999",
    image: "/room-deluxe.webp",
    badge: "Most Popular",
    capacity: "Up to 2 guests",
    description:
      "Wake up to sweeping valley views from your king-size bed. Rich wooden accents, a plush sitting area, and modern amenities make this our signature stay.",
    amenities: [
      { icon: "🛜", label: "Free Wi-Fi" },
      { icon: "🌄", label: "Valley View" },
      { icon: "☕", label: "Breakfast" },
      { icon: "❄️", label: "AC" },
    ],
    rating: 4.9,
    reviews: 72,
  },
  {
    title: "Premium Family Suite",
    price: "₹4,499",
    image: "/room-suite.webp",
    badge: "Best for Families",
    capacity: "Up to 4 guests",
    description:
      "Spacious twin-bed suite with a private lounge, mountain-facing balcony, and a dedicated dining corner — perfect for families and extended stays.",
    amenities: [
      { icon: "🛜", label: "Free Wi-Fi" },
      { icon: "🏔️", label: "Mountain View" },
      { icon: "☕", label: "Breakfast" },
      { icon: "🛁", label: "Bathtub" },
    ],
    rating: 4.8,
    reviews: 54,
  },
  {
    title: "Garden View Room",
    price: "₹2,499",
    image: "/room-garden.webp",
    capacity: "Up to 2 guests",
    description:
      "Step outside onto your private garden terrace surrounded by lush greenery. A peaceful cozy retreat ideal for couples and solo travelers.",
    amenities: [
      { icon: "🛜", label: "Free Wi-Fi" },
      { icon: "🌿", label: "Garden View" },
      { icon: "☕", label: "Breakfast" },
      { icon: "🔥", label: "Fireplace" },
    ],
    rating: 4.9,
    reviews: 39,
  },
];

export default function Rooms() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(buildApiUrl("/rooms"), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not load rooms.");
        }
        return res.json();
      })
      .then((data: ApiRoom[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setApiRooms(data);
        }
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") {
          setApiRooms([]);
        }
      });

    return () => controller.abort();
  }, []);

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
      const panX = progress * 36;
      const panY = progress * 64;
      const scale = 1.04 + progress * 0.05;

      background.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
      background.style.filter = `brightness(${0.78 + progress * 0.1}) saturate(${0.98 + progress * 0.08})`;
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

  const visibleRooms = (apiRooms.length > 0 ? apiRooms : rooms).slice(0, 3);

  return (
    <section ref={sectionRef} id="rooms" className="relative overflow-hidden py-28 bg-[#07131f]">
      <div
        ref={backgroundRef}
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90 will-change-transform transition-[transform,filter] duration-150 ease-out"
        style={{ backgroundImage: 'url("/forest.webp")' }}
      />

      <Container>
        <div className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
              </span>
              Our Rooms
            </span>

            <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md md:text-5xl">
              Choose Your Perfect Stay
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
              All rooms include complimentary breakfast, high-speed Wi-Fi, and stunning views of the surrounding hills.
            </p>
          </div>

          {/* Social proof mini-bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 animate-fade-up">
            {[
              { icon: "⭐", text: "4.9 avg rating" },
              { icon: "🧑‍🤝‍🧑", text: "500+ happy guests" },
              { icon: "🔁", text: "98% would return" },
            ].map(({ icon, text }) => (
              <span key={text} className="inline-flex items-center gap-2 text-sm font-medium text-slate-300">
                <span className="text-base">{icon}</span>
                {text}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleRooms.map((room, i) => {
              const isApiRoom = "_id" in room;
              const title = isApiRoom ? room.name : room.title;
              const price = isApiRoom
                ? `₹${room.price.toLocaleString("en-IN")}`
                : room.price;

              return (
                <div
                  key={isApiRoom ? room._id : room.title}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <RoomCard
                    {...room}
                    roomId={isApiRoom ? room._id : undefined}
                    title={title}
                    price={price}
                    image={room.image}
                    description={room.description}
                    bookHref={isApiRoom ? `/booking?roomId=${room._id}#payment` : "/rooms"}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom CTAs */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/rooms"
              className="animate-button-in inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/14 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:bg-white/18 active:scale-95"
              style={{ animationDelay: "0.1s" }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              View All Rooms & Availability
            </Link>
            <a
              href="#contact"
              className="text-sm font-semibold text-teal-100/70 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              Need a custom package? Contact us →
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
