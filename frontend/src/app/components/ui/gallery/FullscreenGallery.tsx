"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type FullscreenGallerySlide = {
  src: string;
  alt: string;
  title: string;
};

type FullscreenGalleryProps = {
  slides: FullscreenGallerySlide[];
  showRailControls?: boolean;
};

export default function FullscreenGallery({ slides, showRailControls = true }: FullscreenGalleryProps) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const railDraggingRef = useRef(false);
  const activeIndexRef = useRef(0);
  const slideRatiosRef = useRef<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRailVisible, setIsRailVisible] = useState(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    slideRatiosRef.current = Array.from({ length: slides.length }, () => 0);

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          slideRatiosRef.current[index] = entry.intersectionRatio;

          const nextVisible = slideRatiosRef.current.some((ratio) => ratio >= 0.7);
          setIsRailVisible((current) => (current === nextVisible ? current : nextVisible));

          let nextActiveIndex = 0;
          let highestRatio = -1;

          slideRatiosRef.current.forEach((ratio, candidateIndex) => {
            if (ratio > highestRatio) {
              highestRatio = ratio;
              nextActiveIndex = candidateIndex;
            }
          });

          if (highestRatio >= 0.7) {
            setActiveIndex((current) => (current === nextActiveIndex ? current : nextActiveIndex));
          }
        },
        { threshold: [0, 0.7, 1] },
      );

      observer.observe(section);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [slides.length]);

  const scrollToSlide = (index: number) => {
    const target = sectionRefs.current[index];
    if (!target) return;

    if (index === activeIndexRef.current) {
      return;
    }

    setActiveIndex(index);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const stopDragging = () => {
      railDraggingRef.current = false;
    };

    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    return () => {
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, []);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative min-h-screen scroll-smooth snap-y snap-mandatory bg-[#04151a] text-white">
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_top_left,rgba(111,148,135,0.12),transparent_28%),linear-gradient(180deg,rgba(4,21,26,0.15)_0%,rgba(4,21,26,0.45)_100%)]" />

      <div
        className={`fixed right-3 top-1/2 z-30 -translate-y-1/2 transition-[opacity,transform] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform sm:right-4 ${
          showRailControls && isRailVisible
            ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-0 scale-[0.98] opacity-0"
        }`}
        aria-hidden={!showRailControls || !isRailVisible}
      >
        <div
          className="flex flex-col items-center gap-1.5 rounded-full border border-white/10 bg-white/7 px-2 py-2.5 shadow-[0_14px_28px_rgba(2,6,23,0.16)] backdrop-blur-lg"
          onPointerDown={() => {
            railDraggingRef.current = true;
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={slide.alt}
                type="button"
                aria-label={`Go to ${slide.title}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => scrollToSlide(index)}
                onPointerEnter={() => {
                  if (railDraggingRef.current) {
                    scrollToSlide(index);
                  }
                }}
                className={`h-2 w-2 rounded-full border transition-all duration-300 ease-out ${
                  isActive
                    ? "scale-110 border-white/30 bg-white"
                    : "border-white/20 bg-white/22 hover:bg-white/40"
                }`}
              />
            );
          })}
        </div>
      </div>

      {slides.map((slide, index) => {
        const isActive = index === activeIndex;

        return (
          <section
            key={slide.src}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            className="relative flex min-h-screen snap-start items-end overflow-hidden"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority
              loading="eager"
              quality={92}
              sizes="100vw"
              className="object-cover"
              style={{
                transform: isActive ? "scale(1)" : "scale(1.025)",
                opacity: isActive ? 1 : 0.92,
                filter: "blur(0px)",
                transition:
                  "transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms cubic-bezier(0.22, 1, 0.36, 1), filter 650ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform, opacity, filter",
              }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,21,26,0.12)_0%,rgba(4,21,26,0.22)_42%,rgba(4,21,26,0.68)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_26%)]" />

            <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
              <h2
                className={`mx-auto w-fit max-w-full whitespace-nowrap text-center text-[15px] font-bold tracking-[0.14em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] sm:text-[18px] ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  animation: isActive
                    ? "galleryTitlePop 800ms cubic-bezier(0.22, 1, 0.36, 1) both"
                    : "none",
                  willChange: "transform, opacity, filter",
                }}
              >
                {slide.title}
              </h2>
            </div>

          </section>
        );
      })}
    </div>
  );
}
