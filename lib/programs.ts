import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "programs.json");

export type Program = {
  id: string;
  name: string;
};

const starter: Program[] = [
  { id: "safety-products", name: "Safety products" },
  { id: "energy-solutions", name: "Energy solutions" },
  { id: "digital-media", name: "Digital media" },
  { id: "software-development", name: "Software development" },
  { id: "insurance", name: "Insurance" },
];

async function readPrograms(): Promise<Program[] | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Program[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return null;
  }
}

async function writePrograms(programs: Program[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(programs, null, 2));
  await fs.rename(temp, file);
}

export async function listPrograms() {
  const existing = await readPrograms();
  if (existing) return existing;
  try {
    await writePrograms(starter);
  } catch {
    return starter;
  }
  return starter;
}

export async function addProgram(name: string) {
  const programs = await listPrograms();
  const trimmed = name.trim();
  if (trimmed.length < 2) return { error: "Enter a program name." };
  if (trimmed.length > 80) return { error: "Keep the name under 80 characters." };
  if (programs.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
    return { error: "That program is already on the list." };
  }
  programs.push({ id: randomBytes(8).toString("hex"), name: trimmed });
  await writePrograms(programs);
  return { error: "" };
}

export async function removeProgram(id: string) {
  const programs = await listPrograms();
  await writePrograms(programs.filter((item) => item.id !== id));
}
