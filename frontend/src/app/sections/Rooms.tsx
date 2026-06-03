"use client";

import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
import RoomCard from "../components/ui/room/RoomCard";

const rooms = [
  {
    title: "Deluxe Valley Room",
    price: "₹2,999",
    image: "/room-deluxe.png",
    badge: "Most Popular",
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
  return (
    <section id="rooms" className="py-28 bg-gradient-to-b from-white to-green-50/40">
      <Container>
        <SectionTitle
          label="Our Rooms"
          title="Choose Your Perfect Stay"
          subtitle="All rooms include complimentary breakfast, high-speed Wi-Fi, and stunning views of the surrounding hills."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <div
              key={room.title}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <RoomCard {...room} />
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Need a custom package?{" "}
            <a
              href="#contact"
              className="text-green-700 font-semibold hover:underline underline-offset-2"
            >
              Contact us directly →
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
