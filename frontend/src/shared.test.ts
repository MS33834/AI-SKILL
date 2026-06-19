import { describe, it, expect } from "vitest";
import {
  escHtml,
  escAttr,
  stableHue,
  categoryColor,
  buildSearchBlob,
  debounce,
  platformChipsHtml,
  qualityChipHtml,
} from "./shared";
import type { SkillIndexEntry } from "./types";

describe("escHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escHtml("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
  });

  it("leaves plain text unchanged", () => {
    expect(escHtml("hello world")).toBe("hello world");
  });
});

describe("escAttr", () => {
  it("escapes newlines for attribute safety", () => {
    expect(escAttr('line1\nline2"')).toBe("line1&#10;line2&quot;");
  });
});

describe("stableHue", () => {
  it("returns a number between 0 and 359", () => {
    expect(stableHue("hello")).toBeGreaterThanOrEqual(0);
    expect(stableHue("hello")).toBeLessThan(360);
  });

  it("is stable for the same input", () => {
    expect(stableHue("foo")).toBe(stableHue("foo"));
  });
});

describe("categoryColor", () => {
  it("produces an hsl string", () => {
    expect(categoryColor("dev-tools")).toMatch(/^hsl\(\d+\s+\d+%\s+\d+%\)$/);
  });
});

describe("buildSearchBlob", () => {
  it("concatenates searchable fields in lower case", () => {
    const entry: SkillIndexEntry = {
      slug: "pdf-summarizer",
      name: "PDF Summarizer",
      description: "Summarize PDFs",
      category: "dev-tools",
      tags: ["pdf", "summarization"],
      platforms: [],
      needs_review: false,
      quality: "stable",
      path: "skills/pdf-summarizer/SKILL.md",
    };
    expect(buildSearchBlob(entry)).toContain("pdf");
    expect(buildSearchBlob(entry)).toContain("summarize pdfs");
    expect(buildSearchBlob(entry)).toBe(buildSearchBlob(entry).toLowerCase());
  });
});

describe("debounce", () => {
  it("delays invocation", async () => {
    let called = 0;
    const fn = debounce(() => called++, 20);
    fn();
    fn();
    fn();
    expect(called).toBe(0);
    await new Promise((r) => setTimeout(r, 40));
    expect(called).toBe(1);
  });
});

describe("platformChipsHtml", () => {
  it("renders vendor-neutral chip when no platforms", () => {
    const html = platformChipsHtml([]);
    expect(html).toContain("chip--all");
    expect(html).toContain("any");
  });

  it("renders platform-specific chips", () => {
    const html = platformChipsHtml(["claude"]);
    expect(html).toContain("chip--claude");
  });
});

describe("qualityChipHtml", () => {
  it("returns empty for stable quality", () => {
    expect(qualityChipHtml("stable")).toBe("");
    expect(qualityChipHtml(undefined)).toBe("");
  });

  it("renders a chip for non-stable quality", () => {
    const html = qualityChipHtml("beta");
    expect(html).toContain("chip--quality-beta");
    expect(html).toContain("beta");
  });
});
