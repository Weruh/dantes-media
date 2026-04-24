import { handleCors, json } from "../_shared/cors.ts";
import { sendPlainTextEmail } from "../_shared/email.ts";
import { getServiceRoleClient, getSupabaseEnv } from "../_shared/supabase.ts";

const CONTACT_NOTIFY_EMAIL = getSupabaseEnv("CONTACT_NOTIFY_EMAIL", "dantesmedia8@gmail.com");
const quotePhoneRegex = /^[+\d\s()-]{7,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseQuotePayload = (payload: Record<string, unknown>) => {
  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
  const company = typeof payload.company === "string" ? payload.company.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const location = typeof payload.location === "string" ? payload.location.trim() : "";
  const serviceType = typeof payload.serviceType === "string" ? payload.serviceType.trim() : "";
  const budgetRange = typeof payload.budgetRange === "string" ? payload.budgetRange.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (fullName.length < 2) throw new Error("Full name is required.");
  if (!emailRegex.test(email)) throw new Error("Valid email is required.");
  if (!quotePhoneRegex.test(phone)) throw new Error("Valid phone number is required.");
  if (location.length < 2) throw new Error("Location is required.");
  if (serviceType.length < 2) throw new Error("Service type is required.");
  if (message.length < 10) throw new Error("Project details are required.");

  return { fullName, company, email, phone, location, serviceType, budgetRange, message };
};

const createQuoteMessage = (quote: ReturnType<typeof parseQuotePayload>) =>
  [
    "New quote request from website contact form",
    `Full name: ${quote.fullName}`,
    `Company: ${quote.company || "N/A"}`,
    `Email: ${quote.email}`,
    `Phone: ${quote.phone}`,
    `Location: ${quote.location}`,
    `Service type: ${quote.serviceType}`,
    `Budget range: ${quote.budgetRange || "N/A"}`,
    "Project details:",
    quote.message,
  ].join("\n");

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const payload = parseQuotePayload((await req.json()) as Record<string, unknown>);
    const id = `DM-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const supabase = getServiceRoleClient();

    const { error: insertError } = await supabase.from("quote_requests").insert({
      id,
      full_name: payload.fullName,
      company: payload.company,
      email: payload.email,
      phone: payload.phone,
      location: payload.location,
      service_type: payload.serviceType,
      budget_range: payload.budgetRange,
      message: payload.message,
      notification_status: "pending",
      notification_error: "",
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    try {
      await sendPlainTextEmail({
        to: CONTACT_NOTIFY_EMAIL,
        subject: `Quote request from ${payload.fullName}`,
        text: createQuoteMessage(payload),
        replyTo: payload.email,
      });

      await supabase
        .from("quote_requests")
        .update({ notification_status: "sent", notification_error: "" })
        .eq("id", id);

      return json({ message: "Quote request sent." }, { status: 201 });
    } catch (emailError) {
      const message =
        emailError instanceof Error
          ? emailError.message
          : "Quote request notification could not be sent.";

      await supabase
        .from("quote_requests")
        .update({ notification_status: "pending", notification_error: message })
        .eq("id", id);

      return json(
        { message: "Quote request received. We'll follow up shortly." },
        { status: 202 }
      );
    }
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : "Unable to submit quote request." },
      { status: 400 }
    );
  }
});
