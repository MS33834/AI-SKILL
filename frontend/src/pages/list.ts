// List page: searchable + filterable grid of skill cards.
//
// Layout:
//   .hero          — large display title + sub + CTAs (rendered once
//                    when the page mounts; survives filter changes).
//   .stats         — four big numbers: SKILL.md / categories / indexed repos / domains.
//   .filter-bar    — search + category + platform selects.
//   .cat-group     — one block per category with grouped cards.
//
// The category color bar on each card is `--cat-color`, set inline
// from a stable category→hue map. Keeping the map in JS — not CSS
// — means we don't have to maintain N parallel .chip--<cat> rules
// and the colors are visible from one place.
//
// i18n: the page reads its strings via t() and shows the localized
// name/description from each SkillIndexEntry when the current
// locale is Chinese and the zh fields are present.

import type { SkillIndex, SkillIndexEntry } from "../types";
import { t, pickZh } from "../i18n";
import {
  brandMarkSvg,
  categoryLabel,
  escHtml,
  escAttr,
  categoryColor,
  categoryHue,
  platformChipsHtml,
  qualityChipHtml,
  buildSearchBlob,
  debounce,
  iconSvg,
} from "../shared";

// Curated highlights for first-time visitors. Local slugs are resolved
// against the current index; external repos link straight to GitHub.
interface FeaturedRepo {
  slug?: string;
  repo: string;
  title: string;
  description: string;
  href: string;
}

const FEATURED_LOCAL_SLUGS = ["code-review", "api-design-review", "rag-retrieval-eval", "mcp-builder"];

const FEATURED_REPOS: FeaturedRepo[] = [
  {
    repo: "langchain-ai/langchain",
    title: "LangChain",
    description: "The most widely adopted framework for building agents and chains.",
    href: "https://github.com/langchain-ai/langchain",
  },
  {
    repo: "run-llama/llama_index",
    title: "LlamaIndex",
    description: "Data framework for building LLM apps over your own data.",
    href: "https://github.com/run-llama/llama_index",
  },
  {
    repo: "Significant-Gravitas/AutoGPT",
    title: "AutoGPT",
    description: "Autonomous tool-using agent that plans and executes tasks.",
    href: "https://github.com/Significant-Gravitas/AutoGPT",
  },
  {
    repo: "ollama/ollama",
    title: "Ollama",
    description: "Run Llama, DeepSeek, and other models locally.",
    href: "https://github.com/ollama/ollama",
  },
  {
    repo: "vllm-project/vllm",
    title: "vLLM",
    description: "High-throughput LLM inference engine for production serving.",
    href: "https://github.com/vllm-project/vllm",
  },
  {
    repo: "langgenius/dify",
    title: "Dify",
    description: "Open-source LLM app platform for building AI workflows.",
    href: "https://github.com/langgenius/dify",
  },
  {
    repo: "open-webui/open-webui",
    title: "Open WebUI",
    description: "Self-hosted AI chat interface that works with many backends.",
    href: "https://github.com/open-webui/open-webui",
  },
  {
    repo: "n8n-io/n8n",
    title: "n8n",
    description: "Workflow automation with AI-native nodes and integrations.",
    href: "https://github.com/n8n-io/n8n",
  },
  {
    repo: "modelcontextprotocol/servers",
    title: "MCP Servers",
    description: "Official reference servers for the Model Context Protocol.",
    href: "https://github.com/modelcontextprotocol/servers",
  },
  {
    repo: "anthropics/anthropic-cookbook",
    title: "Claude Cookbook",
    description: "Official patterns for tool use, RAG, and structured output.",
    href: "https://github.com/anthropics/anthropic-cookbook",
  },
];

