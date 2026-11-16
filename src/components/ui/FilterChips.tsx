// ---- Kategori filtresi (bağlantı tabanlı) + isteğe bağlı arama kutusu ----
import Link from "next/link";
import type { Category } from "@/types";
import styles from "./FilterChips.module.css";

interface FilterChipsProps {
  basePath: string; // ör. "/blog"
  categories: Category[];
  active?: string; // seçili kategori slug'ı
  search?: { value?: string; placeholder: string }; // verilirse arama kutusu gösterilir
}

export default function FilterChips({ basePath, categories, active, search }: FilterChipsProps) {
  const chips = [{ slug: undefined, name: "Tümü" }, ...categories];
  return (
    <div className={styles.bar}>
      <ul className={styles.chips} aria-label="Kategori filtresi">
        {chips.map((chip) => {
          const selected = chip.slug === active;
          const href = chip.slug ? `${basePath}?category=${chip.slug}` : basePath;
          return (
            <li key={chip.slug ?? "tumu"}>
              <Link href={href} className={selected ? styles.active : styles.chip} aria-current={selected ? "true" : undefined}>
                {chip.name}
              </Link>
            </li>
          );
        })}
      </ul>
      {search && (
        <form action={basePath} className={styles.search} role="search">
          {active && <input type="hidden" name="category" value={active} />}
          <label htmlFor="arama" className="sr-only">Ara</label>
          <input id="arama" name="q" type="search" defaultValue={search.value} placeholder={search.placeholder} className={styles.input} />
          <button type="submit" className={styles.button}>Ara</button>
        </form>
      )}
    </div>
  );
}
