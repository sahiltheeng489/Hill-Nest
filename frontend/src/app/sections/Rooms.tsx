"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
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
    image: "/room-deluxe.png",
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
    image: "/room-suite.png",
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
    image: "/room-garden.png",
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

  const visibleRooms = apiRooms.length > 0 ? apiRooms : rooms;

  return (
    <section id="rooms" className="py-28 bg-gradient-to-b from-white to-green-50/40">
      <Container>
        <SectionTitle
          label="Our Rooms"
          title="Choose Your Perfect Stay"
          subtitle="All rooms include complimentary breakfast, high-speed Wi-Fi, and stunning views of the surrounding hills."
        />

        {/* Social proof mini-bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 animate-fade-up">
          {[
            { icon: "⭐", text: "4.9 avg rating" },
            { icon: "🧑‍🤝‍🧑", text: "500+ happy guests" },
            { icon: "🔁", text: "98% would return" },
          ].map(({ icon, text }) => (
            <span key={text} className="inline-flex items-center gap-2 text-sm text-gray-500 font-medium">
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
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-green-900/25 hover:from-green-700 hover:to-emerald-500 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            View All Rooms & Availability
          </Link>
          <a
            href="#contact"
            className="text-sm text-gray-400 hover:text-green-700 font-semibold hover:underline underline-offset-2 transition-colors"
          >
            Need a custom package? Contact us →
          </a>
        </div>
      </Container>
    </section>
  );
}
