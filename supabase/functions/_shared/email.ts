const normalizeApiKey = (value: string) =>
  value.trim().replace(/^['"]|['"]$/g, "").replace(/^Bearer\s+/i, "").trim();

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseMailbox = (value: string, fallbackName = "") => {
  if (!isNonEmptyString(value)) return null;

  const trimmed = value.trim();
  const match = trimmed.match(/^(.*)<([^<>]+)>$/);

  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, "");
    const email = match[2].trim();
    if (!email) return null;
    return { email, name: name || fallbackName || email };
  }

  return {
    email: trimmed,
    name: fallbackName || trimmed,
  };
};

const MAILERSEND_API_KEY = normalizeApiKey(Deno.env.get("MAILERSEND_API_KEY") || "");
const MAILERSEND_FROM = (Deno.env.get("MAILERSEND_FROM") || "").trim();
const MAILERSEND_REPLY_TO = (Deno.env.get("MAILERSEND_REPLY_TO") || "").trim();
const RESEND_API_KEY = (Deno.env.get("RESEND_API_KEY") || "").trim();
const RESEND_FROM = (Deno.env.get("RESEND_FROM") || "").trim();
const RESEND_REPLY_TO = (Deno.env.get("RESEND_REPLY_TO") || "").trim();

const mailerSendSender = parseMailbox(MAILERSEND_FROM, "Dantes Media");
const mailerSendConfigured = Boolean(MAILERSEND_API_KEY && mailerSendSender?.email);
const resendConfigured = Boolean(RESEND_API_KEY && RESEND_FROM);

export const sendPlainTextEmail = async ({
  to,
  subject,
  text,
  html = "",
  replyTo = "",
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) => {
  const normalizedReplyTo = isNonEmptyString(replyTo)
    ? replyTo.trim()
    : isNonEmptyString(MAILERSEND_REPLY_TO)
      ? MAILERSEND_REPLY_TO
      : isNonEmptyString(RESEND_REPLY_TO)
        ? RESEND_REPLY_TO
        : "";

  if (mailerSendConfigured && mailerSendSender) {
    const replyToMailbox = parseMailbox(normalizedReplyTo);
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          email: mailerSendSender.email,
          ...(mailerSendSender.name ? { name: mailerSendSender.name } : {}),
        },
        to: [{ email: to }],
        subject,
        text,
        ...(html ? { html } : {}),
        ...(replyToMailbox
          ? {
              reply_to: {
                email: replyToMailbox.email,
                ...(replyToMailbox.name && replyToMailbox.name !== replyToMailbox.email
                  ? { name: replyToMailbox.name }
                  : {}),
              },
            }
          : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`MailerSend email API failed (${response.status}).`);
    }

    return true;
  }

  if (resendConfigured) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        text,
        ...(html ? { html } : {}),
        ...(normalizedReplyTo ? { reply_to: normalizedReplyTo } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend email API failed (${response.status}).`);
    }

    return true;
  }

  throw new Error("Email notifications are not configured.");
};
