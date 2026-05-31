"use client";

import Image from "next/image";
import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
import { useEffect, useState } from "react";

const gallery = [
  { src: "/hero.png", alt: "HillNest property exterior", span: "md:col-span-2 md:row-span-2" },
  { src: "/room-deluxe.png", alt: "Deluxe Valley Room" },
  { src: "/room-suite.png", alt: "Premium Family Suite" },
  { src: "/gallery-dining.png", alt: "Farm-fresh breakfast dining area" },
  { src: "/gallery-outdoor.png", alt: "Outdoor terrace with mountain views" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Kolkata, WB",
    avatar: "P",
    avatarColor: "bg-emerald-500",
    rating: 5,
    text: "Absolutely magical stay! The valley views from our room were breathtaking. The hosts were incredibly warm and the breakfast was the best we've had on any trip. Will definitely be back!",
    stay: "Deluxe Valley Room",
  },
  {
    name: "Rahul Mehta",
    location: "Bangalore, KA",
    avatar: "R",
    avatarColor: "bg-blue-500",
    rating: 5,
    text: "HillNest exceeded every expectation. The property is stunning, rooms are spotless, and the nature trails were a highlight. A perfect escape from city life with excellent connectivity for work.",
    stay: "Premium Family Suite",
  },
  {
    name: "Anjali & Vivek",
    location: "Delhi, NCR",
    avatar: "A",
    avatarColor: "bg-purple-500",
    rating: 5,
    text: "Our anniversary trip was made perfect by HillNest. The garden room with its private terrace, misty mornings, and serene atmosphere — it felt like a dream. Thank you for such a special experience!",
    stay: "Garden View Room",
  },
];

export default function GalleryAndTestimonials() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % gallery.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % gallery.length);
  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <>
      {/* Gallery */}
      <section id="gallery" className="py-28 bg-gradient-to-b from-green-50/40 to-white">
        <Container>
          <SectionTitle
            label="Gallery"
            title="Moments at HillNest"
            subtitle="A glimpse into the beauty and tranquility that awaits you."
          />

          <div className="mt-14 relative max-w-5xl mx-auto animate-fade-up">
            <div className="relative h-[280px] md:h-[420px] overflow-hidden rounded-3xl shadow-xl">
              {gallery.map(({ src, alt }, i) => (
                <Image
                  key={alt}
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className={`object-cover transition-opacity duration-700 ${
                    i === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <p className="absolute left-5 bottom-5 text-white text-sm md:text-base font-semibold bg-black/35 px-3 py-1.5 rounded-lg">
                {gallery[activeSlide]?.alt}
              </p>
            </div>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-800 font-bold shadow hover:bg-white"
            >
              {"<"}
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 text-gray-800 font-bold shadow hover:bg-white"
            >
              {">"}
            </button>

            <div className="mt-4 flex justify-center gap-2">
              {gallery.map((item, i) => (
                <button
                  key={item.alt}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activeSlide ? "w-8 bg-green-700" : "w-2.5 bg-green-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-gradient-to-b from-emerald-50 via-green-50 to-white">
        <Container>
          <SectionTitle
            label="Guest Stories"
            title="What Our Guests Say"
            subtitle="Real experiences from the people who matter most — our guests."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map(
              ({ name, location, avatar, avatarColor, rating, text, stay }, i) => (
                <div
                  key={name}
                  className="bg-white border border-green-100 rounded-3xl p-7 flex flex-col gap-4 shadow-md shadow-green-100/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-100/70 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: rating }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed italic">
                    &ldquo;{text}&rdquo;
                  </p>

                  {/* Room badge */}
                  <span className="self-start text-xs text-green-700 border border-green-200 bg-green-50 px-3 py-1 rounded-full font-medium">
                    {stay}
                  </span>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-green-100">
                    <div
                      className={`w-9 h-9 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {avatar}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{name}</p>
                      <p className="text-gray-500 text-xs">{location}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
