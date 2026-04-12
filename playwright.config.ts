import { defineConfig, devices } from "@playwright/test";

const useProductionServer = process.env.PLAYWRIGHT_WEB_SERVER_MODE === "prod";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry"
  },
  webServer: {
    command: useProductionServer
      ? "pnpm --dir apps/web exec next start --hostname 127.0.0.1 --port 3100"
      : "pnpm --dir apps/web exec next dev --hostname 127.0.0.1 --port 3100",
    env: {
      FORCE_COLOR: "0"
    },
    url: "http://127.0.0.1:3100/en",
    reuseExistingServer: true,
    timeout: 240000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
