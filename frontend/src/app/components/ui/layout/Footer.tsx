import Container from "@/app/components/ui/ui/Container";
import Button from "@/app/components/ui/ui/Button";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Our Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Future Scaling", href: "#scaling" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
  { label: "Bookings", href: "/bookings" },
];

const policies = [
  { label: "Check-in: 12:00 PM" },
  { label: "Check-out: 11:00 AM" },
  { label: "No smoking inside" },
  { label: "Pets on request" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-950 via-green-950/40 to-gray-950 text-gray-400">
      {/* CTA Banner */}
      <div className="border-b border-white/5">
        <Container>
          <div className="py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-2">
                Ready to escape?
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-white font-serif leading-snug">
                Book Your Mountain Retreat Today
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Limited rooms available. Reserve your stay now.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button id="footer-book-btn" variant="primary" size="md">
                Book Now
              </Button>
              <a
                href="tel:+919876543210"
                id="footer-call-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                📞 Call Us
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer */}
      <Container>
        <div className="pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Hill<span className="text-green-400">Nest</span>
              </h2>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              A peaceful mountain homestay near Siliguri, West Bengal — offering warmth,
              comfort, and stunning valley views since 2015.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 hover:text-green-400 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">📞</span>
                <span>+91 98765 43210</span>
              </a>
              <a
                href="mailto:hillnest@email.com"
                className="flex items-center gap-3 hover:text-green-400 transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">✉️</span>
                <span>hillnest@email.com</span>
              </a>
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0 mt-0.5">📍</span>
                <span>Near Sevoke Road, Siliguri,<br />West Bengal — 734001</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-white font-semibold mb-5 uppercase tracking-widest text-xs">
              Quick Links
            </p>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-gray-500 hover:text-green-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-green-700 group-hover:bg-green-400 transition-colors" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <p className="text-white font-semibold mb-5 uppercase tracking-widest text-xs">
              House Policies
            </p>
            <ul className="space-y-3">
              {policies.map(({ label }) => (
                <li key={label} className="text-sm text-gray-500 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  {label}
                </li>
              ))}
            </ul>

            {/* Social */}
            <div className="mt-8">
              <p className="text-white font-semibold mb-4 uppercase tracking-widest text-xs">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { label: "Instagram", icon: "📸", href: "#" },
                  { label: "Facebook", icon: "👍", href: "#" },
                  { label: "WhatsApp", icon: "💬", href: "#" },
                ].map(({ label, icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-green-700/30 border border-white/10 flex items-center justify-center text-base transition-all hover:scale-110 hover:border-green-700/40"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} HillNest Homestay. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with{" "}
            <span className="text-green-500">❤️</span>{" "}
            in the mountains of West Bengal
          </p>
        </div>
      </Container>
    </footer>
  );
}
