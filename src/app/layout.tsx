// ---- Ana iskelet: bütün sayfaların dışındaki Navbar + Footer burada ----
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "HSDCode+ | Ana Sayfa", template: "%s | HSDCode+" },
  description: "Huawei Student Developer topluluklarının teknik yazı, quiz ve yarışma platformu.",
};

// Kayıtlı tema, sayfa çizilmeden önce uygulanır (yanıp sönmeyi önler)
const themeScript = `try{var t=localStorage.getItem("hsdcode-theme");if(t==="light")document.documentElement.dataset.theme="light"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {/* Giriş durumunu Navbar kendisi okur (useSession) */}
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
