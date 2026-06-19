import { describe, it, expect, afterEach } from "vitest";
import {
  escHtml,
  escAttr,
  stableHue,
  categoryColor,
  categoryLabel,
  buildSearchBlob,
  debounce,
  platformChipsHtml,
  qualityChipHtml,
  dumpFrontmatter,
  skillToMarkdown,
} from "./shared";
import { setLocale } from "./i18n";
import type { SkillIndexEntry, Skill } from "./types";

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

  it("escapes carriage returns", () => {
    expect(escAttr("a\r\nb")).toBe("a&#13;&#10;b");
  });

  it("escapes ampersand and quotes", () => {
    expect(escAttr('a & "b"')).toBe("a &amp; &quot;b&quot;");
  });

  it("leaves plain text unchanged", () => {
    expect(escAttr("plain text")).toBe("plain text");
  });

  it("returns empty string for empty input", () => {
    expect(escAttr("")).toBe("");
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

describe("categoryLabel", () => {
  afterEach(() => setLocale("en"));

  it("returns English label for known category", () => {
    expect(categoryLabel("dev-tools")).toBe("Developer tools");
  });

  it("returns Chinese label when locale is zh", () => {
    setLocale("zh");
    expect(categoryLabel("dev-tools")).toBe("开发工具");
  });

  it("title-cases unknown categories", () => {
    expect(categoryLabel("my-category")).toBe("My Category");
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

  it("handles empty tags without injecting undefined", () => {
    const entry: SkillIndexEntry = {
      slug: "minimal",
      name: "Minimal",
      description: "A skill",
      category: "dev-tools",
      tags: [],
      platforms: [],
      needs_review: false,
      quality: "stable",
      path: "skills/minimal/SKILL.md",
    };
    const blob = buildSearchBlob(entry);
    expect(blob).toContain("minimal");
    expect(blob).toContain("a skill");
    expect(blob).not.toContain("undefined");
  });

  it("omits missing optional fields without undefined", () => {
    const entry: SkillIndexEntry = {
      slug: "no-zh",
      name: "No Zh",
      description: "No Chinese fields",
      category: "dev-tools",
      tags: ["test"],
      platforms: [],
      needs_review: false,
      quality: "stable",
      path: "skills/no-zh/SKILL.md",
    };
    expect(buildSearchBlob(entry)).not.toContain("undefined");
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

describe("dumpFrontmatter", () => {
  const baseSkill: Skill = {
    slug: "test-skill",
    name: "Test Skill",
    version: "1.0.0",
    description: "A test skill",
    category: "dev-tools",
    tags: ["test", "example"],
    platforms: [],
    inputs: [
      {
        name: "path",
        type: "path",
        required: true,
        description: "File path",
      },
    ],
    output: { format: "markdown" },
    author: "tester",
    license: "MIT",
    created: "2026-06-19",
    updated: "2026-06-19",
    needs_review: false,
    quality: "stable",
    body: "# Prompt\nHello",
  };

  it("starts and ends with YAML frontmatter markers", () => {
    const yaml = dumpFrontmatter(baseSkill);
    expect(yaml.startsWith("---\n")).toBe(true);
    expect(yaml.endsWith("\n---\n")).toBe(true);
  });

  it("includes scalar fields", () => {
    const yaml = dumpFrontmatter(baseSkill);
    expect(yaml).toContain('slug: "test-skill"');
    expect(yaml).toContain('name: "Test Skill"');
    expect(yaml).toContain('version: "1.0.0"');
  });

  it("dumps arrays and nested objects", () => {
    const yaml = dumpFrontmatter(baseSkill);
    expect(yaml).toContain("tags:");
    expect(yaml).toContain('  - "test"');
    expect(yaml).toContain('  - "example"');
    expect(yaml).toContain("inputs:");
    expect(yaml).toContain("  -");
    expect(yaml).toContain('    name: "path"');
    expect(yaml).toContain('    type: "path"');
  });

  it("omits undefined optional fields", () => {
    const yaml = dumpFrontmatter(baseSkill);
    expect(yaml).not.toContain("name_zh:");
    expect(yaml).not.toContain("description_zh:");
  });
});

describe("skillToMarkdown", () => {
  const baseSkill: Skill = {
    slug: "test-skill",
    name: "Test Skill",
    version: "1.0.0",
    description: "A test skill",
    category: "dev-tools",
    tags: ["test"],
    platforms: [],
    inputs: [],
    output: { format: "markdown" },
    author: "tester",
    license: "MIT",
    created: "2026-06-19",
    updated: "2026-06-19",
    needs_review: false,
    quality: "stable",
    body: "# Prompt\nHello",
  };

  it("returns rawMarkdown when present", () => {
    const raw = "---\nraw: true\n---\n# Raw body";
    expect(skillToMarkdown({ ...baseSkill, rawMarkdown: raw })).toBe(raw);
  });

  it("falls back to dumpFrontmatter plus body when rawMarkdown is absent", () => {
    const md = skillToMarkdown(baseSkill);
    expect(md.startsWith("---\n")).toBe(true);
    expect(md).toContain("# Prompt\nHello");
  });
});
