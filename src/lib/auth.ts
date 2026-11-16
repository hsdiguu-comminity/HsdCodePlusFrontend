// ---- Üyelik işlemleri (backend API'si) ----
// Oturum backend'in HttpOnly çerezinde durur; burada yalnızca "kim giriş yapmış" bilgisi
// bellekte tutulur ve /api/auth/me ile doğrulanır.
import { api, ApiError, errorMessage } from "@/lib/api";
import type { Community, PublicUser, Session } from "@/types";

export const AUTH_EVENT = "hsdcode-auth"; // giriş/çıkış olunca yayınlanan olay

// İşlem sonucu: başarılı ya da hata mesajı
export type AuthResult = { ok: true } | { ok: false; message: string; code?: string };

const fail = (error: unknown): AuthResult => ({
  ok: false,
  message: errorMessage(error),
  code: error instanceof ApiError ? error.code : undefined,
});

// Yalnızca site içi adreslere yönlendirmeye izin verir (güvenlik için)
export function safeNext(value: string | null, fallback = "/dashboard"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

// ---------- Oturum deposu (useSession bunu okur) ----------
type MeUser = PublicUser & { community: Community | null };

// undefined = henüz kontrol edilmedi, null = giriş yok
let current: Session | null | undefined;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function toSession(user: MeUser): Session {
  return {
    ...user,
    name: `${user.firstName} ${user.lastName}`,
    isAdmin: user.role === "ADMIN",
  };
}

function setSession(value: Session | null) {
  current = value;
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

// Oturumu backend'den yeniden okur
export function refreshSession(): Promise<void> {
  loading ??= api<{ user: MeUser }>("/auth/me")
    .then(({ user }) => setSession(toSession(user)))
    .catch(() => setSession(null))
    .finally(() => {
      loading = null;
    });
  return loading;
}

export function getSessionSnapshot(): Session | null | undefined {
  return current;
}

export function subscribeAuth(callback: () => void): () => void {
  listeners.add(callback);
  if (current === undefined) void refreshSession(); // ilk kullanımda oturumu kontrol et
  return () => listeners.delete(callback);
}

// ---------- Kayıt ----------
export async function registerUser(input: {
  firstName: string;
  lastName: string;
  username: string;
  communityId: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    await api("/auth/register", { method: "POST", body: input });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------- Giriş ----------
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    await api("/auth/login", { method: "POST", body: { email, password } });
    await refreshSession();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------- Çıkış ----------
export async function logout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } finally {
    setSession(null);
  }
}

// ---------- Şifremi unuttum / yeni şifre ----------
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    await api("/auth/forgot-password", { method: "POST", body: { email } });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function resetPasswordWithToken(token: string, password: string): Promise<AuthResult> {
  try {
    await api("/auth/reset-password", { method: "POST", body: { token, password } });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------- Profil ve şifre değiştirme ----------
export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  communityId?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}): Promise<AuthResult> {
  try {
    await api("/users/me", { method: "PATCH", body: input });
    await refreshSession(); // menüde yeni ad/topluluk görünsün
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    await api("/users/me/password", { method: "POST", body: { currentPassword, newPassword } });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
