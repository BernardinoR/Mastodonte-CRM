import cron from "node-cron";
import { syncAllExtratoStatuses } from "./consolidationHistory";
import { prisma } from "./db";

export function startCronJobs() {
  // Sync inicial ao iniciar
  syncAllExtratoStatuses().catch((e) => console.error("[cron] Sync inicial falhou:", e));

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

  // Cleanup varredura checks older than 15 days — daily at 1:00 AM
  cron.schedule("0 1 * * *", async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 15);
      const cutoffStr = cutoff.toISOString().split("T")[0];
      const { count } = await prisma.varreduraCheck.deleteMany({
        where: { date: { lt: cutoffStr } },
      });
      console.log(`[cron] Varredura cleanup: ${count} checks antigos removidos`);
    } catch (error) {
      console.error("[cron] Varredura cleanup erro:", error);
    }
  });

  console.log("[cron] Cron jobs initialized");
}
