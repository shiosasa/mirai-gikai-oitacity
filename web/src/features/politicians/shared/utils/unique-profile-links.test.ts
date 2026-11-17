import { expect, it } from "vitest";
import { uniqueProfileLinks } from "./unique-profile-links";

it("keeps a former person's link but does not guess between people with the same name", () => {
  const links = uniqueProfileLinks([
    { id: "former", name: "元議員" },
    { id: "a", name: "同姓同名" },
    { id: "b", name: "同姓同名" },
  ]);
  expect(links.get("元議員")).toBe("/politicians/former");
  expect(links.has("同姓同名")).toBe(false);
});
