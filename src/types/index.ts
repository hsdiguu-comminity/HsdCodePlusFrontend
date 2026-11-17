// ---- Ortak TypeScript tipleri (backend API cevaplarıyla birebir) ----

export type Role = "MEMBER" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "RESTRICTED" | "BANNED";
export type PostStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
export type Period = "daily" | "weekly" | "monthly";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Community {
  id: string;
  name: string;
  university: string;
  city?: string;
}

export interface Author {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
}

// API'nin döndürdüğü kullanıcı (şifre vb. gizli alanlar gelmez)
export interface PublicUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  communityId: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

// Giriş yapmış kullanıcının oturum bilgisi
export interface Session extends PublicUser {
  name: string; // "Ad Soyad"
  community: Community | null;
  isAdmin: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ---------- Blog ----------
export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  readMinutes: number;
  publishedAt: string | null;
  createdAt: string;
  category: Category;
  author: Author;
}

export interface PostDetail extends Omit<PostSummary, "excerpt"> {
  contentMd: string;
  contentHtml: string;
}

export interface AdminPost {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  coverUrl: string | null;
  status: PostStatus;
  rejectReason: string | null;
  createdAt: string;
  publishedAt: string | null;
  category: Category;
  author: Author;
}

// ---------- Quiz ----------
export type QuizWindowStatus = "UPCOMING" | "ACTIVE" | "ENDED";

export interface QuizSummary {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  timeLimitSec: number;
  startsAt: string | null;
  endsAt: string | null;
  status: QuizWindowStatus;
  questionCount: number;
  totalPoints: number;
}

export interface QuizDetail extends QuizSummary {
  myAttempt: { score: number; startedAt: string; finishedAt: string | null } | null;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  points: number;
  options: QuizOption[];
}

// POST /api/quizzes/[id]/start cevabı
export interface StartedQuiz {
  attemptId: string;
  quiz: { id: string; title: string; timeLimitSec: number };
  startedAt: string;
  expiresAt: string;
  questions: QuizQuestion[];
}

// Gönderimden sonraki sonuç (doğru cevaplar ve açıklamalarla)
export interface QuizResult {
  quiz: { id: string; title: string };
  score: number;
  totalPoints: number;
  correctCount: number;
  questionCount: number;
  finishedAt: string;
  questions: {
    id: string;
    text: string;
    explanation: string | null;
    points: number;
    options: QuizOption[];
    selectedOptionId: string | null;
    correctOptionId: string | null;
    isCorrect: boolean;
  }[];
}

// ---------- Sıralama ----------
export interface RankEntry {
  rank: number;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  community: { id: string; name: string; university: string };
  points: number;
}

export interface PointTotals {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
}

// ---------- Panel ve profil ----------
export interface Profile {
  bio: string | null;
  avatarUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
}

export interface Dashboard {
  user: PublicUser & { community: Community | null; profile: Profile | null };
  points: PointTotals;
  rankings: { daily: number | null; weekly: number | null; monthly: number | null };
  quizzes: {
    completed: number;
    averageScore: number;
    highestScore: number;
    recent: {
      score: number;
      finishedAt: string;
      quiz: { id: string; title: string; category: { name: string; slug: string } };
    }[];
  };
  posts: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    recent: {
      id: string;
      title: string;
      slug: string;
      status: PostStatus;
      rejectReason: string | null;
      publishedAt: string | null;
      createdAt: string;
      category: { name: string; slug: string };
    }[];
  };
}

export interface PublicProfile {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    community: Community;
    profile: Profile | null;
  };
  points: PointTotals;
  quizzesCompleted: number;
  posts: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    publishedAt: string | null;
    category: { name: string; slug: string };
  }[];
}

// ---------- Admin ----------
export interface AdminUser extends PublicUser {
  community: { id: string; name: string; university: string };
}

export interface AdminQuiz {
  id: string;
  title: string;
  description: string | null;
  timeLimitSec: number;
  startsAt: string | null;
  endsAt: string | null;
  isPublished: boolean;
  createdAt: string;
  category: Category;
  createdBy: { id: string; username: string };
  _count: { questions: number; attempts: number };
}

export interface AdminQuestion {
  id: string;
  text: string;
  explanation: string | null;
  points: number;
  order: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export interface AdminQuizDetail extends AdminQuiz {
  questions: AdminQuestion[];
}

export interface AdminCategory extends Category {
  _count: { posts: number; quizzes: number };
}

export interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  admin: { id: string; username: string; firstName: string; lastName: string };
}
