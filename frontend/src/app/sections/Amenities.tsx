import Container from "@/app/components/ui/ui/Container";
import SectionTitle from "@/app/components/ui/ui/SectionTitle";

const amenities = [
  {
    icon: "🌄",
    title: "Panoramic Mountain Views",
    desc: "Every room faces the majestic Himalayan foothills with floor-to-ceiling windows to soak in the scenery.",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-white/8 text-teal-200",
  },
  {
    icon: "☕",
    title: "Farm-Fresh Breakfast",
    desc: "Start your day with locally sourced organic breakfasts — fresh fruits, local breads, and masala chai.",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-white/8 text-slate-200",
  },
  {
    icon: "🛜",
    title: "High-Speed Wi-Fi",
    desc: "Stay connected with blazing-fast fiber internet throughout the property, perfect for remote workers.",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-white/8 text-teal-200",
  },
  {
    icon: "🧘",
    title: "Wellness & Yoga Space",
    desc: "Begin your mornings with guided yoga sessions on our open-air deck overlooking the valley.",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-white/8 text-slate-200",
  },
  {
    icon: "🍃",
    title: "Nature Trails",
    desc: "Guided nature walks through tea gardens and forest trails, discovering the region's rich biodiversity.",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-white/8 text-teal-200",
  },
  {
    icon: "🚗",
    title: "Free Pickup & Drop",
    desc: "Complimentary airport and railway station pickup from NJP/Siliguri for all our guests.",
    color: "from-slate-900/80 via-slate-800/70 to-slate-900/50",
    iconBg: "bg-white/8 text-teal-200",
  },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-[#08111e]">
      <Container>
        <SectionTitle
          label="Amenities"
          title="Everything You Need"
          subtitle="We've thought of every detail so you can simply relax and enjoy your highland escape."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map(({ icon, title, desc, color, iconBg }, i) => (
            <div
              key={title}
              className={`group bg-gradient-to-br ${color} rounded-3xl p-6 border border-white/10 shadow-[0_14px_30px_rgba(2,6,23,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl mb-4 border border-white/10 group-hover:scale-105 transition-transform duration-300`}
              >
                {icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
