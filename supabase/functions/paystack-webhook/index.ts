import { handleCors, json } from "../_shared/cors.ts";
import { markOrderPaid, verifyPaystackWebhookSignature } from "../_shared/orders.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const signature = req.headers.get("x-paystack-signature") || "";
    const rawBody = await req.text();
    const valid = await verifyPaystackWebhookSignature(signature, rawBody);

    if (!valid) {
      return json({ message: "Invalid webhook signature." }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event?.event === "charge.success") {
      try {
        await markOrderPaid(event.data || {}, "webhook");
      } catch (error) {
        console.error("[paystack-webhook] charge.success failed:", error);
      }
    }

    return json({ received: true });
  } catch (error) {
    return json(
      { message: error instanceof Error ? error.message : "Invalid webhook payload." },
      { status: 400 }
    );
  }
});
