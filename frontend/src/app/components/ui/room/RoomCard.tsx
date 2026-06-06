"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/ui/ui/Button";

interface Amenity {
  icon: string;
  label: string;
}

interface RoomProps {
  roomId?: string;
  title: string;
  price: string;
  image?: string; // optional image
  description?: string;
  amenities?: Amenity[];
  badge?: string;
  rating?: number;
  reviews?: number;
  capacity?: string;
  bookHref?: string;
  onBook?: (roomId?: string, title?: string) => void;
  isBooking?: boolean;
}

const defaultAmenities: Amenity[] = [
  { icon: "Wi-Fi", label: "Free Wi-Fi" },
  { icon: "View", label: "Valley View" },
  { icon: "Meal", label: "Breakfast" },
  { icon: "AC", label: "AC" },
];

export default function RoomCard({
  roomId,
  title,
  price,
  image = "img.jpg",
  description = "Cozy interiors with premium comfort, modern furnishings, and scenic mountain views from every window.",
  amenities = defaultAmenities,
  badge,
  rating = 4.9,
  reviews = 48,
  capacity = "Sleeps 2",
  bookHref,
  onBook,
  isBooking = false,
}: RoomProps) {
  const safeImage = image?.trim();
  const imageSrc =
    safeImage && (safeImage.startsWith("http") || safeImage.startsWith("/"))
      ? safeImage
      : "/room-deluxe.png";
  const resolvedBookHref = bookHref ?? (roomId ? `/booking?roomId=${roomId}#payment` : "/rooms");

  return (
    <article className="group flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-white/14 bg-gradient-to-br from-white/10 via-slate-900/70 to-slate-950/85 shadow-[0_18px_45px_rgba(2,6,23,0.22)] transition-all duration-400 ease-out hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl">
      {/* Image */}

      <div className="relative h-56 flex-shrink-0 overflow-hidden sm:h-60">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {badge && (
          <span className="absolute top-3 left-3 rounded-full border border-white/14 bg-white/12 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {badge}
          </span>
        )}

        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-xl border border-white/14 bg-slate-950/50 px-2.5 py-1.5 text-xs font-bold text-slate-100 backdrop-blur-md shadow-sm">
          <span className="text-teal-200">★</span>
          {rating}
          <span className="font-normal text-slate-300">({reviews})</span>
        </span>

        <div className="absolute inset-0 flex items-end p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="rounded-lg border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            Click to view gallery →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-bold tracking-tight text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-200">
          <span className="rounded-lg border border-white/14 bg-white/8 px-3 py-2">{capacity}</span>
          <span className="rounded-lg border border-white/14 bg-white/8 px-3 py-2 text-slate-100">Direct booking</span>
        </div>

        {/* Amenity badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {amenities.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/8 px-2.5 py-1 text-xs font-medium text-slate-200"
            >
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex flex-col gap-4 border-t border-white/12 pt-5 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Starting from</p>
            <span className="text-2xl font-extrabold text-teal-200 leading-none">{price}</span>
            <span className="text-xs text-slate-400 ml-1">/ night</span>
          </div>

          {onBook ? (
            <Button
              id={`book-btn-${roomId || title.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => onBook(roomId, title)}
              disabled={isBooking}
              aria-label={`Book ${title}`}
              size="sm"
            >
              {isBooking ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Booking…
                </>
              ) : (
                "Book Room"
              )}
            </Button>
          ) : (
            <Link
              href={resolvedBookHref}
              aria-label={`Book ${title}`}
            className="animate-button-in inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/14 px-5 py-2.5 text-sm font-semibold tracking-wide text-white backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 hover:bg-white/18 active:scale-95 min-[430px]:w-auto"
            >
              Book Room
            </Link>
          )}
        </div>

      </div>
    </article>
  );
}
