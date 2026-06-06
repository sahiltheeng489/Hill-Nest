"use client";

import { useEffect, useMemo, useState } from "react";
import RoomCard from "./RoomCard";

type Room = {
  _id: string;
  name: string;
  price: number;
  image?: string;
};

type RoomSliderProps = {
  rooms: Room[];
  onBook?: (roomId?: string, title?: string) => void;
};

export default function RoomSlider({ rooms, onBook }: RoomSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = useMemo(() => {
    if (rooms.length === 0) return 0;
    return Math.min(activeIndex, rooms.length - 1);
  }, [activeIndex, rooms.length]);

  useEffect(() => {
    if (rooms.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % rooms.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [rooms.length]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? rooms.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % rooms.length);
  };

  if (rooms.length === 0) return null;

  const activeRoom = rooms[safeIndex];

  return (
    <div className="relative">
      <div className="max-w-xl mx-auto">
        <RoomCard
          key={activeRoom._id}
          roomId={activeRoom._id}
          title={activeRoom.name}
          price={`${"\u20B9"}${activeRoom.price}`}
          image={activeRoom.image || "img.jpg"}
          onBook={onBook}
        />
      </div>

      {rooms.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-white/8 text-white shadow-sm backdrop-blur-md hover:bg-white/12"
            aria-label="Previous room"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-white/8 text-white shadow-sm backdrop-blur-md hover:bg-white/12"
            aria-label="Next room"
          >
            {">"}
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {rooms.map((room, index) => (
              <button
                key={room._id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  safeIndex === index ? "w-8 bg-[#6F9487]" : "w-2.5 bg-white/25"
                }`}
                aria-label={`Go to room ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
