import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Safely remove a Supabase Realtime channel, catching any cascading
 * promise rejections that can occur when the WebSocket is already dead
 * (e.g. after a tab visibility change).
 */
export async function safeRemoveChannel(channel: RealtimeChannel | null): Promise<void> {
  if (!channel) return;
  try {
    await supabase.removeChannel(channel);
  } catch {
    // Swallow errors – the channel is already dead / being cleaned up
  }
}
