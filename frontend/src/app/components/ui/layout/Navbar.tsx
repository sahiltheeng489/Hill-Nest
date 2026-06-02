"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/app/components/ui/ui/Container";
import { getStoredUser, logoutUser } from "@/services/authService";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Rooms", href: "#rooms" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setUser(getStoredUser()), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const isHome = pathname === "/";
  const getNavHref = (hashHref: string) => (isHome ? hashHref : `/${hashHref}`);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/");
  };

  /* text colour helpers based on scroll/page state */
  const isTransparent = !scrolled && isHome;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 ${
        isTransparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100/80"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between py-4 gap-3">

          {/* ── Brand ── */}
          <Link href="/" className="inline-flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight leading-none transition-colors duration-300 ${isTransparent ? "text-white" : "text-gray-900"}`}>
                Hill<span className={isTransparent ? "text-green-400" : "text-green-700"}>Nest</span>
              </h1>
              <p className={`text-[10px] uppercase tracking-[0.22em] font-medium ${isTransparent ? "text-white/60" : "text-gray-400"}`}>
                Homestay
              </p>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex gap-7 font-medium text-sm">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={getNavHref(href)}
                className={`relative group transition-colors duration-200 ${
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-green-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* ── Right: auth buttons ── */}
          <div className="flex items-center gap-2.5">
            {user ? (
              /* Logged-in state */
              <div className="flex items-center gap-2">
                <Link
                  href="/user"
                  className={`inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 border ${
                    isTransparent
                      ? "glass border-white/30 text-white hover:bg-white/20"
                      : "bg-white border-gray-200 text-gray-700 hover:border-green-600 hover:text-green-700"
                  }`}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-700 to-emerald-500 text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                {!isHome && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 transition-all duration-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              /* Guest state */
              <>
                {/* Sign In — adapts to bg */}
                <Link
                  href="/login"
                  className={`hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isTransparent
                      ? "text-white/85 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  Sign In
                </Link>
                {/* Get Started — solid green gradient always */}
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white text-sm font-semibold shadow-md shadow-green-900/25 hover:from-green-700 hover:to-emerald-500 hover:shadow-green-900/35 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              id="mobile-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className={`md:hidden relative z-[71] inline-flex h-10 w-10 items-center justify-center rounded-lg border touch-manipulation transition-colors duration-200 ${
                isTransparent
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
              }`}
            >
              <span className="text-lg leading-none">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </Container>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden relative z-[70] bg-white/98 backdrop-blur-xl border-t border-gray-100 animate-fade-in shadow-lg">
          <div className="px-6 py-5 flex flex-col gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={getNavHref(href)}
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-green-700 hover:bg-green-50 transition-colors py-2.5 px-3 rounded-xl border-b border-gray-50 last:border-0"
              >
                {label}
              </Link>
            ))}

            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/user"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold text-sm"
                  >
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-700 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    {user.name} — Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:border-green-400 hover:text-green-700 transition-colors text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white text-sm font-semibold text-center hover:from-green-700 hover:to-emerald-500 transition-all"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
