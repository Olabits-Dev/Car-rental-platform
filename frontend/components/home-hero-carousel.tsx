"use client";

import Image from "next/image";
import { startTransition, useEffect, useEffectEvent, useState } from "react";
import type { Car } from "@/lib/types";

type HomeHeroCarouselProps = {
  cars: Car[];
};

export function HomeHeroCarousel({ cars }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const advanceSlide = useEffectEvent(() => {
    startTransition(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % cars.length);
    });
  });

  useEffect(() => {
    if (cars.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      advanceSlide();
    }, 6000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cars.length]);

  if (cars.length === 0) {
    return null;
  }

  const safeActiveIndex = activeIndex % cars.length;
  const activeCar = cars[safeActiveIndex] ?? cars[0];

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden p-0">
      <div className="relative h-[260px] sm:h-[320px] md:h-[340px] lg:h-[320px] xl:h-[350px]">
        {cars.map((car, index) => (
          <div
            key={car.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === safeActiveIndex ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== safeActiveIndex}
          >
            <Image
              src={car.heroImage}
              alt={car.imageAlt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.04),rgba(17,17,17,0.16)_48%,rgba(17,17,17,0.42)_100%)]" />
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-between bg-white p-5 sm:p-6 md:p-6 lg:p-5 xl:p-6">
        <div className="max-w-2xl text-[#111111]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#d61032]">
            Picked for you
          </p>
          <h2 className="home-title mt-2 text-3xl text-[#111111] sm:text-4xl md:text-[2.8rem] lg:text-[2.6rem] xl:text-[2.95rem]">
            {activeCar.name}
          </h2>
          <p className="mt-2.5 text-[0.92rem] leading-5 text-[#565656] md:leading-5">
            {activeCar.summary}
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {[
              activeCar.location,
              `${activeCar.seats} seats`,
              activeCar.transmission,
              activeCar.fuel,
            ].map((item) => (
              <span
                key={item}
                className="luxury-chip border-[#d7d7d7] bg-white text-[#111111]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {cars.length > 1 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[rgba(17,17,17,0.9)] px-3 py-2">
              {cars.map((car, index) => {
                const isActive = index === safeActiveIndex;

                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => {
                      startTransition(() => {
                        setActiveIndex(index);
                      });
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? "w-8 bg-[#d61032]" : "w-2.5 bg-white/60"
                    }`}
                    aria-label={`Show ${car.name}`}
                  />
                );
              })}
            </div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#444444] sm:text-xs sm:tracking-[0.18em]">
              More customer favorites every 6 seconds
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
