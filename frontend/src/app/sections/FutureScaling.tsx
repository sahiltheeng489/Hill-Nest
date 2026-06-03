import Container from "@/app/components/ui/ui/Container";

const scalingFeatures = [
  {
    step: "01",
    title: "Safer Sessions",
    desc: "Short-lived access tokens now pair with an HTTP-only refresh cookie, so users can stay signed in without relying only on localStorage.",
    status: "Implemented",
  },
  {
    step: "02",
    title: "Account Recovery",
    desc: "Registration creates a verification token, and password reset endpoints are ready for email delivery when a provider is connected.",
    status: "Backend Ready",
  },
  {
    step: "03",
    title: "Admin Controls",
    desc: "Room creation and booking management routes now require a valid admin role before the controller can run.",
    status: "Implemented",
  },
  {
    step: "04",
    title: "Validation Layer",
    desc: "Auth, room, and booking requests now pass through reusable validation middleware before reaching business logic.",
    status: "Implemented",
  },
  {
    step: "05",
    title: "Test Coverage",
    desc: "Focused backend tests now cover the validation behavior that protects the API from malformed requests.",
    status: "Started",
  },
];

export default function FutureScaling() {
  return (
    <section id="scaling" className="py-28 bg-gray-950 text-white">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
            Future Scaling
          </span>

          <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
            Features Ready For The Next Build
          </h2>

          <p className="mt-4 text-base leading-relaxed text-gray-400">
            A practical roadmap for turning the booking MVP into a safer,
            easier-to-operate production app.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          {scalingFeatures.map(({ step, title, desc, status }, i) => (
            <article
              key={title}
              className="animate-fade-up rounded-lg border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-green-400/50 hover:bg-white/[0.07]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-green-300">
                  {step}
                </span>
                <span className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-200">
                  {status}
                </span>
              </div>

              <h3 className="mt-8 min-h-14 font-serif text-xl font-bold leading-snug text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">{desc}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
