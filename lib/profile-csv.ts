import { birthDate, stateCode } from "@/lib/profile-details";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else quoted = false;
      } else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function column(header: string) {
  const text = header.trim().toLowerCase();
  if (["date of birth", "dob", "birth date", "birth_date", "fecha de nacimiento"].includes(text)) {
    return "birth" as const;
  }
  if (["state", "estado"].includes(text)) return "state" as const;
  if (["email", "correo"].includes(text)) return "email" as const;
  return "";
}

export function readProfileCsv(text: string, email: string) {
  const rows = parseCsv(text);
  if (rows.length < 2) return { error: "The file needs a header and one profile row." };
  const headers = rows[0].map(column);
  const birthIndex = headers.indexOf("birth");
  const stateIndex = headers.indexOf("state");
  const emailIndex = headers.indexOf("email");
  if (birthIndex < 0 && stateIndex < 0) {
    return { error: "The file needs a date of birth or a state." };
  }

  const data = rows.slice(1);
  let record = data[0];
  if (emailIndex >= 0) {
    const match = data.find(
      (item) => (item[emailIndex] ?? "").trim().toLowerCase() === email.trim().toLowerCase(),
    );
    if (!match) return { error: "That file is for a different account." };
    record = match;
  } else if (data.length !== 1) {
    return { error: "The file has more than one account." };
  }

  let birth: string | null = null;
  let region: string | null = null;
  if (birthIndex >= 0) {
    const value = birthDate(record[birthIndex] ?? "");
    if (value === null) return { error: "Choose a date of birth." };
    birth = value;
  }
  if (stateIndex >= 0) {
    const value = stateCode(record[stateIndex] ?? "");
    if (value === null) return { error: "Choose a state." };
    region = value;
  }
  return { birth, region, error: "" };
}
