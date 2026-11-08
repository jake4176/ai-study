import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltPart, hashPart] = stored.split("$");
  if (scheme !== "scrypt" || !saltPart || !hashPart) return false;
  const salt = Buffer.from(saltPart, "base64url");
  const expected = Buffer.from(hashPart, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export const DUMMY_PASSWORD_HASH = hashPassword("not-a-real-password");

export function validateCredentials(emailRaw: unknown, passwordRaw: unknown): { ok: true; email: string; password: string } | { ok: false; error: string } {
  if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") {
    return { ok: false, error: "이메일과 비밀번호를 입력해 주세요." };
  }
  const email = emailRaw.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "이메일 형식을 확인해 주세요." };
  }
  if (passwordRaw.length < 8 || passwordRaw.length > 72) {
    return { ok: false, error: "비밀번호는 8자 이상 72자 이하로 정해 주세요." };
  }
  return { ok: true, email, password: passwordRaw };
}
