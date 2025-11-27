import React from "react";
import Slider from "react-slick";
import ServiceCard from "./ServiceCard";

const defaultServices = [
  { title: "Oil Change",       img: "/images/oil.jpg" },
  { title: "Tire Replacement", img: "/images/tires.jpg" },
  { title: "Alignment",        img: "/images/alignment.jpg" },
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

export default function ServicesCarousel({ items = defaultServices }) {
  const original = items;
  const hasAtLeastThree = original.length >= 3;

  // With exactly 3 items, duplicate them so the carousel can scroll infinitely
  const data = original.length === 3 ? [...original, ...original] : original;

  const slidesToShowDesktop = 3;

  const settings = {
    infinite: hasAtLeastThree,
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
          centerMode: false,
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
          <div key={`${s.title}-${i}`} className="slide-pad">
            <ServiceCard title={s.title} img={s.img} />
          </div>
        ))}
      </Slider>
    </section>
  );
}