function featuredHtml(index: SkillIndex): string {
  const localSkills = FEATURED_LOCAL_SLUGS.map((slug) => index.skills.find((s) => s.slug === slug)).filter(
    Boolean
  ) as SkillIndexEntry[];

  const localCards = localSkills
    .map((s) => {
      const name = pickZh(s, "name");
      const desc = pickZh(s, "description");
      return `
        <a class="featured-card featured-card--local" href="#/skill/${escAttr(s.slug)}" style="--cat-hue: ${categoryHue(s.category)};">
          <span class="featured-card__type">${escHtml(categoryLabel(s.category))}</span>
          <h3 class="featured-card__title">${escHtml(name)}</h3>
          <p class="featured-card__desc">${escHtml(desc)}</p>
          <span class="featured-card__cta">${escHtml(t("featured.view"))} ${iconSvg("arrowRight", 14)}</span>
        </a>
      `;
    })
    .join("");

  const repoCards = FEATURED_REPOS.map(
    (r) => `
      <a class="featured-card featured-card--repo" href="${escAttr(r.href)}" target="_blank" rel="noopener">
        <span class="featured-card__type">${escHtml(r.repo)}</span>
        <h3 class="featured-card__title">${escHtml(r.title)}</h3>
        <p class="featured-card__desc">${escHtml(r.description)}</p>
        <span class="featured-card__cta">${escHtml(t("featured.visit"))} ${iconSvg("arrowRight", 14)}</span>
      </a>
    `
  ).join("");

  return `
    <section class="featured" aria-labelledby="featured-title">
      <div class="container-wide">
        <header class="featured__head">
          <h2 id="featured-title" class="featured__title">${escHtml(t("featured.title"))}</h2>
          <p class="featured__lead">${escHtml(t("hero.sub", { skills: String(index.skills.length), repos: "900+" }))}</p>
        </header>

        <div class="featured__group">
          <h3 class="featured__subhead">${escHtml(t("featured.local"))}</h3>
          <p class="featured__hint">${escHtml(t("featured.localHint"))}</p>
          <div class="featured__grid">${localCards}</div>
        </div>

        <div class="featured__group">
          <h3 class="featured__subhead">${escHtml(t("featured.repos"))}</h3>
          <p class="featured__hint">${escHtml(t("featured.reposHint"))}</p>
          <div class="featured__grid">${repoCards}</div>
        </div>
      </div>
    </section>
  `;
}

interface ExternalIndexData {
  repos: unknown[];
  domains: Record<string, unknown>;
  total: number;
}

let externalIndexCache: ExternalIndexData | null = null;

function emptyStateHtml(message: string): string {
  return `
    <div class="empty-state">
      <svg class="brand-mark" width="32" height="32" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <rect width="16" height="16" rx="2" fill="currentColor" />
      </svg>
      <span class="empty-state__title">${escHtml(message)}</span>
    </div>
  `;
}

async function loadExternalIndex(): Promise<ExternalIndexData> {
  if (externalIndexCache) return externalIndexCache;
  const r = await fetch(`${import.meta.env.BASE_URL}external-repos.json`);
  if (!r.ok) throw new Error(`fetch external-repos.json: ${r.status}`);
  externalIndexCache = (await r.json()) as ExternalIndexData;
  return externalIndexCache;
}

