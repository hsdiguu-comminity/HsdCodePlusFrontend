// ---- Ortak form alanı: etiket + input + hata mesajı ----
// React Hook Form'un ref'ini alabilmesi için forwardRef kullanılır.
import { forwardRef } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; // etiketi inputa bağlamak için zorunlu
  label: string;
  error?: string; // varsa hata mesajı
  hint?: string; // varsa küçük açıklama
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ id, label, error, hint, ...rest }, ref) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  // Ekran okuyucu hata ve ipucunu inputla birlikte okusun
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
