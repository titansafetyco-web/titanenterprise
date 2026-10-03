import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "chats.json");

export type ChatNote = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

async function readChats(): Promise<ChatNote[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as ChatNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listChats() {
  const notes = await readChats();
  return notes.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function saveChat(input: Omit<ChatNote, "id" | "createdAt">) {
  const notes = await readChats();
  const note: ChatNote = {
    id: randomBytes(8).toString("hex"),
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  notes.push(note);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(notes, null, 2));
  await fs.rename(temp, file);
  return note;
}
