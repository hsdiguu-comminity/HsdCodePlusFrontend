// ---- Ortak TypeScript tipleri ----

// Quiz ve blog kategorileri
export type Category = "HSD" | "Yapay Zeka" | "Siber Güvenlik" | "Web" | "Veri Bilimi";

// Blog yazısı
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: { name: string; username: string };
  readMinutes: number;
  date: string; // ISO tarih
}

// Quiz özeti (liste ve kartlarda kullanılır)
export interface Quiz {
  id: string;
  title: string;
  category: Category;
  questionCount: number;
  durationMin: number;
  points: number;
}

// Tek bir quiz sorusu
export interface QuizQuestion {
  text: string; // soru metni
  options: string[]; // şıklar
  correctIndex: number; // doğru şıkkın sırası (0'dan başlar)
  explanation: string; // doğru cevabın açıklaması
}

// Soruları da içeren tam quiz
export interface QuizDetail extends Quiz {
  description: string;
  questions: QuizQuestion[];
}

// Sıralama tablosundaki satır
export interface RankEntry {
  rank: number;
  name: string;
  username: string;
  community: string;
  points: number;
}

// Sıralama dönemleri
export type Period = "daily" | "weekly" | "monthly";

// Kayıtlı üye (GEÇİCİ: backend gelince API'den gelecek)
export interface StoredUser {
  name: string;
  email: string;
  password: string;
  community: string;
  username: string;
}

// Giriş yapmış kullanıcının oturum bilgisi (şifre içermez)
export interface Session {
  name: string;
  email: string;
  community: string;
  username: string;
  role: "user" | "admin";
}

// Çözülen bir quizin kaydedilmiş sonucu
export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  username: string;
  name: string;
  community: string;
  correct: number; // doğru sayısı
  total: number; // toplam soru
  points: number; // kazanılan puan
  date: string; // ISO tarih
}