export async function renderList(root: HTMLElement, index: SkillIndex): Promise<void> {
  // Initial filter state from URL
  const url = new URL(window.location.href);
  const initialQ = url.searchParams.get("q") ?? "";
  const initialCat = url.searchParams.get("category") ?? "";
  const initialPlat = url.searchParams.get("platform") ?? "";
  const initialGroup = url.searchParams.get("group") ?? "1";

  const totalSkills = index.skills.length;
  const totalCategories = new Set(index.skills.map((s) => s.category)).size;

  // Load external index stats for the hero / stat bar. If it fails
  // (network, deployment mismatch), degrade gracefully instead of
  // breaking the whole page.
  let indexedRepos = 0;
  let domains = 0;
  let externalStatsReady = false;
  try {
    const ext = await loadExternalIndex();
    indexedRepos = ext.total;
    domains = Object.keys(ext.domains).length;
    externalStatsReady = true;
  } catch (e) {
    console.warn("failed to load external index stats", e);
  }

  root.innerHTML = `
    <section class="hero">
      <div class="hero__eyebrow">
        <span>${escHtml(t("eyebrow.tag"))}</span>
        <span aria-hidden="true">·</span>
        <span>${escHtml(t("eyebrow.version"))}</span>
      </div>
      <h1 class="hero__title">
        ${totalSkills} <em>SKILL.md</em><br/>
        ${escHtml(t("hero.title1"))}
      </h1>
      <p class="hero__sub">${escHtml(t("hero.sub", { skills: String(totalSkills), repos: externalStatsReady ? String(indexedRepos) : "900+" }))}</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#/external">${escHtml(t("hero.cta.index"))} ${iconSvg("arrowRight", 16)}</a>
        <a class="btn" href="#/bundle">${escHtml(t("hero.cta.bundle"))} ${iconSvg("arrowRight", 16)}</a>
        <a class="btn btn--ghost" href="https://github.com/MS33834/AI-SKILL/blob/main/docs/getting-started.md" target="_blank" rel="noopener">${escHtml(t("hero.cta.guide"))} ${iconSvg("arrowRight", 16)}</a>
      </div>
      <div class="hero__mark-glyph" aria-hidden="true">${brandMarkSvg()} <span>AI-SKILL</span></div>
    </section>

    <div class="stats" aria-label="${escAttr(t("aria.siteStats"))}">
      <div class="stat" aria-label="${escAttr(t("stat.total.label"))}">
        <span class="stat__num">${totalSkills}<em>${escHtml(t("stat.total.suffix"))}</em></span>
        <span class="stat__label">${escHtml(t("stat.total.label"))}</span>
      </div>
      <div class="stat" aria-label="${escAttr(t("stat.categories.label"))}">
        <span class="stat__num">${totalCategories}<em>${escHtml(t("stat.cat.suffix"))}</em></span>
        <span class="stat__label">${escHtml(t("stat.categories.label"))}</span>
      </div>
      <div class="stat" aria-label="${escAttr(t("stat.neutral.label"))}">
        <span class="stat__num">${externalStatsReady ? indexedRepos : "—"}<em>${escHtml(t("stat.neutral.suffix"))}</em></span>
        <span class="stat__label">${escHtml(t("stat.neutral.label"))}</span>
      </div>
      <div class="stat" aria-label="${escAttr(t("stat.domains.label"))}">
        <span class="stat__num">${externalStatsReady ? domains : "—"}<em>${escHtml(t("stat.domains.suffix"))}</em></span>
        <span class="stat__label">${escHtml(t("stat.domains.label"))}</span>
      </div>
    </div>

    ${featuredHtml(index)}

    <div class="container-wide">
      <div class="filter-bar" role="search">
        <input type="search" id="filter-q" placeholder="${escAttr(t("filter.search.ph"))}" value="${escAttr(initialQ)}" aria-label="${escAttr(t("filter.search.ph"))}" />
        <select id="filter-cat" aria-label="${escAttr(t("filter.cat.label"))}">
          <option value="">${escHtml(t("filter.cat.all"))}</option>
        </select>
        <select id="filter-plat" aria-label="${escAttr(t("filter.plat.label"))}">
          <option value="">${escHtml(t("filter.plat.all"))}</option>
          <option value="all">${escHtml(t("filter.plat.any"))}</option>
          <option value="claude">${escHtml(t("filter.plat.claude"))}</option>
          <option value="codex">${escHtml(t("filter.plat.codex"))}</option>
          <option value="cursor">${escHtml(t("filter.plat.cursor"))}</option>
          <option value="continue">${escHtml(t("filter.plat.continue"))}</option>
        </select>
        <label class="group-toggle" title="${escAttr(t("filter.group"))}">
          <input type="checkbox" id="filter-group" ${initialGroup === "1" ? "checked" : ""} />
          <span>${escHtml(t("filter.group"))}</span>
        </label>
      </div>
      <div id="list-live" class="sr-only" aria-live="polite" aria-atomic="true"></div>
      <div id="cards"></div>
    </div>
  `;

  // Populate the category dropdown
  const catSel = root.querySelector<HTMLSelectElement>("#filter-cat")!;
  const cats = Array.from(new Set(index.skills.map((s) => s.category))).sort();
  for (const c of cats) {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = categoryLabel(c);
    if (c === initialCat) o.selected = true;
    catSel.appendChild(o);
  }
  const platSel = root.querySelector<HTMLSelectElement>("#filter-plat")!;
  platSel.value = initialPlat;
  const groupCb = root.querySelector<HTMLInputElement>("#filter-group")!;

  const qInput = root.querySelector<HTMLInputElement>("#filter-q")!;
  const cards = root.querySelector<HTMLDivElement>("#cards")!;
  const liveEl = root.querySelector<HTMLElement>("#list-live")!;

  // Only play the entrance animation on the very first paint. After
  // that, filtering/grouping should update the grid without replaying
  // fadeUp on every keystroke.
  let firstPaint = true;

  function paint() {
    const q = qInput.value.trim().toLowerCase();
    const cat = catSel.value;
    const plat = platSel.value;
    const grouped = groupCb.checked;
    const filtered = index.skills.filter((s) => match(s, q, cat, plat));
    // Update URL (no reload) so links share state
    const u = new URL(window.location.href);
    u.searchParams.set("q", q);
    u.searchParams.set("category", cat);
    u.searchParams.set("platform", plat);
    u.searchParams.set("group", grouped ? "1" : "0");
    history.replaceState(null, "", u.toString());

    liveEl.textContent = t("aria.resultsCount", { n: filtered.length });
    if (filtered.length === 0) {
      cards.innerHTML = emptyStateHtml(t("empty.noResults"));
      firstPaint = false;
      return;
    }
    if (grouped && !cat) {
      // Group by category, ordered by descending count.
      const byCat = new Map<string, SkillIndexEntry[]>();
      for (const s of filtered) {
        const arr = byCat.get(s.category) ?? [];
        arr.push(s);
        byCat.set(s.category, arr);
      }
      const order = Array.from(byCat.entries()).sort((a, b) => b[1].length - a[1].length);
      let i = 0;
      cards.innerHTML = order
        .map(
          ([c, list]) => `
        <section class="cat-group">
          <header class="cat-group__head">
            <h2 class="cat-group__title">${escHtml(categoryLabel(c))}</h2>
            <span class="cat-group__count">${escHtml(t(list.length === 1 ? "categoryCount.one" : "categoryCount.other", { n: list.length }))}</span>
          </header>
          <div class="cards">
            ${list.map((s) => cardHtml(s, i++, firstPaint)).join("")}
          </div>
        </section>
      `
        )
        .join("");
    } else {
      let i = 0;
      cards.innerHTML = `<div class="cards">${filtered.map((s) => cardHtml(s, i++, firstPaint)).join("")}</div>`;
    }
    firstPaint = false;
  }

  qInput.addEventListener("input", debounce(paint, 80));
  catSel.addEventListener("change", paint);
  platSel.addEventListener("change", paint);
  groupCb.addEventListener("change", paint);

  paint();
  qInput.focus();
}

