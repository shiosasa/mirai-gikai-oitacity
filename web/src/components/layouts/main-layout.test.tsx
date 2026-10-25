// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { describe, expect, it } from "vitest";
import { MainLayout } from "./main-layout";

describe("MainLayout", () => {
  it.each([
    "/",
    "/committees",
    "/committees/bill-pickups/example",
    "/politicians",
    "/search",
    "/terms",
    "/privacy",
    "/bills/example",
    "/bills/example/interview",
    "/bills/example/interview/chat",
    "/interview-reports/example",
    "/jimu-jigyo",
  ])("reserves fixed-header space at every viewport size on %s", (pathname) => {
    const { container, getByText } = render(
      <PathnameContext.Provider value={pathname}>
        <MainLayout>
          <main>Page content</main>
        </MainLayout>
      </PathnameContext.Provider>
    );
    const layout = container.firstElementChild;

    expect(layout?.classList.contains("mt-24")).toBe(true);
    expect(layout?.classList.contains("md:mt-24")).toBe(false);
    expect(getByText("Page content")).toBeDefined();
  });

  it.each([
    ["/committees", "max-w-[700px]"],
    ["/jimu-jigyo", "max-w-[1440px]"],
  ])("preserves the content width on %s", (pathname, widthClass) => {
    const { container } = render(
      <PathnameContext.Provider value={pathname}>
        <MainLayout>Page content</MainLayout>
      </PathnameContext.Provider>
    );

    expect(container.firstElementChild?.classList.contains(widthClass)).toBe(
      true
    );
  });
});
