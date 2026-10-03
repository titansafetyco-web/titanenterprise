import { createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const secretFile = path.join(dataDir, ".secret");
const cookieName = "titan_session";
const sessionDays = 14;

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type UserRecord = User;

function scryptHash(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function readUsers(): Promise<UserRecord[]> {
  try {
    const raw = await fs.readFile(usersFile, "utf8");
    const parsed = JSON.parse(raw) as UserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]) {
  await fs.mkdir(dataDir, { recursive: true });
  const temp = `${usersFile}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(users, null, 2));
  await fs.rename(temp, usersFile);
}

async function secret() {
  try {
    return (await fs.readFile(secretFile, "utf8")).trim();
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    const value = randomBytes(32).toString("hex");
    await fs.writeFile(secretFile, value, { flag: "wx" }).catch(async () => {
      return;
    });
    return (await fs.readFile(secretFile, "utf8")).trim();
  }
}

function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

export function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptHash(password, salt);
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = await scryptHash(password, salt);
  const previous = Buffer.from(hash, "hex");
  if (next.length !== previous.length) return false;
  return timingSafeEqual(next, previous);
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((user) => user.email === email.toLowerCase()) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const users = await readUsers();
  const email = input.email.toLowerCase();
  if (users.some((user) => user.email === email)) {
    return {
      ok: false as const,
      error: "An account with that email already exists.",
    };
  }

  const user: UserRecord = {
    id: randomBytes(16).toString("hex"),
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return { ok: true as const, user };
}

export async function setSession(userId: string) {
  const key = await secret();
  const expires = Date.now() + sessionDays * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${expires}`;
  const token = `${payload}.${sign(payload, key)}`;
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDays * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(cookieName);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return null;

  const [userId, expires, signature] = token.split(".");
  if (!userId || !expires || !signature) return null;
  if (Number(expires) < Date.now()) return null;

  const key = await secret();
  const expected = sign(`${userId}.${expires}`, key);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    return null;
  }

  const users = await readUsers();
  const user = users.find((item) => item.id === userId);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}
