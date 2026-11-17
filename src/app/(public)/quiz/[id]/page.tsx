// ---- /quiz/[id] sayfası: quiz bilgisi + çözme akışı ----
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizRunner from "@/components/quiz/QuizRunner";
import { ApiError, serverApi } from "@/lib/api";
import type { QuizDetail } from "@/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getQuiz(id: string): Promise<QuizDetail | null> {
  try {
    const { quiz } = await serverApi<{ quiz: QuizDetail }>(`/quizzes/${encodeURIComponent(id)}`);
    return quiz;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const quiz = await getQuiz(id).catch(() => null);
  return { title: quiz ? quiz.title : "Quiz bulunamadı" };
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();

  return (
    <main className="container" style={{ padding: "48px 0 64px" }}>
      <QuizRunner quiz={quiz} />
    </main>
  );
}
