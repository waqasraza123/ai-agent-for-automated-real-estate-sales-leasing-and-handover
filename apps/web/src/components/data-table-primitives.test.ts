import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DataTable, DataTableCell, DataTableHead, DataTableHeaderCell } from "@real-estate-ai/ui";

Object.assign(globalThis, { React });

describe("data table primitives", () => {
  it("renders the shared table shell with header and column-label metadata", () => {
    const html = renderToStaticMarkup(
      createElement(
        DataTable,
        {
          testId: "shared-table",
          children: createElement(
            React.Fragment,
            null,
            createElement(
              DataTableHead,
              {
                children: createElement(
                  "tr",
                  null,
                  createElement(DataTableHeaderCell, { children: "Event" }),
                  createElement(DataTableHeaderCell, { children: "Status" })
                )
              }
            ),
            createElement(
              "tbody",
              null,
              createElement(
                "tr",
                null,
                createElement(DataTableCell, { columnLabel: "Event", children: "Case opened" }),
                createElement(DataTableCell, { columnLabel: "Status", children: "Pending review" })
              )
            )
          )
        }
      )
    );

    expect(html).toContain('data-testid="shared-table"');
    expect(html).toContain("<table");
    expect(html).toContain("Event");
    expect(html).toContain('data-column-label="Status"');
    expect(html).toContain("Pending review");
  });
});
