import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
import GallerySlider, {
  type GallerySlide,
} from "@/app/components/ui/gallery/GallerySlider";

const gallery: GallerySlide[] = [
  {
    src: "/hero.png",
    alt: "HillNest property exterior",
    eyebrow: "Arrival Court",
    title: "The first view guests carry with them.",
    description:
      "Stone pathways, layered greenery, and the mountain silhouette set the tone before a guest even checks in.",
    highlights: ["Property View", "Golden Hour", "Signature Arrival"],
  },
  {
    src: "/room-deluxe.png",
    alt: "Deluxe Valley Room",
    eyebrow: "Deluxe Valley Room",
    title: "Wake up with the valley framed like a postcard.",
    description:
      "A calm, warm room designed for slow mornings, soft light, and the kind of stillness city travelers come here to find.",
    highlights: ["Valley Windows", "Warm Wood", "Quiet Stay"],
  },
  {
    src: "/room-suite.png",
    alt: "Premium Family Suite",
    eyebrow: "Premium Suite",
    title: "Roomy enough for long conversations and longer stays.",
    description:
      "This suite balances comfort and openness with layered seating, family-friendly space, and an easy indoor-outdoor rhythm.",
    highlights: ["Family Friendly", "Spacious Layout", "Extended Stay"],
  },
  {
    src: "/gallery-dining.png",
    alt: "Farm-fresh breakfast dining area",
    eyebrow: "Breakfast Table",
    title: "Breakfast feels like part of the landscape.",
    description:
      "Fresh local flavours, morning sunlight, and a dining corner that invites guests to slow down instead of rush out.",
    highlights: ["Fresh Breakfast", "Mountain Light", "Shared Table"],
  },
  {
    src: "/gallery-outdoor.png",
    alt: "Outdoor terrace with mountain views",
    eyebrow: "Terrace View",
    title: "Evenings belong to the open deck and the clouds.",
    description:
      "An outdoor terrace for chai, conversation, and the changing weather rolling quietly across the hills.",
    highlights: ["Open Terrace", "Cloud Watching", "Sunset Spot"],
  },
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
    text: "Our anniversary trip was made perfect by HillNest. The garden room with its private terrace, misty mornings, and serene atmosphere - it felt like a dream. Thank you for such a special experience!",
    stay: "Garden View Room",
    color: "from-green-50 to-teal-50",
    iconBg: "bg-green-600",
  },
];

const stats = [
  { value: "4.9/5", label: "Avg Rating", icon: "AR", iconBg: "bg-amber-50 text-amber-700" },
  { value: "500+", label: "Happy Guests", icon: "HG", iconBg: "bg-emerald-50 text-emerald-700" },
  { value: "98%", label: "Would Return", icon: "WR", iconBg: "bg-green-50 text-green-700" },
];

const galleryHighlights = [
  { value: "5 Scenes", label: "Curated highlights" },
  { value: "360 Feel", label: "Indoor + outdoor mood" },
  { value: "Guest First", label: "Built for decision-making" },
];

export default function GalleryAndTestimonials() {
  return (
    <>
      <section
        id="gallery"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf5_42%,#ffffff_100%)] pt-24 pb-20 md:pt-28 md:pb-24"
      >
        <div className="pointer-events-none absolute left-[-6rem] top-20 h-52 w-52 rounded-full bg-emerald-100/80 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5rem] top-1/3 h-64 w-64 rounded-full bg-lime-100/70 blur-3xl" />

        <div className="mx-auto w-full max-w-[86rem] px-4 sm:px-6 lg:px-8">
          <SectionTitle
            label="Gallery"
            title="A More Immersive Look at HillNest"
            subtitle="Glide through the spaces, textures, and views that shape a stay at HillNest."
          />

          <div className="mt-9 flex flex-wrap justify-center gap-3.5 md:gap-4">
            {galleryHighlights.map(({ value, label }, index) => (
              <div
                key={label}
                className="animate-fade-up rounded-full border border-emerald-100 bg-white/85 px-5 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)]"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <p className="text-sm font-semibold text-slate-900">{value}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 animate-fade-up md:mt-14">
            <GallerySlider slides={gallery} />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-green-50/40 py-28">
        <Container>
          <SectionTitle
            label="Guest Stories"
            title="What Our Guests Say"
            subtitle="Real experiences from the people who matter most - our guests."
          />

          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up">
            {stats.map(({ value, label, icon, iconBg }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${iconBg}`}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-none text-gray-900">{value}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map(
              ({ name, location, initials, iconBg, color, rating, text, stay }, index) => (
                <div
                  key={name}
                  className={`group animate-fade-up rounded-2xl border border-white bg-gradient-to-br ${color} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: rating }).map((_, ratingIndex) => (
                      <svg
                        key={ratingIndex}
                        className="h-4 w-4 fill-amber-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                    &ldquo;{text}&rdquo;
                  </p>

                  <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white/70 px-3 py-1.5 text-xs font-semibold text-green-800">
                    Stay: {stay}
                  </span>

                  <div className="flex items-center gap-3 border-t border-white/60 pt-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{location}</p>
                    </div>
                    <span className="ml-auto rounded-lg border border-green-100 bg-white/70 px-2 py-1 text-xs font-semibold text-green-700">
                      Verified
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
