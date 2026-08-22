import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Перенос зображень постачальника у власне сховище.
//
// ПРОБЛЕМА: ~2300 товарів віддають картинки прямо з b2b.veloportal.com.ua.
// Це чужий сервер: він може закрити hotlink, змінити шляхи або просто лягти —
// і тоді одночасно падають і картки Merchant Center, і LCP на сторінках товару.
// Плюс Google Images індексує чужий домен, а не наш.
//
// РІШЕННЯ: копіюємо файл до себе один раз, далі посилаємось на своє.
//
// КЛЮЧОВА ВЛАСТИВІСТЬ — ІДЕМПОТЕНТНІСТЬ. Шлях у сховищі рахується як хеш від
// вихідного URL. Тому повторний виклик для того самого URL не завантажує файл
// удруге, а просто повертає ту саму адресу. Завдяки цьому процес можна
// зупиняти, перезапускати й ганяти щоночі без дублікатів і зайвого трафіку.

export const IMAGE_BUCKET = "product-images";

// Скільки зображень на товар переносимо: головне + два додаткових.
// Решта майже не використовується в інтерфейсі, а місце в сховищі коштує.
export const MAX_IMAGES_PER_PRODUCT = 3;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// 8 МБ — стеля на файл. Захист від випадкового величезного зображення у фіді.
const MAX_BYTES = 8 * 1024 * 1024;

/** Чи це вже наше зображення (у Supabase Storage)? */
export function isMirrored(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("/storage/v1/object/public/");
}

/** Чи це зовнішнє http(s)-зображення, яке варто перенести? */
export function isExternal(url: string | null | undefined): boolean {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false; // локальні /images/... не чіпаємо
  return !isMirrored(url);
}

/** Детермінований шлях у сховищі: залежить лише від вихідного URL. */
function storagePath(sourceUrl: string, ext: string): string {
  const hash = createHash("sha1").update(sourceUrl).digest("hex");
  // Розкладаємо по підтеках, щоб не тримати тисячі файлів в одній.
  return `acc/${hash.slice(0, 2)}/${hash}.${ext}`;
}

/**
 * Шлях для ОНОВЛЕНОЇ версії зображення.
 *
 * Якщо постачальник замінив фото за тією самою адресою, перезаписувати старий
 * об'єкт не можна: він віддається з cacheControl на рік, і CDN ще довго
 * показував би стару картинку. Тому нова версія лягає за новим шляхом —
 * до імені додається хеш ВМІСТУ. Адреса змінюється, кеш оминається,
 * стара версія просто перестає використовуватись.
 */
function versionedPath(sourceUrl: string, bytes: Uint8Array, ext: string): string {
  const urlHash = createHash("sha1").update(sourceUrl).digest("hex");
  const contentHash = createHash("sha1").update(bytes).digest("hex").slice(0, 8);
  return `acc/${urlHash.slice(0, 2)}/${urlHash}-${contentHash}.${ext}`;
}

/** Витягує шлях об'єкта з нашої публічної адреси. */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

/**
 * Розмір файлу на боці постачальника — без завантаження тіла.
 * Використовується як дешевий сигнал «фото замінили».
 */
export async function sourceContentLength(sourceUrl: string): Promise<number | null> {
  try {
    const res = await fetch(sourceUrl, {
      method: "HEAD",
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArdisImageMirror/1.0)" },
    });
    if (!res.ok) return null;
    const len = res.headers.get("content-length");
    return len ? Number(len) : null;
  } catch {
    return null;
  }
}

/**
 * Перезавантажує зображення й кладе його за версійним шляхом.
 * Повертає нову адресу або null, якщо нічого не змінилось / не вдалось.
 */
export async function refreshImage(
  supabase: SupabaseClient,
  supabaseUrl: string,
  sourceUrl: string
): Promise<{ url: string } | null> {
  let res: Response;
  try {
    res = await fetch(sourceUrl, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArdisImageMirror/1.0)" },
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) return null;

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) return null;

  const path = versionedPath(sourceUrl, buf, ext);
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, buf, { contentType, upsert: true, cacheControl: "31536000" });
  if (error) return null;

  return { url: publicUrl(supabaseUrl, path) };
}

function publicUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

export type MirrorResult =
  | { ok: true; url: string; skipped: boolean }
  | { ok: false; reason: string };

/**
 * Переносить одне зображення. Повертає нашу публічну адресу.
 * skipped=true означає, що файл уже лежав у сховищі й качати не довелось.
 */
export async function mirrorImage(
  supabase: SupabaseClient,
  supabaseUrl: string,
  sourceUrl: string
): Promise<MirrorResult> {
  if (isMirrored(sourceUrl)) return { ok: true, url: sourceUrl, skipped: true };
  if (!isExternal(sourceUrl)) return { ok: false, reason: "not an external url" };

  // Розширення з самого URL — щоб перевірити наявність ДО завантаження.
  const guessedExt = (sourceUrl.split("?")[0].match(/\.([a-z0-9]{3,4})$/i)?.[1] ?? "jpg")
    .toLowerCase()
    .replace("jpeg", "jpg");
  const guessedPath = storagePath(sourceUrl, guessedExt);

  // Чи вже переносили? list по конкретному імені — дешевше за завантаження.
  const dir = guessedPath.slice(0, guessedPath.lastIndexOf("/"));
  const file = guessedPath.slice(guessedPath.lastIndexOf("/") + 1);
  const { data: existing } = await supabase.storage
    .from(IMAGE_BUCKET)
    .list(dir, { search: file, limit: 1 });
  if (existing && existing.some((f) => f.name === file)) {
    return { ok: true, url: publicUrl(supabaseUrl, guessedPath), skipped: true };
  }

  // Качаємо.
  let res: Response;
  try {
    res = await fetch(sourceUrl, {
      cache: "no-store",
      // Деякі сервери віддають 403 без Referer/User-Agent.
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArdisImageMirror/1.0)" },
    });
  } catch (e) {
    return { ok: false, reason: `fetch failed: ${(e as Error).message}` };
  }
  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };

  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) return { ok: false, reason: `unsupported content-type: ${contentType || "none"}` };

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0) return { ok: false, reason: "empty body" };
  if (buf.byteLength > MAX_BYTES) return { ok: false, reason: `too large: ${buf.byteLength}` };

  // Реальне розширення могло не збігтися з тим, що в URL — тоді шлях інший.
  const finalPath = ext === guessedExt ? guessedPath : storagePath(sourceUrl, ext);

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(finalPath, buf, { contentType, upsert: true, cacheControl: "31536000" });
  if (error) return { ok: false, reason: `upload failed: ${error.message}` };

  return { ok: true, url: publicUrl(supabaseUrl, finalPath), skipped: false };
}
