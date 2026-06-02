"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface Amenity {
  icon: string;
  label: string;
}

interface RoomProps {
  roomId?: string;
  title: string;
  price: string;
  image?: string;
  description?: string;
  amenities?: Amenity[];
  badge?: string;
  rating?: number;
  reviews?: number;
  onBook?: (roomId?: string, title?: string) => void;
  isBooking?: boolean;
}

const defaultAmenities: Amenity[] = [
  { icon: "🛜", label: "Free Wi-Fi" },
  { icon: "🌄", label: "Valley View" },
  { icon: "☕", label: "Breakfast" },
  { icon: "❄️", label: "AC" },
];

export default function RoomCard({
  roomId,
  title,
  price,
  image,
  description = "Cozy interiors with premium comfort, modern furnishings, and scenic mountain views from every window.",
  amenities = defaultAmenities,
  badge,
  rating = 4.9,
  reviews = 48,
}: RoomProps) {
  const router = useRouter();
  const safeImage = image || "room-deluxe.png";
  const imageSrc =
    safeImage.startsWith("http") || safeImage.startsWith("/") ? safeImage : `/${safeImage}`;

  const handleBook = () => {
    if (roomId) {
      router.push(`/bookings?roomId=${roomId}`);
    } else {
      router.push("/rooms");
    }
  };

  return (
    <article className="group bg-white rounded-3xl shadow-md shadow-gray-200/80 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-300 overflow-hidden border border-gray-100/60 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-60 flex-shrink-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {badge && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-green-700 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {badge}
          </span>
        )}

        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-xs font-bold text-gray-800 px-2.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1">
          <span className="text-amber-400">★</span>
          {rating}
          <span className="text-gray-400 font-normal">({reviews})</span>
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 font-serif">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>

        {/* Amenity badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700 font-medium"
            >
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto pt-5 border-t border-gray-100 mt-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Starting from</p>
            <span className="text-2xl font-extrabold text-green-700 leading-none">
              {price}
            </span>
            <span className="text-xs text-gray-400 ml-1">/ night</span>
          </div>

          <button
            id={`book-btn-${roomId || title.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={handleBook}
            aria-label={`Book ${title}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white text-sm font-semibold shadow-md shadow-green-900/20 hover:from-green-700 hover:to-emerald-500 hover:shadow-green-900/30 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Room
          </button>
        </div>
      </div>
    </article>
  );
}
