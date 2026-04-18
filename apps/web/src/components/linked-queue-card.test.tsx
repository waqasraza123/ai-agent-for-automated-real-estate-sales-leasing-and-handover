import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@real-estate-ai/ui";

import { LinkedQueueCard } from "./linked-queue-card";

Object.assign(globalThis, { React });

describe("LinkedQueueCard", () => {
  it("renders shared linked queue copy and badges through the case-link shell", () => {
    const html = renderToStaticMarkup(
      createElement(
        LinkedQueueCard,
        {
          badges: createElement(StatusBadge, null, "Planning"),
          href: "/ar/handover/handover-1",
          meta: "CASE-1001",
          summary: "Schedule final readiness review",
          testId: "linked-queue-card",
          title: "Noura Al-Harbi"
        },
        createElement("p", { className: "text-xs" }, "Updated 2026-04-18 20:00")
      )
    );

    expect(html).toContain('data-testid="linked-queue-card"');
    expect(html).toContain("Noura Al-Harbi");
    expect(html).toContain("CASE-1001");
    expect(html).toContain("Schedule final readiness review");
    expect(html).toContain("Planning");
    expect(html).toContain("/ar/handover/handover-1");
  });
});
