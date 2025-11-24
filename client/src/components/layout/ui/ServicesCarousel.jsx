// src/components/layout/ui/ServicesCarousel.jsx
import React from "react";
import Slider from "react-slick";
import ServiceCard from "./ServiceCard";

// You can keep this here or pass items via props from a parent.
const defaultServices = [
  { title: "Oil Change",       img: "/images/oil.jpg" },
  { title: "Tire Replacement", img: "/images/tires.jpg" },
  { title: "Alignment",        img: "/images/alignment.jpg" },
  { title: "Brake Service",    img: "/images/brakes.jpg" },
  { title: "Battery",          img: "/images/battery.jpg" },
  { title: "Inspections",     img: "/images/inspection.jpg" },
];

function Arrow({ className, onClick, label }) {
  const isPrev = className?.includes("slick-prev");
  return (
    <button
      type="button"
      aria-label={label}
      className={`slick-arrow-btn ${isPrev ? "prev" : "next"}`}
      onClick={onClick}
    >
      {isPrev ? "‹" : "›"}
    </button>
  );
}

/**
 * Keeps a 3-card layout and consistent gutters regardless of item count.
 * - Exactly 3 items: duplicates to 6 so infinite stays enabled.
 * - >3 items: uses your items as-is.
 * - Mobile/tablet breakpoints still show 2/1 as before.
 */
export default function ServicesCarousel({ items = defaultServices }) {
  const original = items;
  const hasAtLeastThree = original.length >= 3;

  // Duplicate if exactly 3 so react-slick keeps infinite rotation/arrows active.
  const data = original.length === 3 ? [...original, ...original] : original;

  // Always show 3 on desktop to keep the look.
  const slidesToShowDesktop = 3;

  const settings = {
    infinite: hasAtLeastThree,                 // stays true even when 3 due to duplication
    speed: 450,
    slidesToShow: slidesToShowDesktop,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    arrows: hasAtLeastThree,
    prevArrow: <Arrow label="Previous" />,
    nextArrow: <Arrow label="Next" />,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: slidesToShowDesktop,
          centerMode: true,
          centerPadding: "0px",
          infinite: hasAtLeastThree,
          arrows: hasAtLeastThree,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          centerMode: false,     // keep gutters consistent on tablet
          infinite: original.length >= 2,
          arrows: original.length >= 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          infinite: original.length >= 2,
          arrows: original.length >= 2,
        },
      },
    ],
  };

  return (
    <section className="services-carousel">
      <h2 className="section-title">Services Offered</h2>
      <Slider {...settings}>
        {data.map((s, i) => (
          // Include index in key so duplicated items don't collide
          <div key={`${s.title}-${i}`} className="slide-pad">
            <ServiceCard title={s.title} img={s.img} />
          </div>
        ))}
      </Slider>
    </section>
  );
}
