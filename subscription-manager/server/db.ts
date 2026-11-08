import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  cycle TEXT NOT NULL,
  billing_day INTEGER NOT NULL,
  billing_month INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_log (
  user_id INTEGER NOT NULL,
  subscription_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  sent_on TEXT NOT NULL,
  PRIMARY KEY (user_id, subscription_id, kind, sent_on),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);
`;

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
}

export interface SubscriptionRow {
  id: number;
  user_id: number;
  name: string;
  amount_minor: number;
  currency: string;
  cycle: string;
  billing_day: number;
  billing_month: number | null;
}

export interface PushRow {
  id: number;
  user_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function openDatabase(dbPath: string): DatabaseSync {
  if (dbPath !== ":memory:") {
    mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  try {
    db.exec("PRAGMA journal_mode = WAL");
  } catch {
    // :memory: databases reject WAL. The default journal is enough there.
  }
  return db;
}

export function defaultDbPath(): string {
  return process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.sqlite");
}

export function asRows<T>(value: unknown): T[] {
  return value as T[];
}
