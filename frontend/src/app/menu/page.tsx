import Link from "next/link";

const menuLinks = [
  { label: "Home", href: "/#home", description: "Back to the main page" },
  { label: "Rooms", href: "/rooms", description: "Browse all available stays" },
  { label: "Amenities", href: "/#amenities", description: "See guest facilities" },
  { label: "Gallery", href: "/#gallery", description: "Jump to the homepage gallery" },
  { label: "Contact", href: "/#contact", description: "Reach HillNest directly" },
];

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%),linear-gradient(180deg,#08111e_0%,#0b1220_60%,#050816_100%)] px-4 py-5 text-slate-100">
      <div className="mx-auto max-w-md">
        <div className="flex min-h-14 items-center justify-between border-b border-white/10 pb-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-teal-500/90 via-teal-500/90 to-slate-500/90 text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21c4-4 7-8 7-13a7 7 0 0 0-14 0c0 5 3 9 7 13Z" />
                <path d="M12 21V8" />
                <path d="M8.5 11.5 12 8l3.5 3.5" />
              </svg>
            </span>
            <div>
              <p className="text-lg font-bold leading-tight">HillNest</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Menu</p>
            </div>
          </Link>

          <Link
            href="/"
            aria-label="Close menu"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-200 backdrop-blur-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </Link>
        </div>

        <section className="py-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-200">Navigate</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-50">Where would you like to go?</h1>

          <div className="mt-6 flex flex-col gap-3">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-16 items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-slate-100 shadow-[0_10px_26px_rgba(2,6,23,0.18)] backdrop-blur-md transition hover:border-teal-300/30 hover:bg-white/12"
              >
                <span>
                  <span className="block text-base font-bold text-slate-100">{item.label}</span>
                  <span className="mt-0.5 block text-sm text-slate-300">{item.description}</span>
                </span>
                <svg className="h-5 w-5 shrink-0 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 pt-5">
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-slate-100 backdrop-blur-md"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex min-h-14 items-center justify-center rounded-2xl border border-white/18 bg-white/14 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all duration-300 hover:bg-white/18"
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
