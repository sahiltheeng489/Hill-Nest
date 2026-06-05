import Image from "next/image";
import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";

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
    initials: "PS",
    rating: 5,
    text: "Absolutely magical stay! The valley views from our room were breathtaking. The hosts were incredibly warm and the breakfast was the best we've had on any trip. Will definitely be back!",
    stay: "Deluxe Valley Room",
    color: "from-emerald-50 to-green-50",
    iconBg: "bg-emerald-500",
  },
  {
    name: "Rahul Mehta",
    location: "Bangalore, KA",
    initials: "RM",
    rating: 5,
    text: "HillNest exceeded every expectation. The property is stunning, rooms are spotless, and the nature trails were a highlight. A perfect escape from city life with excellent connectivity for work.",
    stay: "Premium Family Suite",
    color: "from-teal-50 to-emerald-50",
    iconBg: "bg-teal-500",
  },
  {
    name: "Anjali & Vivek",
    location: "Delhi, NCR",
    initials: "AV",
    rating: 5,
    text: "Our anniversary trip was made perfect by HillNest. The garden room with its private terrace, misty mornings, and serene atmosphere — it felt like a dream. Thank you for such a special experience!",
    stay: "Garden View Room",
    color: "from-green-50 to-teal-50",
    iconBg: "bg-green-600",
  },
];

const stats = [
  { value: "4.9★", label: "Avg Rating", icon: "⭐", iconBg: "bg-amber-50" },
  { value: "500+", label: "Happy Guests", icon: "🧑‍🤝‍🧑", iconBg: "bg-emerald-50" },
  { value: "98%", label: "Would Return", icon: "🔁", iconBg: "bg-green-50" },
];

export default function GalleryAndTestimonials() {
  return (
    <>
      {/* ── Gallery ── */}
      <section id="gallery" className="py-28 bg-white">
        <Container>
          <SectionTitle
            label="Gallery"
            title="Moments at HillNest"
            subtitle="A glimpse into the beauty and tranquility that awaits you."
          />

          <div
            className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4"
            style={{ gridAutoRows: "224px" }}
          >
            {gallery.map(({ src, alt, span }, i) => (
              <div
                key={alt}
                className={`relative overflow-hidden rounded-2xl group cursor-pointer h-56 ${span ?? ""} animate-fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                  <span className="text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 px-3 py-1.5 rounded-full">
                    {alt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 bg-gradient-to-b from-white to-green-50/40">
        <Container>
          <SectionTitle
            label="Guest Stories"
            title="What Our Guests Say"
            subtitle="Real experiences from the people who matter most — our guests."
          />

          {/* Stats row — styled like amenity icon chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up">
            {stats.map(({ value, label, icon, iconBg }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-xl`}>
                  {icon}
                </div>
                <div>
                  <p className="text-lg font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Review cards — same pattern as amenity cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map(({ name, location, initials, iconBg, color, rating, text, stay }, i) => (
              <div
                key={name}
                className={`group bg-gradient-to-br ${color} rounded-2xl p-6 border border-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">
                  &ldquo;{text}&rdquo;
                </p>

                {/* Stay badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/70 text-green-800 border border-green-100 mb-5">
                  🛏️ {stay}
                </span>

                {/* Author — same icon pattern as amenities */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/60">
                  <div
                    className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {location}</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-green-700 bg-white/70 border border-green-100 px-2 py-1 rounded-lg">
                    ✓ Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
