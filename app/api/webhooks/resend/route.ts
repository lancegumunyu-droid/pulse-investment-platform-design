import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (service role — never expose this key client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET!;

type ResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.bounced"
  | "email.complained"
  | "email.opened"
  | "email.clicked"
  | "email.failed";

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    [key: string]: unknown;
  };
}

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("RESEND_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // 1. Verify the request is genuinely from Resend
  const payload = await req.text();
  const headerList = await headers();

  const svixHeaders = {
    "svix-id": headerList.get("svix-id") ?? "",
    "svix-timestamp": headerList.get("svix-timestamp") ?? "",
    "svix-signature": headerList.get("svix-signature") ?? "",
  };

  if (!svixHeaders["svix-id"] || !svixHeaders["svix-signature"]) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  let event: ResendWebhookPayload;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(payload, svixHeaders) as ResendWebhookPayload;
  } catch (err) {
    console.error("Resend webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Log every event for observability/audit trail
  const { error: logError } = await supabase.from("email_events").insert({
    event_type: event.type,
    email_id: event.data.email_id,
    from_address: event.data.from,
    to_addresses: event.data.to,
    subject: event.data.subject,
    raw_payload: event.data,
    created_at: event.created_at,
  });

  if (logError) {
    // Don't fail the webhook over a logging error — Resend will retry on non-2xx
    console.error("Failed to log email event to Supabase:", logError);
  }

  // 3. Business-logic handling per event type
  switch (event.type) {
    case "email.bounced":
    case "email.failed": {
      // Example: flag the associated user record if this was a KYC/verification email
      // so support/admin can see delivery failed and follow up.
      await supabase
        .from("notifications")
        .insert({
          type: "email_delivery_failure",
          message: `Email to ${event.data.to?.[0]} failed (${event.type})`,
          meta: { email_id: event.data.email_id, subject: event.data.subject },
        });
      break;
    }

    case "email.complained": {
      // Someone marked an email as spam — suppress future sends to this address.
      const recipient = event.data.to?.[0];
      if (recipient) {
        await supabase
          .from("email_suppressions")
          .upsert({ email: recipient, reason: "complained", created_at: new Date().toISOString() });
      }
      break;
    }

    case "email.delivered":
    case "email.sent":
    case "email.opened":
    case "email.clicked":
    case "email.delivery_delayed":
      // No special handling needed beyond the audit log above.
      break;

    default:
      console.warn("Unhandled Resend event type:", event.type);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
