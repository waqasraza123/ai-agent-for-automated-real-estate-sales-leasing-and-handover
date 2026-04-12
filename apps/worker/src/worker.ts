import { createAlphaLeadCaptureStore } from "@real-estate-ai/database";
import { runPersistedFollowUpCycle } from "@real-estate-ai/workflows";

export async function runFollowUpWorkerCycle(input: {
  dataPath: string;
  limit: number;
  runAt?: string;
}) {
  const store = await createAlphaLeadCaptureStore({
    dataPath: input.dataPath
  });

  try {
    return await runPersistedFollowUpCycle(store, input.runAt ? { limit: input.limit, runAt: input.runAt } : { limit: input.limit });
  } finally {
    await store.close();
  }
}
