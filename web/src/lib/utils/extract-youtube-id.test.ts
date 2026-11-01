import { describe, expect, it } from "vitest";
import { extractYouTubeId } from "./extract-youtube-id";

describe("extractYouTubeId", () => {
  it.each([
    "https://youtu.be/umZjJ0lHVZ0?si=example",
    "https://www.youtube.com/watch?v=umZjJ0lHVZ0&t=42",
    "https://youtube.com/watch?t=42&v=umZjJ0lHVZ0",
    "https://www.youtube.com/embed/umZjJ0lHVZ0",
  ])("extracts a video ID from %s", (url) => {
    expect(extractYouTubeId(url)).toBe("umZjJ0lHVZ0");
  });

  it.each([
    null,
    "",
    "https://youtube.com.example.org/watch?v=umZjJ0lHVZ0",
    "https://example.org/youtube.com/watch?v=umZjJ0lHVZ0",
    "javascript:alert(1)",
    "https://www.youtube.com/watch?v=bad%2Fvalue",
    "https://youtu.be/a/b",
  ])("rejects an unsupported or unsafe URL: %s", (url) => {
    expect(extractYouTubeId(url)).toBeNull();
  });
});
