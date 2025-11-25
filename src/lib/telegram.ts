import { supabase } from "@/integrations/supabase/client";

type TelegramEvent = "NEW_USER" | "CARD_DEPOSIT_ATTEMPT";

interface TelegramNotificationPayload {
  [key: string]: unknown;
}

export const sendTelegramNotification = async (
  event: TelegramEvent,
  payload: TelegramNotificationPayload
) => {
  try {
    const { error } = await supabase.functions.invoke("notify-telegram", {
      body: { event, payload },
    });

    if (error) {
      console.error("Telegram notification error:", error);
    }
  } catch (err) {
    console.error("Failed to notify Telegram:", err);
  }
};

