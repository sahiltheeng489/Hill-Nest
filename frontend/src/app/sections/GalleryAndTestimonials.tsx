import FullscreenGallery from "@/app/components/ui/gallery/FullscreenGallery";
import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";
import { gallerySlides } from "@/app/gallery/gallerySlides";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Kolkata, WB",
    initials: "PS",
    rating: 5,
    text: "Absolutely magical stay! The valley views from our room were breathtaking. The hosts were incredibly warm and the breakfast was the best we've had on any trip. Will definitely be back!",
    stay: "Deluxe Valley Room",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-teal-500",
  },
  {
    name: "Rahul Mehta",
    location: "Bangalore, KA",
    initials: "RM",
    rating: 5,
    text: "HillNest exceeded every expectation. The property is stunning, rooms are spotless, and the nature trails were a highlight. A perfect escape from city life with excellent connectivity for work.",
    stay: "Premium Family Suite",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-teal-500",
  },
  {
    name: "Anjali & Vivek",
    location: "Delhi, NCR",
    initials: "AV",
    rating: 5,
    text: "Our anniversary trip was made perfect by HillNest. The garden room with its private terrace, misty mornings, and serene atmosphere - it felt like a dream. Thank you for such a special experience!",
    stay: "Garden View Room",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-slate-500",
  },
];

const stats = [
  { value: "4.9/5", label: "Avg Rating", icon: "AR", iconBg: "bg-white/8 text-teal-100" },
  { value: "500+", label: "Happy Guests", icon: "HG", iconBg: "bg-white/8 text-teal-100" },
  { value: "98%", label: "Would Return", icon: "WR", iconBg: "bg-white/8 text-slate-100" },
];

export default function GalleryAndTestimonials() {
  return (
    <>
      <section id="gallery" className="relative overflow-hidden">
        <FullscreenGallery slides={gallerySlides} />
      </section>

      <section className="bg-gradient-to-b from-[#08111e] to-[#050816] py-28">
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
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-5 py-3.5 text-slate-100 shadow-[0_10px_26px_rgba(2,6,23,0.18)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${iconBg}`}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-none text-slate-100">{value}</p>
                  <p className="mt-0.5 text-xs text-slate-300">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map(
              ({ name, location, initials, iconBg, color, rating, text, stay }, index) => (
              <div
                key={name}
                className={`group animate-fade-up rounded-3xl border border-white/10 bg-gradient-to-br ${color} p-6 text-slate-100 shadow-[0_14px_30px_rgba(2,6,23,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1`}
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

                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-300">
                    &ldquo;{text}&rdquo;
                  </p>

                  <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-100">
                    Stay: {stay}
                  </span>

                  <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{name}</p>
                      <p className="mt-0.5 text-xs text-slate-300">{location}</p>
                    </div>
                    <span className="ml-auto rounded-lg border border-white/10 bg-white/8 px-2 py-1 text-xs font-semibold text-teal-100">
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
