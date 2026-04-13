"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { CarGalleryImage } from "@/lib/types";

type CarGalleryProps = {
  brand: string;
  name: string;
  description: string;
  pricePerDay: number;
  gallery: CarGalleryImage[];
};

export function CarGallery({
  brand,
  name,
  description,
  pricePerDay,
  gallery,
}: CarGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const activeImage = gallery[selectedIndex] ?? gallery[0];
  const hasMultipleImages = gallery.length > 1;

  useEffect(() => {
    if (!isViewerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }

      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((currentIndex) => (currentIndex + 1) % gallery.length);
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex(
          (currentIndex) => (currentIndex - 1 + gallery.length) % gallery.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gallery.length, hasMultipleImages, isViewerOpen]);

  const openViewer = (index: number) => {
    setSelectedIndex(index);
    setIsViewerOpen(true);
  };

  const showPreviousImage = () => {
    setSelectedIndex(
      (currentIndex) => (currentIndex - 1 + gallery.length) % gallery.length,
    );
  };

  const showNextImage = () => {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % gallery.length);
  };

  if (!activeImage) {
    return null;
  }

  return (
    <>
      <div className="space-y-5">
        <div className="glass-panel overflow-hidden p-0">
          <button
            type="button"
            onClick={() => setIsViewerOpen(true)}
            className="group relative block h-[300px] w-full cursor-zoom-in overflow-hidden text-left sm:h-[340px] md:h-[470px]"
            aria-label={`Open gallery for ${name}`}
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.04),rgba(17,17,17,0.22)_34%,rgba(17,17,17,0.6)_100%)]" />
            <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#111111] shadow-[0_10px_20px_rgba(17,24,39,0.12)] sm:right-4 sm:top-4 sm:px-4 sm:text-[0.68rem] sm:tracking-[0.2em]">
              Tap to expand
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-10">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-2xl text-white">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#ffb1bd]">
                    {brand}
                  </p>
                  <h1 className="mt-4 font-[var(--font-display)] text-3xl leading-[0.92] tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
                    {name}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {activeImage.label}
                    </span>
                    <span className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {brand}
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82 sm:text-base sm:leading-8">
                    {description}
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-white/14 bg-[rgba(17,17,17,0.78)] px-4 py-3 text-right text-white backdrop-blur-sm sm:px-5 sm:py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#d5d5d5]">
                    Daily rate
                  </p>
                  <p className="mt-2 font-[var(--font-display)] text-4xl leading-none">
                    {formatCurrency(pricePerDay)}
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {gallery.map((image, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={`${image.src}-${image.label}`}
                type="button"
                onClick={() => openViewer(index)}
                className={`group relative h-32 overflow-hidden rounded-[1.1rem] border text-left transition sm:h-40 sm:rounded-[1.25rem] ${
                  isActive
                    ? "border-[#d61032] shadow-[0_12px_24px_rgba(214,16,50,0.12)]"
                    : "border-[#e2e2e2] bg-white hover:border-[#d61032]"
                }`}
                aria-label={`View ${image.label.toLowerCase()} of ${name}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 40vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.03),rgba(17,17,17,0.58))]" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#ffffff]">
                    View {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{image.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isViewerOpen ? (
        <div
          className="fixed inset-0 z-50 bg-[rgba(17,17,17,0.94)] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery viewer`}
          onClick={() => setIsViewerOpen(false)}
        >
          <div
            className="relative mx-auto flex h-full w-full max-w-[96rem] flex-col gap-4 px-4 py-4 md:px-6 md:py-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#ff9aaa]">
                  {brand}
                </p>
                <h2 className="mt-2 font-[var(--font-display)] text-4xl leading-none text-white md:text-5xl">
                  {name}
                </h2>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-[#f1f1f1]">
                  {activeImage.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="rounded-[0.9rem] border border-white/18 bg-white px-4 py-2 text-sm font-semibold text-[#111111] transition hover:border-[#d61032] hover:text-[#d61032]"
              >
                Close
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[1.8rem] border border-white/12 bg-[#111111]">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />

              {hasMultipleImages ? (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-[0.9rem] bg-white px-4 py-3 text-sm font-semibold text-[#111111] transition hover:text-[#d61032]"
                    aria-label="View previous image"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-[0.9rem] bg-white px-4 py-3 text-sm font-semibold text-[#111111] transition hover:text-[#d61032]"
                    aria-label="View next image"
                  >
                    Next
                  </button>
                </>
              ) : null}

              <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]">
                {selectedIndex + 1} / {gallery.length}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-x-auto pb-1 lg:grid-cols-4">
              {gallery.map((image, index) => {
                const isActive = index === selectedIndex;

                return (
                  <button
                    key={`${image.src}-${image.label}-viewer`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`relative h-28 overflow-hidden rounded-[1.2rem] border text-left transition ${
                      isActive
                        ? "border-[#d61032]"
                        : "border-white/18 hover:border-[#d61032]"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 18vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.03),rgba(17,17,17,0.72))]" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#ffffff]">
                        View {index + 1}
                      </p>
                      <p className="mt-1 text-xs font-medium text-white">
                        {image.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
