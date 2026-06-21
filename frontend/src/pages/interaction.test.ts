import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderList } from "./list";
import { renderBundle } from "./bundle";
import type { SkillIndex, SkillIndexEntry } from "../types";

const mockEntries: SkillIndexEntry[] = [
  {
    slug: "code-review",
    name: "Code Review",
    name_zh: "代码审查",
    description: "Review code",
    description_zh: "审查代码",
    category: "dev-tools",
    tags: ["code"],
    platforms: ["claude"],
    needs_review: false,
    quality: "stable",
    path: "skills/code-review/SKILL.md",
  },
  {
    slug: "api-design-review",
    name: "API Design Review",
    name_zh: "API 设计审查",
    description: "Review APIs",
    description_zh: "审查 API",
    category: "dev-tools",
    tags: ["api"],
    platforms: [],
    needs_review: false,
    quality: "stable",
    path: "skills/api-design-review/SKILL.md",
  },
  {
    slug: "rag-retrieval-eval",
    name: "RAG Retrieval Eval",
    name_zh: "RAG 检索评估",
    description: "Evaluate RAG retrieval",
    description_zh: "评估 RAG 检索",
    category: "ai-ml",
    tags: ["rag"],
    platforms: ["openai"],
    needs_review: false,
    quality: "stable",
    path: "skills/rag-retrieval-eval/SKILL.md",
  },
  {
    slug: "mcp-builder",
    name: "MCP Builder",
    name_zh: "MCP 构建器",
    description: "Build MCP servers",
    description_zh: "构建 MCP 服务",
    category: "agents",
    tags: ["mcp"],
    platforms: ["claude"],
    needs_review: false,
    quality: "stable",
    path: "skills/mcp-builder/SKILL.md",
  },
];

const mockIndex: SkillIndex = {
  skills: mockEntries,
};

function mockFetch() {
  global.fetch = vi.fn(async (url: string) => {
    if (url.includes("external-repos.json")) {
      return new Response(
        JSON.stringify({
          total: 928,
          domains: { "ai-ml": 100, "dev-tools": 50, agents: 30 },
          repos: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (url.includes("/skills/")) {
      const slug = url.split("/").pop()?.replace(".json", "");
      const entry = mockEntries.find((e) => e.slug === slug);
      if (entry) {
        return new Response(JSON.stringify(entry), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return new Response("not found", { status: 404 });
  }) as unknown as typeof fetch;
}

describe("renderList interactions", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="root"></main>';
    window.location.hash = "";
    // jsdom location is about:blank, which makes URL/history operations
    // noisy. Stub history.replaceState so the router logic doesn't throw.
    vi.spyOn(history, "replaceState").mockImplementation(() => {});
    mockFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the hero, stats, and featured section", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderList(root, mockIndex);

    expect(root.querySelector(".hero")).not.toBeNull();
    expect(root.querySelector(".stats")).not.toBeNull();
    expect(root.querySelector(".featured")).not.toBeNull();

    const localCards = root.querySelectorAll(".featured-card--local");
    const repoCards = root.querySelectorAll(".featured-card--repo");
    expect(localCards.length).toBe(4);
    expect(repoCards.length).toBe(10);
  });

  it("filters cards by search query", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderList(root, mockIndex);

    const qInput = root.querySelector<HTMLInputElement>("#filter-q")!;
    qInput.value = "code";
    qInput.dispatchEvent(new Event("input", { bubbles: true }));

    // Wait for debounced paint (80ms)
    await new Promise((r) => setTimeout(r, 120));

    const cards = root.querySelectorAll(".skill-card");
    expect(cards.length).toBe(1);
    expect(cards[0]?.textContent).toContain("code-review");
  });

  it("filters cards by category", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderList(root, mockIndex);

    const catSel = root.querySelector<HTMLSelectElement>("#filter-cat")!;
    catSel.value = "ai-ml";
    catSel.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise((r) => setTimeout(r, 50));

    const cards = root.querySelectorAll(".skill-card");
    expect(cards.length).toBe(1);
    expect(cards[0]?.textContent).toContain("rag-retrieval-eval");
  });

  it("groups cards by category when group toggle is checked", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderList(root, mockIndex);

    const groupCb = root.querySelector<HTMLInputElement>("#filter-group")!;
    groupCb.checked = true;
    groupCb.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise((r) => setTimeout(r, 50));

    const groups = root.querySelectorAll(".cat-group");
    expect(groups.length).toBeGreaterThan(0);
  });
});

describe("renderBundle interactions", () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="root"></main>';
    mockFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the bundle list and sticky action bar", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderBundle(root, mockIndex);

    expect(root.querySelector(".bundle__title")).not.toBeNull();
    expect(root.querySelector(".bundle-list")).not.toBeNull();
    expect(root.querySelector(".bundle-actions")).not.toBeNull();
    expect(root.querySelectorAll(".bundle-list li").length).toBe(4);
  });

  it("selects all visible and updates count", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderBundle(root, mockIndex);

    const selectBtn = root.querySelector<HTMLButtonElement>("#b-select-all")!;
    selectBtn.click();

    const count = root.querySelector<HTMLElement>("#b-count")!;
    expect(count.textContent).toBe("4");

    const downloadBtn = root.querySelector<HTMLButtonElement>("#b-download")!;
    expect(downloadBtn.disabled).toBe(false);
  });

  it("clears selection and disables download", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderBundle(root, mockIndex);

    root.querySelector<HTMLButtonElement>("#b-select-all")!.click();
    root.querySelector<HTMLButtonElement>("#b-clear")!.click();

    const count = root.querySelector<HTMLElement>("#b-count")!;
    expect(count.textContent).toBe("0");

    const downloadBtn = root.querySelector<HTMLButtonElement>("#b-download")!;
    expect(downloadBtn.disabled).toBe(true);
  });

  it("filters the bundle list by search query", async () => {
    const root = document.getElementById("root") as HTMLElement;
    await renderBundle(root, mockIndex);

    const qInput = root.querySelector<HTMLInputElement>("#b-q")!;
    qInput.value = "mcp";
    qInput.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((r) => setTimeout(r, 120));

    expect(root.querySelectorAll(".bundle-list li").length).toBe(1);
  });
});
