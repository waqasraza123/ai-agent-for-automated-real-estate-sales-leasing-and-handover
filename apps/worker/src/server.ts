import { createAlphaLeadCaptureStore } from "@real-estate-ai/database";
import { runPersistedFollowUpCycle } from "@real-estate-ai/workflows";

import { parseWorkerEnvironment } from "./env";

const environment = parseWorkerEnvironment(process.env);
const store = await createAlphaLeadCaptureStore({
  dataPath: environment.WORKER_DATABASE_PATH
});

const runCycle = async () => {
  const result = await runPersistedFollowUpCycle(store, {
    limit: environment.WORKER_BATCH_LIMIT
  });

  if (result.processedJobs > 0 || result.openedInterventions > 0) {
    console.info(
      JSON.stringify({
        openedInterventions: result.openedInterventions,
        processedJobs: result.processedJobs,
        touchedCaseIds: result.touchedCaseIds,
        worker: "follow_up_cycle"
      })
    );
  }
};

await runCycle();

const intervalHandle = setInterval(() => {
  void runCycle();
}, environment.WORKER_POLL_INTERVAL_MS);

const stop = async () => {
  clearInterval(intervalHandle);
  await store.close();
  process.exit(0);
};

process.on("SIGINT", () => {
  void stop();
});

process.on("SIGTERM", () => {
  void stop();
});
