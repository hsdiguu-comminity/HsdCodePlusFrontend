// ---- Quiz kartı (liste ve ana sayfada kullanılır) ----
import Link from "next/link";
import { Clock, HelpCircle, Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Quiz } from "@/types";
import styles from "./QuizCard.module.css";

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <Card>
      <Badge>{quiz.category}</Badge>
      <h3 className={styles.title}>
        <Link href={`/quiz/${quiz.id}`} className={styles.link}>
          {quiz.title}
        </Link>
      </h3>
      <ul className={styles.stats}>
        <li><HelpCircle size={15} aria-hidden /> {quiz.questionCount} soru</li>
        <li><Clock size={15} aria-hidden /> {quiz.durationMin} dk</li>
        <li><Trophy size={15} aria-hidden /> {quiz.points} puan</li>
      </ul>
    </Card>
  );
}
