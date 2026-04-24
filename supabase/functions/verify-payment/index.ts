import { handleCors, json } from "../_shared/cors.ts";
import { verifyPaymentByReference } from "../_shared/orders.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = (await req.json()) as { reference?: string };
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";

    if (!reference) {
      return json({ paid: false, message: "Missing transaction reference." }, { status: 400 });
    }

    const result = await verifyPaymentByReference(reference);
    return json(result);
  } catch (error) {
    return json(
      { paid: false, message: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 400 }
    );
  }
});
