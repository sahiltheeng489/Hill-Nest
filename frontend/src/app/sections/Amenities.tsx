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
    <section
      id="amenities"
      className="relative isolate overflow-hidden py-28 bg-[linear-gradient(180deg,#07110f_0%,#0b1a17_45%,#07110f_100%)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(111,148,135,0.26),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(231,231,231,0.1),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(50,95,87,0.12),transparent_30%)] animate-bg-pan blur-3xl opacity-100" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,17,15,0.84),rgba(111,148,135,0.08),rgba(7,17,15,0.92))]" />
        <div className="absolute left-1/2 top-10 h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(111,148,135,0.22)_0%,rgba(111,148,135,0.1)_34%,transparent_72%)] blur-3xl animate-float-slow opacity-90" />
        <div className="absolute bottom-0 right-[-8%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(231,231,231,0.08)_0%,rgba(50,95,87,0.1)_30%,transparent_72%)] blur-3xl animate-float-medium opacity-80" />
        <div className="absolute -left-1/4 top-0 h-full w-1/2 bg-[linear-gradient(90deg,transparent,rgba(111,148,135,0.16),rgba(231,231,231,0.08),transparent)] bg-[length:220%_100%] animate-[shimmer_18s_linear_infinite] blur-2xl opacity-70" />
      </div>

      <Container>
        <div className="relative z-10">
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
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 ${iconBg} text-2xl transition-transform duration-300 group-hover:scale-105`}
                >
                  {icon}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
