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
  const [user, setUser] = useState<{ name: string; email: string; role?: "user" | "admin" } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setUser(getStoredUser()), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const t = setTimeout(() => setMenuOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const ids = navLinks.map(n => n.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [isHome]);

  const getNavHref = (hashHref: string) => (isHome ? hashHref : `/${hashHref}`);
  const dashboardHref = user?.role === "admin" ? "/admin" : "/user";

  const handleLogout = () => {
    logoutUser();
    closeMenu();
    setUser(null);
    router.push("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isTransparent = !scrolled && isHome && !menuOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${
        isTransparent
          ? "bg-green-950/70 backdrop-blur-sm"
          : "bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100/80"
      }`}
    >
      <Container>
        <div className="flex min-h-[64px] items-center justify-between gap-2 py-2.5 sm:min-h-[72px] sm:gap-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="inline-flex min-w-0 items-center gap-2" onClick={closeMenu}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-emerald-500 text-white shadow-sm">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21c4-4 7-8 7-13a7 7 0 0 0-14 0c0 5 3 9 7 13Z" />
                  <path d="M12 21V8" />
                  <path d="M8.5 11.5 12 8l3.5 3.5" />
                </svg>
              </span>
              <div>
                <h1 className={`text-lg font-bold tracking-tight sm:text-2xl ${isTransparent ? "text-white" : "text-gray-900"}`}>
                  Hill<span className="text-green-700">Nest</span>
                </h1>
                <p className={`hidden text-[10px] font-medium uppercase tracking-[0.18em] min-[390px]:block sm:text-xs sm:tracking-[0.24em] ${
                  isTransparent ? "text-white/70" : "text-gray-500"
                }`}>
                  Homestay booking
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex gap-7 font-medium text-sm">
            {navLinks.map(({ label, href }) => {
              const isActive = isHome && activeSection === href.replace("#", "");
              return (
                <Link
                  key={label}
                  href={getNavHref(href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative group transition-colors duration-200 ${
                    isTransparent
                      ? isActive ? "text-white" : "text-white/80 hover:text-white"
                      : isActive ? "text-green-700" : "text-gray-600 hover:text-green-700"
                  }`}
                >
                  {label}
                  <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-green-500 rounded-full transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardHref}
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
              <>
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
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-800 to-emerald-600 text-white text-sm font-semibold shadow-md shadow-green-900/25 hover:from-green-700 hover:to-emerald-500 hover:shadow-green-900/35 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}

            <Link
              id="mobile-menu-btn"
              href="/menu"
              aria-label="Open menu"
              className={`md:hidden relative z-[92] inline-flex h-14 w-14 shrink-0 cursor-pointer select-none items-center justify-center rounded-2xl border touch-manipulation transition-colors duration-200 ${
                isTransparent
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-gray-200 bg-white text-gray-700 hover:border-green-300"
              }`}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>

    </nav>
  );
}
