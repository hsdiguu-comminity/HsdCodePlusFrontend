"use client";
// ---- Açık / koyu mod düğmesi ----
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./Navbar.module.css";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  // Sayfa açılınca mevcut temayı oku
  useEffect(() => {
    setIsLight(document.documentElement.dataset.theme === "light");
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("hsdcode-theme", next ? "light" : "dark");
    } catch {
      /* depolama kapalıysa tema yine değişir */
    }
  }

  const label = isLight ? "Koyu moda geç" : "Açık moda geç";
  return (
    <button type="button" className={styles.iconBtn} onClick={toggle} aria-label={label} title={label}>
      {isLight ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
    </button>
  );
}
