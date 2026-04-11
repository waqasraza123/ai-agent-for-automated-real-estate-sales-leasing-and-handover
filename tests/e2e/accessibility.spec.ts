import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { smokeRoutes } from "@real-estate-ai/testing";

test("skip link moves focus to main content @a11y", async ({ page }) => {
  await page.goto(smokeRoutes.landing);
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chrome-main")).toBeFocused();
});

for (const route of [smokeRoutes.landing, smokeRoutes.leads, smokeRoutes.leadConversation, smokeRoutes.manager]) {
  test(`axe audit passes for ${route} @a11y`, async ({ page }) => {
    await page.goto(route);

    const result = await new AxeBuilder({ page }).analyze();

    expect(result.violations).toEqual([]);
  });
}
