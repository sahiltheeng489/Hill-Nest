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
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrollY(y);
        setScrolled(y > 20);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
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

  const getNavHref = (href: string) => (href.startsWith("#") ? (isHome ? href : `/${href}`) : href);
  const dashboardHref = user?.role === "admin" ? "/admin" : "/user";
  const glassProgress = Math.min(scrollY / 140, 1);

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
  const navBackground = isTransparent
    ? `rgba(3, 7, 18, ${0.26 + glassProgress * 0.06})`
    : `rgba(8, 15, 29, ${0.42 + glassProgress * 0.08})`;
  const navBorder = isTransparent
    ? `rgba(255, 255, 255, ${0.16 + glassProgress * 0.06})`
    : `rgba(255, 255, 255, ${0.34 + glassProgress * 0.06})`;
  const navShadow = isTransparent
    ? `0 ${10 + glassProgress * 12}px ${30 + glassProgress * 24}px rgba(2, 6, 23, ${0.1 + glassProgress * 0.16})`
    : `0 ${10 + glassProgress * 12}px ${28 + glassProgress * 24}px rgba(15, 23, 42, ${0.08 + glassProgress * 0.1})`;
  const navBlur = `blur(${14 + glassProgress * 8}px) saturate(${1.2 + glassProgress * 0.12})`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[90] border-b border-t transition-all duration-500 ease-out ${isTransparent ? "text-white" : "text-slate-100"}`}
      style={{
        backgroundColor: navBackground,
        borderBottomColor: navBorder,
        borderTopColor: "rgba(255,255,255,0.03)",
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
        boxShadow: navShadow,
      }}
    >
      <Container>
        <div className="flex min-h-[64px] items-center justify-between gap-2 py-2.5 sm:min-h-[72px] sm:gap-3 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="inline-flex min-w-0 items-center gap-2" onClick={closeMenu}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm backdrop-blur-md ${
                isTransparent
                  ? "border border-white/15 bg-white/10 text-white"
                  : "border border-white/12 bg-white/8 text-teal-200"
              }`}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21c4-4 7-8 7-13a7 7 0 0 0-14 0c0 5 3 9 7 13Z" />
                  <path d="M12 21V8" />
                  <path d="M8.5 11.5 12 8l3.5 3.5" />
                </svg>
              </span>
              <div>
                <h1 className={`text-lg font-bold tracking-tight sm:text-2xl ${isTransparent ? "text-white" : "text-slate-100"}`}>
                  Hill<span className={isTransparent ? "text-teal-200" : "text-teal-300"}>Nest</span>
                </h1>
                <p className={`hidden text-[10px] font-medium uppercase tracking-[0.18em] min-[390px]:block sm:text-xs sm:tracking-[0.24em] ${
                  isTransparent ? "text-white/70" : "text-slate-300"
                }`}>
                  Homestay booking
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2.5 text-sm font-medium">
            {navLinks.map(({ label, href }) => {
              const isActive = (href.startsWith("#") && isHome && activeSection === href.replace("#", "")) || pathname === href;
              return (
                <Link
                  key={label}
                  href={getNavHref(href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group inline-flex items-center border-b px-1.5 py-2 transition-all duration-200 backdrop-blur-md ${
                    isTransparent
                      ? isActive
                        ? "border-teal-200/70 text-white"
                        : "border-transparent text-white/72 hover:border-white/30 hover:text-white"
                      : isActive
                        ? "border-teal-400/70 text-slate-100"
                        : "border-transparent text-slate-300 hover:border-teal-300/35 hover:text-slate-100"
                  }`}
                >
                  <span className="relative">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardHref}
                  className={`animate-button-in inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 border ${
                    isTransparent
                      ? "border-white/14 bg-white/8 text-white hover:bg-white/12 backdrop-blur-md"
                      : "border-white/12 bg-white/8 text-slate-100 hover:bg-white/12 hover:border-white/20 backdrop-blur-md"
                  }`}
                  style={{ animationDelay: "0.12s" }}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 via-teal-500 to-slate-500 text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
                {!isHome && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-white/12 bg-white/8 px-3.5 py-2 text-sm font-semibold text-inherit backdrop-blur-md transition-all duration-200 hover:border-rose-300/40 hover:bg-rose-500/10 hover:text-rose-100"
                >
                  Logout
                </button>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`animate-button-in hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isTransparent
                      ? "text-white/85 hover:text-white hover:bg-white/10 backdrop-blur-md"
                      : "border border-white/12 bg-white/8 text-slate-100 hover:bg-white/12 hover:border-white/20 backdrop-blur-md"
                  }`}
                  style={{ animationDelay: "0.18s" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="animate-button-in hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/14 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/18 active:scale-95"
                  style={{ animationDelay: "0.24s" }}
                >
                  Get Started
                </Link>
              </>
            )}

            <Link
              id="mobile-menu-btn"
              href="/menu"
              aria-label="Open menu"
              className={`animate-button-in md:hidden relative z-[92] inline-flex h-14 w-14 shrink-0 cursor-pointer select-none items-center justify-center rounded-2xl border touch-manipulation transition-colors duration-200 ${
                  isTransparent
                  ? "border-white/14 bg-white/8 text-white hover:bg-white/12 backdrop-blur-md"
                  : "border-white/12 bg-white/8 text-slate-100 hover:bg-white/12 hover:border-white/20 backdrop-blur-md"
              }`}
              style={{ animationDelay: "0.28s" }}
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
