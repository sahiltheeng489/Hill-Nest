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

          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-4" style={{ gridAutoRows: "224px" }}>
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 px-4 py-2 rounded-full">
                    {alt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-gradient-to-br from-gray-950 via-green-950/30 to-gray-950">
        <Container>
          <SectionTitle
            label="Guest Stories"
            title="What Our Guests Say"
            subtitle="Real experiences from the people who matter most — our guests."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map(({ name, location, avatar, avatarColor, rating, text, stay }, i) => (
              <div
                key={name}
                className="glass-dark rounded-3xl p-7 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{text}&rdquo;</p>

                {/* Room badge */}
                <span className="self-start text-xs text-green-400 border border-green-800/50 bg-green-950/40 px-3 py-1 rounded-full">
                  {stay}
                </span>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <div className={`w-9 h-9 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-gray-500 text-xs">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
