import React from "react";
import styles from "./StaffLayout.module.css";

export default function StaffLayout({ children }) {
  return (
    <div className={styles.pageWrapper}>
      {/* Hero Banner */}
      <div className={styles.heroBanner} style={{ backgroundImage: 'url(/images/hero.jpg)' }}></div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
