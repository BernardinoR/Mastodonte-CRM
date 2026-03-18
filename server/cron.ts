import cron from "node-cron";
import { syncAllExtratoStatuses } from "./consolidationHistory";

export function startCronJobs() {
  // Sync ExtratoStatuses daily at 6:00 AM
  cron.schedule("0 6 * * *", async () => {
    console.log("[cron] Sync ExtratoStatuses...");
    try {
      const result = await syncAllExtratoStatuses();
      console.log(`[cron] Concluído: ${result.synced} registros`);
    } catch (error) {
      console.error("[cron] Erro:", error);
    }
  });

  console.log("[cron] Cron jobs initialized");
}
