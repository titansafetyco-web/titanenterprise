import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "applications.json");

export type AffiliateApplication = {
  id: string;
  name: string;
  email: string;
  program: string;
  secondProgram: string;
  note: string;
  createdAt: string;
};

async function readApplications(): Promise<AffiliateApplication[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as AffiliateApplication[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listApplications() {
  const items = await readApplications();
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function saveApplication(
  input: Omit<AffiliateApplication, "id" | "createdAt">,
) {
  const items = await readApplications();
  const application: AffiliateApplication = {
    id: randomBytes(8).toString("hex"),
    ...input,
    createdAt: new Date().toISOString(),
  };
  items.push(application);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify(items, null, 2));
  await fs.rename(temp, file);
  return application;
}
