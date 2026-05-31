import Link from "next/link";
import Container from "@/app/components/ui/ui/Container";
import Button from "@/app/components/ui/ui/Button";

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "Our Rooms", href: "/#rooms" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
  { label: "Bookings", href: "/bookings" },
];

const policies = [
  { label: "Check-in: 12:00 PM" },
  { label: "Check-out: 11:00 AM" },
  { label: "No smoking inside rooms" },
  { label: "Pets allowed on request" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-b from-green-900 via-green-800 to-emerald-700 text-green-50">
      <div className="border-b border-white/20">
        <Container>
          <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-100 mb-2">
                Plan your stay
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-white font-serif leading-snug">
                Book Your Mountain Retreat Today
              </h3>
              <p className="text-green-100/90 text-sm mt-1 font-medium">
                Limited rooms available on peak dates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/rooms">
                <Button id="footer-book-btn" variant="primary" size="md">
                  Book Now
                </Button>
              </Link>
              <a
                href="tel:+919876543210"
                id="footer-call-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
              >
                Call Us
              </a>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                HN
              </div>
              <h2 className="text-2xl font-bold text-white">
                Hill<span className="text-green-400">Nest</span>
              </h2>
            </div>
            <p className="text-sm text-green-100/90 max-w-xs leading-relaxed">
              A peaceful mountain homestay near Siliguri, West Bengal offering warm hospitality,
              comfort, and scenic valley views.
            </p>

            <div className="mt-6 space-y-2.5 text-sm">
              <a href="tel:+919876543210" className="block text-green-50 hover:text-white transition-colors font-medium">
                +91 98765 43210
              </a>
              <a href="mailto:hillnest@email.com" className="block text-green-50 hover:text-white transition-colors font-medium">
                hillnest@email.com
              </a>
              <p className="text-green-100/90">Near Sevoke Road, Siliguri, West Bengal - 734001</p>
            </div>
          </div>

          <div>
            <p className="text-white font-semibold mb-5 uppercase tracking-widest text-xs">Quick Links</p>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-green-50 hover:text-white transition-colors flex items-center gap-2 group font-medium"
                  >
                  <span className="w-1 h-1 rounded-full bg-green-200 group-hover:bg-white transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white font-semibold mb-5 uppercase tracking-widest text-xs">House Policies</p>
            <ul className="space-y-3">
              {policies.map(({ label }) => (
                <li key={label} className="text-sm text-green-50 flex items-start gap-2 font-medium">
                  <span className="text-green-200 mt-0.5">*</span>
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="text-white font-semibold mb-4 uppercase tracking-widest text-xs">Follow Us</p>
              <div className="flex gap-3 text-xs">
                <a href="#" className="px-3 py-2 rounded-lg bg-white/15 border border-white/30 text-green-50 hover:border-white/60 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="px-3 py-2 rounded-lg bg-white/15 border border-white/30 text-green-50 hover:border-white/60 hover:text-white transition-colors">
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/25 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-green-100/90">
          <p>Copyright {new Date().getFullYear()} HillNest Homestay. All rights reserved.</p>
          <p>Designed for a calm mountain stay experience.</p>
        </div>
      </Container>
    </footer>
  );
}
