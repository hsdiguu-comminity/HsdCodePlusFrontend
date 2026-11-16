// ---- Markdown görüntüleyici ----
// Yazı içeriği rehype-sanitize ile temizlenerek gösterilir (zararlı HTML/JS çalışmaz).
// dangerouslySetInnerHTML kullanılmaz.
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import styles from "./MarkdownView.module.css";

export default function MarkdownView({ content }: { content: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Dış bağlantılar yeni sekmede ve güvenli açılır
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
