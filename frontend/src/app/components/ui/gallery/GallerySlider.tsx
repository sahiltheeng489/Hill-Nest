"use client";

import Image from "next/image";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

export type GallerySlide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
};

type GallerySliderProps = {
  slides: GallerySlide[];
};

export default function GallerySlider({ slides }: GallerySliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasEntered, setHasEntered] = useState(true);

  const totalSlides = slides.length;
  const activeSlide = slides[activeIndex];

  const goToSlide = (nextIndex: number) => {
    startTransition(() => {
      setActiveIndex((nextIndex + totalSlides) % totalSlides);
    });
  };

  const showNext = useEffectEvent(() => {
    startTransition(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    });
  });

  const showPrevious = () => {
    goToSlide(activeIndex - 1);
  };

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const intervalId = window.setInterval(() => {
      showNext();
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [isPaused, totalSlides]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (totalSlides === 0 || !activeSlide) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="HillNest image gallery slider"
      className={`relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.8),rgba(15,23,42,0.62),rgba(15,23,42,0.78))] p-3 shadow-[0_30px_90px_rgba(2,6,23,0.28)] transition-all duration-500 sm:p-4 lg:p-5 ${
        hasEntered ? "translate-y-0 opacity-100" : "translate-y-5 opacity-100"
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_58%)]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-40 w-40 rounded-full bg-slate-400/10 blur-3xl" />

      <div className="relative grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.95fr)]">
        <div className="min-w-0">
          <div className="group relative min-h-[360px] overflow-hidden rounded-[1.25rem] bg-slate-950 shadow-[0_24px_70px_rgba(2,6,23,0.32)] sm:min-h-[500px] lg:min-h-[540px]">
            <Image
              key={activeSlide.src}
              src={activeSlide.src}
              alt={activeSlide.alt}
              fill
              priority={activeIndex === 0}
              quality={92}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="animate-scale-in object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.26)_30%,rgba(2,6,23,0.78)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0)_28%,rgba(2,6,23,0.36)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
              <span className="inline-flex translate-y-2 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition-transform duration-500 group-hover:translate-y-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View Image
              </span>
            </div>

            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white shadow-[0_18px_36px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-teal-200 sm:left-5 sm:h-14 sm:w-14"
              aria-label="Previous gallery image"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-gradient-to-br from-teal-500/90 via-teal-500/90 to-slate-500/90 text-white shadow-[0_18px_36px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-teal-200 sm:right-5 sm:h-14 sm:w-14"
              aria-label="Next gallery image"
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3 sm:left-6 sm:right-6 sm:top-6">
              <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-100 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md">
                {activeSlide.eyebrow}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 backdrop-blur-md">
                <span className="hidden sm:inline">Auto rotating gallery</span>
                <span>{String(activeIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}</span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <div className="rounded-[1.15rem] border border-white/10 bg-white/8 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-100/90">
                  {activeSlide.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {activeSlide.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-[15px]">
                  {activeSlide.description}
                </p>

                <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-300 via-teal-300 to-slate-300 transition-all duration-500"
                      style={{ width: `${((activeIndex + 1) / totalSlides) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                    Slide
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto rounded-[1.15rem] border border-white/10 bg-white/8 p-2 shadow-[0_16px_36px_rgba(2,6,23,0.14)] backdrop-blur-md">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`thumb-${slide.alt}`}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Show slide ${index + 1}: ${slide.title}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative h-16 min-w-24 overflow-hidden rounded-[0.95rem] border transition-all duration-300 sm:h-20 sm:min-w-32 ${
                    isActive
                      ? "border-teal-300 shadow-[0_12px_24px_rgba(56,189,248,0.18)]"
                      : "border-white/10 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt=""
                    fill
                    quality={82}
                    sizes="128px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute inset-x-2 bottom-2 h-1 rounded-full transition-all duration-300 ${
                    isActive ? "bg-teal-300" : "bg-white/35"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 md:gap-4">
          <div className={`rounded-[1.25rem] border border-white/10 bg-white/8 p-5 text-slate-100 shadow-[0_20px_42px_rgba(2,6,23,0.14)] transition-all duration-500 backdrop-blur-md ${hasEntered ? "translate-y-0 opacity-100 delay-100" : "translate-y-4 opacity-100"}`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-100 shadow-sm backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-300" />
              </span>
              Visual Journey
            </span>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-white">
              Wander through the stay before you arrive.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Swipe through quiet terraces, slow breakfasts, and sunlit rooms. Each frame is chosen to help guests feel the pace and mood of HillNest before they book.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.alt}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-pressed={isActive}
                  className={`group flex items-center gap-3 rounded-[1.15rem] border p-3 text-left transition-all duration-500 ${
                    isActive
                      ? "border-teal-300 bg-teal-500/10 shadow-[0_18px_30px_rgba(56,189,248,0.12)]"
                      : "border-white/10 bg-white/8 hover:-translate-y-0.5 hover:border-teal-200/30 hover:bg-white/12 hover:shadow-[0_16px_34px_rgba(2,6,23,0.14)]"
                  }`}
                  style={{
                    transitionDelay: hasEntered ? `${120 + index * 55}ms` : "0ms",
                    opacity: hasEntered ? 1 : 0,
                    transform: hasEntered ? undefined : "translateY(12px)",
                  }}
                  aria-label={`View ${slide.title}`}
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      quality={88}
                      sizes="80px"
                      className={`object-cover transition-transform duration-500 ${
                        isActive ? "scale-105" : "group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-100/80">
                      {slide.eyebrow}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {slide.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {slide.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
