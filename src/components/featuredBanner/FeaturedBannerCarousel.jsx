import React from "react";
import { Carousel } from "antd";
import "./index.scss";

export default function FeaturedBannerCarousel({
  banners = [],
  ariaLabel,
  imageAlt,
  autoplay = false,
  className = "",
  children,
}) {
  const slides = banners
    .map((banner) => {
      const source =
        typeof banner === "string"
          ? banner
          : banner?.banner || banner?.image || banner?.url;

      return source ? { banner, source } : null;
    })
    .filter(Boolean);

  if (slides.length === 0) return null;

  return (
    <section
      className={`featured-banner-carousel ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <Carousel
        autoplay={autoplay}
        dots={slides.length > 1}
        arrows={slides.length > 1}
      >
        {slides.map(({ banner, source }, index) => {
          const image = (
            <img
              src={source}
              alt={
                typeof banner === "string"
                  ? imageAlt
                  : banner.alt || banner.title || imageAlt
              }
            />
          );
          const key =
            typeof banner === "string"
              ? `${source}-${index}`
              : banner._id || `${source}-${index}`;

          return (
            <div key={key}>
              {banner?.href ? (
                <a href={banner.href} aria-label={banner.title || imageAlt}>
                  {image}
                </a>
              ) : (
                image
              )}
            </div>
          );
        })}
      </Carousel>
      {children}
    </section>
  );
}
