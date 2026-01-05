"use client";

import { FC, useState, useRef, useEffect } from "react";
import { Card } from "./Card";

type HeroItem = {
  id: number;
  image: string;
  title: string;
  description: string;
};

const heroSlides: HeroItem[] = [
  {
    id: 1,
    image:
      "https://cdn.pixabay.com/photo/2024/07/25/14/54/warehouse-8921538_1280.jpg",
    title: "Real-Time Inventory Views",
    description:
      "See your inventory levels update instantly, keeping you informed and in control.",
  },
  {
    id: 2,
    image:
      "https://cdn.pixabay.com/photo/2020/10/07/12/32/warehouse-5635000_1280.jpg",
    title: "Efficient Warehousing",
    description:
      "Track products across your warehouse with clarity and precision.",
  },
  {
    id: 3,
    image:
      "https://cdn.pixabay.com/photo/2016/11/27/21/42/stock-1863880_1280.jpg",
    title: "Actionable Insights",
    description:
      "Turn data into smart decisions with built-in analytics you’ll actually use.",
  },
  {
    id: 4,
    image:
      "https://cdn.pixabay.com/photo/2022/08/07/11/33/port-7370411_1280.jpg",
    title: "Optimized Supply Chain",
    description:
      "Coordinate suppliers and shipments seamlessly for maximum efficiency.",
  },
  {
    id: 5,
    image:
      "https://cdn.pixabay.com/photo/2019/11/08/10/34/cyber-4610993_1280.jpg",
    title: "Secure Stock Management",
    description:
      "Protect your inventory with organized, reliable tracking for every item.",
  },
];

export const Hero: FC = () => {
  const [index, setIndex] = useState(0);
  const autoRef = useRef<number | null>(null);
  const length = heroSlides.length;

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, []);

  const startAuto = () => {
    stopAuto();
    autoRef.current = window.setInterval(() => {
      setIndex((s) => (s + 1) % length);
    }, 3500);
  };

  const stopAuto = () => {
    if (autoRef.current) {
      window.clearInterval(autoRef.current);
      autoRef.current = null;
    }
  };

  const goPrev = () => setIndex((s) => (s - 1 + length) % length);
  const goNext = () => setIndex((s) => (s + 1) % length);

  const computeStyle = (i: number) => {
    const offset = i - index;
    let wrapped = offset;
    if (offset > length / 2) wrapped -= length;
    if (offset < -length / 2) wrapped += length;

    const abs = Math.abs(wrapped);

    return {
      transform: `translateX(${wrapped * 22}%) rotateY(${
        wrapped * 4
      }deg) scale(${1 - abs * 0.06})`,
      opacity: 1 - abs * 0.18,
      zIndex: 40 - abs * 6,
      filter: `blur(${Math.min(abs * 3, 4)}px)`,
      transition:
        "transform 420ms cubic-bezier(.2,.9,.2,1), opacity 300ms ease, filter 400ms ease",
    } as React.CSSProperties;
  };

  return (
    <section className="py-16 px-4 sm:px-6 md:px-8 bg-(--color-background)">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl mb-20 sm:text-3xl font-bold text-(--color-foreground) text-center">
          See What Makes Forge IMS Worth It
        </h2>

        <div className="relative overflow-visible">
          {/* SLIDES */}
          <div className="relative h-80 sm:h-[360px] md:h-[400px] md:mb-24 flex items-center justify-center">
            {heroSlides.map((slide, i) => (
              <Card
                key={slide.id}
                className="
                  absolute
                  w-[90%]
                  sm:w-[70%]
                  md:w-[52%]
                  lg:w-[46%]
                  rounded-xl
                  overflow-hidden
                  shadow-md
                  select-none
                "
                style={computeStyle(i)}
                onMouseEnter={stopAuto}
                onMouseLeave={startAuto}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-40 sm:h-44 md:h-48 object-cover"
                />
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-(--color-foreground)">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-(--color-muted) mt-1 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* CONTROLS */}
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-(--color-card) border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white transition"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-(--color-card) border border-[var(--color-border)] hover:bg-[var(--color-accent)] hover:text-white transition"
          >
            ›
          </button>

          {/* DOTS */}
          <div className="flex justify-center gap-2 mt-20">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="w-2 h-2 rounded-sm transition-all"
                style={{
                  background:
                    i === index ? "var(--color-accent)" : "var(--color-border)",
                  transform: i === index ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
