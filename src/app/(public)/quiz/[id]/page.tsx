// ---- /quiz/[id] sayfası: seçilen quizi çözdürür ----
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/quiz/QuizRunner";
import { getQuizById, quizList } from "@/mocks/quizzes"; // MOCK: backend gelince API'den

// Next.js 15'te params bir Promise'tir
type Props = { params: Promise<{ id: string }> };

// Bilinen quiz sayfalarını önceden üret
export function generateStaticParams() {
  return quizList.map((quiz) => ({ id: quiz.id }));
}

// Sekme başlığı: quizin adı
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const quiz = getQuizById(id);
  return { title: quiz ? quiz.title : "Quiz bulunamadı" };
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  const quiz = getQuizById(id);

  // Böyle bir quiz yoksa 404 sayfası
  if (!quiz) notFound();

  return (
    <main className="container" style={{ padding: "48px 0 64px" }}>
      <QuizRunner quiz={quiz} />
    </main>
  );
}
