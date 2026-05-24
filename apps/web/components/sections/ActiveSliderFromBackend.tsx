"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Autoplay, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import contentService, { SlideItem } from "@/services/contentService";

import "swiper/css";

const SWIPER_CONFIG = {
  slidesPerView: 1,
  spaceBetween: 20,
  speed: 5000,
  loop: true,
  grabCursor: true,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
  },
  breakpoints: {
    768: { slidesPerView: 2 },
    1280: { slidesPerView: 3 },
  },
};

function ServiceCard({ service }: { service: SlideItem }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="relative h-72 w-full">
        <Image
          src={service.image}
          alt={service.title || "Slide image"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-orange-500 to-red-600 transition-all duration-300 group-hover:w-full" />
    </article>
  );
}

export default function ActiveSliderFromBackend() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      try {
        const response = await contentService.getSlides();
        if (!mounted) return;
        setSlides(response);
      } catch {
        if (!mounted) return;
        setError("Failed to fetch slides");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSlides();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-orange-500 border-b-gray-700" />
      </div>
    );
  }

  if (error) {
    return <p className="mt-10 text-center text-red-500">{error}</p>;
  }

  if (slides.length === 0) {
    return <p className="mt-20 text-center text-gray-500">No slides to display.</p>;
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <Swiper {...SWIPER_CONFIG} modules={[Autoplay, A11y]} className="w-full">
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.id || index}>
              <div className="h-full py-2">
                <ServiceCard service={slide} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
