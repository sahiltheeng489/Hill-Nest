"use client";

import Link from "next/link";
import Container from "@/app/components/ui/ui/Container";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Our Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
  { label: "My Bookings", href: "/bookings" },
];

const policies = [
  { icon: "🕛", label: "Check-in: 12:00 PM" },
  { icon: "🕙", label: "Check-out: 11:00 AM" },
  { icon: "🚭", label: "No smoking inside" },
  { icon: "🐾", label: "Pets on request" },
  { icon: "❄️", label: "AC in all rooms" },
  { icon: "☕", label: "Breakfast included" },
];

const socials = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919876543210",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="footer-root">

      {/* Top accent line */}
      <div className="h-[3px] bg-gradient-to-r from-green-200 via-green-400 to-green-200" />

      {/* ── CTA Banner — gradient transition into dark footer ── */}
      <div className="bg-gradient-to-b from-green-50 via-green-50 to-[#052e1a] pt-14 pb-0">
        <Container>
          <div className="relative bg-white border-2 border-green-200 rounded-3xl p-8 md:p-12 shadow-[0_8px_40px_rgba(20,83,45,0.08)] overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-green-100 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-green-50 pointer-events-none" />

            <div className="relative flex flex-wrap gap-8 items-center justify-between">
              <div className="max-w-lg">
                <span className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Reserve Your Stay
                </span>
                <h3 className="font-serif text-3xl md:text-4xl font-extrabold text-green-950 leading-tight">
                  Let the hills set the pace<br />for your next escape.
                </h3>
                <p className="mt-4 text-green-800/70 text-[0.95rem] leading-relaxed max-w-md">
                  From sunrise valley views to cosy evenings by the fire, HillNest is ready when you are. Reserve a room and we&apos;ll take care of the rest.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/rooms"
                  id="footer-book-btn"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-[0_4px_16px_rgba(22,163,74,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(22,163,74,0.35)] transition-all duration-200"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Explore Rooms
                </Link>
                <a
                  href="tel:+919876543210"
                  id="footer-call-btn"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-green-50 text-green-700 border-2 border-green-300 hover:border-green-500 px-6 py-3.5 rounded-2xl font-bold text-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.1 1.19 2 2 0 012.08 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l1.45-1.45a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 13.92v3z" /></svg>
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main grid ── */}
      <div className="bg-[#052e1a] pt-16 pb-0">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-16">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(22,163,74,0.25)]">
                  🌿
                </div>
                <div>
                  <p className="font-extrabold text-lg text-white leading-none">
                    Hill<span className="text-green-300">Nest</span>
                  </p>
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-green-400 mt-0.5">
                    Mountain Homestay
                  </p>
                </div>
              </div>
              <p className="text-green-100/80 text-sm leading-relaxed mb-6">
                A warm mountain retreat near Siliguri with calm mornings, thoughtful hospitality, and rooms designed for slow, memorable stays.
              </p>
              {[
                { icon: "📞", label: "+91 98765 43210", href: "tel:+919876543210" },
                { icon: "✉️", label: "hillnest@email.com", href: "mailto:hillnest@email.com" },
                { icon: "📍", label: "Near Sevoke Road, Siliguri, WB 734001", href: "https://maps.google.com" },
              ].map(({ icon, label, href }) => (
                <a
                  key={href}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="footer-contact-link"
                >
                  <span className="footer-icon-box">{icon}</span>
                  <span className="pt-1 leading-relaxed">{label}</span>
                </a>
              ))}
            </div>

            {/* Quick links */}
            <div>
              <p className="footer-heading">
                <span className="footer-heading-bar" />
                Quick Links
              </p>
              {quickLinks.map(({ label, href }) => (
                <a key={label} href={href} className="footer-link">
                  <span className="footer-link-dot" />
                  {label}
                </a>
              ))}
            </div>

            {/* Policies + social */}
            <div>
              <p className="footer-heading">
                <span className="footer-heading-bar" />
                House Policies
              </p>
              {policies.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-green-100/80 text-sm mb-0.5"
                >
                  <span className="text-base">{icon}</span>
                  {label}
                </div>
              ))}

              <div className="h-px bg-green-900/60 my-5" />

              <p className="footer-heading">
                <span className="footer-heading-bar" />
                Follow Us
              </p>
              <div className="flex gap-2.5">
                {socials.map(({ label, icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="footer-social-btn"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-green-900/50 py-6 pb-8 flex flex-wrap gap-3 items-center justify-between">
            <p className="text-green-200/70 text-xs">
              © {new Date().getFullYear()} <span className="text-green-300 font-semibold">HillNest Homestay</span> · All rights reserved.
            </p>
            <p className="text-green-200/70 text-xs flex items-center gap-1.5">
              Crafted with <span className="text-green-400 text-sm">♥</span> in the mountains of West Bengal
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
