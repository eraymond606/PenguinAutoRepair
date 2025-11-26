import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import ServicesCarousel from "../../components/layout/ui/ServicesCarousel";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero section with button */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(/images/hero.jpg)` }}
      >
        <button
          className={`${styles.btn} ${styles.btnLg} ${styles.btnShadow}`}
          onClick={() => navigate("/login")}
        >
          Schedule Service
        </button>
      </section>

      {/* Intro section */}
      <section className={styles.intro}>
        <img className={styles.badge} src="/logo.png" alt="Penguin" />
        <div>
          <h1>Penguin Auto Repair Shop</h1>
          <p className={styles.muted}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </section>

      {/* Carousel */}
      <ServicesCarousel />
    </div>
  );
}
