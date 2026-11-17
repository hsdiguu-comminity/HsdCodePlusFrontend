"use client";
// ---- Yazı oluşturma editörü: başlık, kategori, kapak görseli, Markdown içerik + önizleme ----
// Gönderilen yazı "onay bekliyor" durumuna geçer; yönetici onaylayınca yayınlanır.
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { api, errorMessage } from "@/lib/api";
import { postSchema, type PostValues } from "@/lib/schemas";
import { useApi } from "@/lib/useApi";
import type { Category } from "@/types";
import MarkdownView from "./MarkdownView";
import styles from "./PostEditor.module.css";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function PostEditor() {
  const categories = useApi<{ categories: Category[] }>("/categories");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostValues>({ resolver: zodResolver(postSchema), defaultValues: { contentMd: "" } });

  const content = watch("contentMd");

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Görsel en fazla 2 MB olabilir.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { url } = await api<{ url: string }>("/uploads", { method: "POST", form });
      setCoverUrl(url);
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  const onSubmit: SubmitHandler<PostValues> = async (values) => {
    setFormError("");
    try {
      await api("/posts", { method: "POST", body: { ...values, coverUrl } });
      reset({ title: "", categoryId: "", contentMd: "" });
      setCoverUrl(null);
      setSent(true);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  if (sent) {
    return (
      <div className={styles.sent} role="status">
        <h2>Yazın onaya gönderildi 🎉</h2>
        <p>Yönetici onayladığında blogda yayınlanacak ve puan kazanacaksın. Durumunu panelinden takip edebilirsin.</p>
        <div className={styles.row}>
          <Button href="/dashboard">Panelime git</Button>
          <button type="button" className={styles.linkButton} onClick={() => setSent(false)}>
            Yeni yazı yaz
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <Input id="baslik" label="Başlık" type="text" error={errors.title?.message} {...register("title")} />
      <Select
        id="kategori"
        label="Kategori"
        placeholder={categories.loading ? "Yükleniyor…" : "Kategori seç"}
        options={(categories.data?.categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
        error={errors.categoryId?.message ?? categories.error ?? undefined}
        defaultValue=""
        {...register("categoryId")}
      />

      <div className={styles.field}>
        <label htmlFor="kapak" className={styles.label}>Kapak görseli (isteğe bağlı)</label>
        <input
          id="kapak"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.file}
          disabled={uploading}
          onChange={(e) => void uploadCover(e.target.files?.[0])}
        />
        <p className={styles.hint}>JPG, PNG veya WebP; en fazla 2 MB.</p>
        {uploading && <p className={styles.hint} role="status">Yükleniyor…</p>}
        {uploadError && <p className={styles.error} role="alert">{uploadError}</p>}
        {coverUrl && (
          <div className={styles.cover}>
            {/* eslint-disable-next-line @next/next/no-img-element -- yüklenen görselin önizlemesi */}
            <img src={coverUrl} alt="Kapak görseli önizlemesi" />
            <button type="button" className={styles.linkButton} onClick={() => setCoverUrl(null)}>
              Görseli kaldır
            </button>
          </div>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.tabs} role="tablist" aria-label="İçerik">
          <button type="button" role="tab" aria-selected={tab === "write"} className={tab === "write" ? styles.activeTab : styles.tab} onClick={() => setTab("write")}>
            Yaz
          </button>
          <button type="button" role="tab" aria-selected={tab === "preview"} className={tab === "preview" ? styles.activeTab : styles.tab} onClick={() => setTab("preview")}>
            Önizle
          </button>
        </div>
        {tab === "write" ? (
          <>
            <label htmlFor="icerik" className="sr-only">İçerik</label>
            <textarea
              id="icerik"
              className={styles.textarea}
              rows={18}
              placeholder={"# Başlık\n\nMarkdown ile yaz: **kalın**, *italik*, `kod`, [bağlantı](https://...)\n\n```js\nconsole.log('merhaba');\n```"}
              aria-invalid={errors.contentMd ? true : undefined}
              {...register("contentMd")}
            />
          </>
        ) : (
          <div className={styles.preview}>
            {content.trim() ? <MarkdownView content={content} /> : <p className={styles.hint}>Önizlenecek içerik yok.</p>}
          </div>
        )}
        {errors.contentMd && <p className={styles.error} role="alert">{errors.contentMd.message}</p>}
      </div>

      {formError && <p className={styles.error} role="alert">{formError}</p>}

      <button type="submit" className={styles.submit} disabled={isSubmitting || uploading}>
        {isSubmitting ? "Gönderiliyor…" : "Onaya gönder"}
      </button>
    </form>
  );
}