function match(s: SkillIndexEntry, q: string, cat: string, plat: string): boolean {
  if (cat && s.category !== cat) return false;
  if (plat) {
    if (plat === "all") {
      // vendor-neutral: empty platforms OR platforms includes "any"
      if ((s.platforms?.length ?? 0) > 0) return false;
    } else {
      if (!(s.platforms ?? []).includes(plat)) return false;
    }
  }
  if (q) {
    // Search the localized blob too — so a Chinese query like
    // "浏览器" still finds browser-ml-in-js via its name_zh.
    if (!buildSearchBlob(s).includes(q)) return false;
  }
  return true;
}

function cardHtml(s: SkillIndexEntry, i: number, animate: boolean): string {
  const platChips = platformChipsHtml(s.platforms);
  const qualityChip = qualityChipHtml(s.quality);
  // The --i custom property drives the stagger animation defined
  // in style.css. Inline style is the only way to set a custom
  // property from a string template without a CSS per-card rule.
  const name = pickZh(s, "name");
  const desc = pickZh(s, "description");
  const enterClass = animate ? " skill-card--enter" : "";
  return `
    <a class="skill-card${enterClass}" style="--cat-color: ${escAttr(categoryColor(s.category))}; --i: ${Math.min(i, 15)};" href="#/skill/${escAttr(s.slug)}">
      <div class="skill-card__head">
        <span class="skill-card__slug">${escHtml(s.slug)}${s.needs_review ? ` <span class="skill-card__review-dot" title="${escAttr(t("reviewDot.title"))}" aria-label="${escAttr(t("reviewDot.title"))}"></span>` : ""}</span>
        <span class="skill-card__name">${escHtml(name)}</span>
      </div>
      <p class="skill-card__desc">${escHtml(desc)}</p>
      <div class="skill-card__meta">
        <span>${escHtml(categoryLabel(s.category))}</span>
        ${platChips}
        ${qualityChip}
        <span>${(s.tags ?? []).slice(0, 4).map(escHtml).join(" · ")}</span>
      </div>
    </a>
  `;
}
