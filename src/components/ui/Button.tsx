// ---- Ortak buton (link görünümlü) ----
import Link from "next/link";
import styles from "./Button.module.css";

interface ButtonProps {
  href: string;
  variant?: "primary" | "outline"; // dolu veya çerçeveli görünüm
  external?: boolean; // true ise yeni sekmede açılan dış bağlantı olur
  children: React.ReactNode;
  className?: string;
}

export default function Button({ href, variant = "primary", external = false, children, className = "" }: ButtonProps) {
  const classes = `${styles.btn} ${styles[variant]} ${className}`;

  // Dış bağlantı: yeni sekme + güvenlik özellikleri
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  // Site içi bağlantı
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
