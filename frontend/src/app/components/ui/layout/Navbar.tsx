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
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => getStoredUser());
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const getNavHref = (hashHref: string) => (isHome ? hashHref : `/${hashHref}`);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100/80"
          : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between py-4 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Hill<span className="text-green-700">Nest</span>
                </h1>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-gray-500">Home stay booking</p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-7 font-medium text-sm">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={getNavHref(href)}
                className={`relative group transition-colors duration-200 ${
                  scrolled || !isHome
                    ? "text-gray-600 hover:text-green-700"
                    : "text-white/85 hover:text-white"
                }`}
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-green-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/user"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-green-700 hover:text-green-700"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>
                </Link>
                {!isHome && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-500 hover:text-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-semibold text-gray-600 transition-colors hover:text-green-700 sm:inline"
                >
                  Login
                </Link>
                <Link href="/register">
                  <span className="inline-flex rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-md shadow-green-900/20 transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-500 hover:shadow-lg hover:shadow-green-900/30 active:scale-95">
                    Register
                  </span>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700"
            >
              <span className="text-lg leading-none">{menuOpen ? "\u2715" : "\u2630"}</span>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-t border-gray-100 animate-fade-in">
          <div className="px-6 py-5 flex flex-col gap-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={getNavHref(href)}
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium hover:text-green-700 transition-colors py-1 border-b border-gray-50"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
