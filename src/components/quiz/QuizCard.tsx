// ---- Quiz kartı (liste ve ana sayfada kullanılır) ----
import Link from "next/link";
import { Clock, HelpCircle, Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { minutesOf } from "@/lib/format";
import type { QuizSummary } from "@/types";
import styles from "./QuizCard.module.css";

const STATUS_LABELS = { UPCOMING: "Yakında", ENDED: "Sona erdi", ACTIVE: null } as const;

export default function QuizCard({ quiz }: { quiz: QuizSummary }) {
  const statusLabel = STATUS_LABELS[quiz.status];
  return (
    <Card>
      <Badge>{quiz.category.name}</Badge>
      <h3 className={styles.title}>
        <Link href={`/quiz/${quiz.id}`} className={styles.link}>
          {quiz.title}
        </Link>
      </h3>
      <ul className={styles.stats}>
        <li><HelpCircle size={15} aria-hidden /> {quiz.questionCount} soru</li>
        <li><Clock size={15} aria-hidden /> {minutesOf(quiz.timeLimitSec)} dk</li>
        <li><Trophy size={15} aria-hidden /> {quiz.totalPoints} puan</li>
      </ul>
      {statusLabel && <Badge>{statusLabel}</Badge>}
    </Card>
  );
}
