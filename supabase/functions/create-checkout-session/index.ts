import { createCheckoutSession } from "../_shared/orders.ts";
import { handleCors, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const payload = (await req.json()) as Record<string, unknown>;
    const result = await createCheckoutSession(payload);
    return json(result);
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : "Payment could not be initialized." },
      { status: 400 }
    );
  }
});
