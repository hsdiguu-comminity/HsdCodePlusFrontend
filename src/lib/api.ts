// ---- Backend API istemcisi ----
// Tarayıcıdaki tüm istekler /api/... adresine gider; next.config.ts bunları backend'e iletir.
// Oturum HttpOnly çerezde durur, tarayıcı onu kendisi gönderir (localStorage kullanılmaz).

// Backend'in hata formatı: { error: { code, message } }
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown; // JSON olarak gönderilir
  form?: FormData; // dosya yükleme
};

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
    );
  }
  return data as T;
}

// Tarayıcıda (client component) kullanılır
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      credentials: "same-origin",
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.");
  }
  return parse<T>(response);
}

// Sunucuda (server component) herkese açık veriyi okumak için kullanılır.
// Sunucu doğrudan backend'e gider; kullanıcı çerezi gönderilmez.
export async function serverApi<T>(path: string): Promise<T> {
  const base = (process.env.BACKEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const response = await fetch(`${base}/api${path}`, { cache: "no-store" });
  return parse<T>(response);
}

// Hata nesnesinden kullanıcıya gösterilecek mesaj
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
}
