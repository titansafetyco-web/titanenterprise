import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "messages.json");

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  interest: string;
  message: string;
  createdAt: string;
};

async function readMessages(): Promise<ContactMessage[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as ContactMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listMessages() {
  const messages = await readMessages();
  return messages.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function saveMessage(
  input: Omit<ContactMessage, "id" | "createdAt">,
) {
  const messages = await readMessages();
  const message: ContactMessage = {
    id: randomBytes(8).toString("hex"),
    name: input.name,
    email: input.email,
    interest: input.interest,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(messages, null, 2));
  await fs.rename(temp, file);
  return message;
}
