import { sendMailbox } from "@/lib/mail";
import { site } from "@/lib/site";

export type AccountNotice = "review" | "approved" | "denied";

const origin = "https://www.titansafetystore.com";
const signInUrl = `${origin}/login`;
const quote =
  "Connecting people with essential products and services, and helping partners turn that demand into business.";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const copy: Record<AccountNotice, { subject: string; title: string; lead: string }> = {
  review: {
    subject: "Your Titan Safety Co. account is being reviewed",
    title: "Your account is being reviewed",
    lead: "We received your account. It is being reviewed. We will email you when it is approved.",
  },
  approved: {
    subject: "Your Titan Safety Co. account is approved",
    title: "Your account is approved",
    lead: "Your account is approved. You can sign in with the email and password from this message.",
  },
  denied: {
    subject: "Your Titan Safety Co. account was not approved",
    title: "Your account was not approved",
    lead: "Your account was reviewed and was not approved. You will not be able to sign in.",
  },
};

function letter(input: { name: string; email: string; password: string; kind: AccountNotice }) {
  const note = { ...copy[input.kind] };
  if (input.kind === "approved" && input.password.length === 0) {
    note.lead =
      "Your account is approved. Sign in with the email below and the password you chose when you created the account.";
  }
  const safeName = escapeHtml(input.name || "there");
  const safeEmail = escapeHtml(input.email);
  const safePassword = escapeHtml(input.password);
  const credentials =
    input.password.length > 0
      ? [
          `Email: ${input.email}`,
          `Password: ${input.password}`,
        ]
      : [`Email: ${input.email}`, "Password: the password you chose when you created the account."];
  const text = [
    `Hello ${input.name || "there"},`,
    "",
    note.lead,
    "",
    `"${quote}"`,
    "",
    "Sign in",
    ...credentials,
    signInUrl,
    "",
    site.name,
    site.contactEmail,
  ].join("\n");
  const passwordRow =
    input.password.length > 0
      ? `<tr><td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">Password</td></tr>
         <tr><td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#101820;">${safePassword}</td></tr>`
      : `<tr><td style="padding:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#101820;">Use the password you chose when you created the account.</td></tr>`;
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f6f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f7;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid #e5e7eb;">
        <tr><td style="background:#090d11;padding:28px 32px;">
          <img src="${origin}/logo-landscape-tight.webp" alt="${escapeHtml(site.name)}" width="210" style="display:block;width:210px;max-width:100%;height:auto;border:0;" />
        </td></tr>
        <tr><td style="height:4px;background:#f5c400;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#6b7280;">Account</p>
          <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;color:#090d11;">${escapeHtml(note.title)}</h1>
          <p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#101820;">Hello ${safeName},</p>
          <p style="margin:0 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#101820;">${escapeHtml(note.lead)}</p>
          <p style="margin:0 0 24px;padding:14px 16px;border-left:4px solid #f5c400;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.55;color:#101820;">${escapeHtml(quote)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f6f7;border:1px solid #e5e7eb;">
            <tr><td style="padding:16px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">Email</td></tr>
                <tr><td style="padding:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#101820;">${safeEmail}</td></tr>
                ${passwordRow}
              </table>
            </td></tr>
          </table>
          <a href="${signInUrl}" style="display:inline-block;background:#f5c400;color:#090d11;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;padding:14px 22px;">Sign in</a>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#090d11;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#ffffff;">${escapeHtml(site.name)}</p>
          <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#f5c400;">${escapeHtml(site.contactEmail)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const stored = input.password
    ? text.replace(`Password: ${input.password}`, "Password: [sent in the email]")
    : text;
  return { subject: note.subject, text, html, stored };
}

export async function sendAccountNotice(input: {
  name: string;
  email: string;
  password?: string;
  kind: AccountNotice;
}) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  const message = letter({
    name: input.name.trim(),
    email,
    password: input.password ?? "",
    kind: input.kind,
  });
  await sendMailbox({
    to: email,
    subject: message.subject,
    body: message.text,
    html: message.html,
    storedBody: message.stored,
  });
}
