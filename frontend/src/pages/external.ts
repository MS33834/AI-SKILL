// External-repos page: a curated, searchable index of 928+ AI agent
// skill repositories. Users can:
//   - Search by name / vendor / tag / description
//   - Switch between 4 grouping views: Domain / Vendor Type / Category / Stars
//   - Filter by vendor type (big-corp / popular-community / community / indie)
//   - Click through to the source repo
//
// Data lives in frontend/public/external-repos.json, synced from
// external-index/skills.yaml by scripts/sync-external-index.py.

import { t, getLocale } from "../i18n";
import { escHtml, escAttr, stableHue, debounce, categoryLabel } from "../shared";

interface ExternalRepo {
  slug: string;
  title: string;
  title_zh: string;
  vendor: string;
  repo: string;
  url: string;
  category: string;
  domain: string;
  vendor_type: string;
  tags: string[];
  skills: string[];
  summary_en: string;
  summary_zh: string;
  stars: number;
  star_tier: string;
  license: string;
  archived: boolean;
  pushed_at: string;
  subgroup: string;
}

interface IndexData {
  repos: ExternalRepo[];
  domains: Record<string, { en: string; zh: string }>;
  vendor_types: Record<string, { en: string; zh: string }>;
  total: number;
}

type ViewMode = "domain" | "vendor" | "category" | "stars";

let cache: IndexData | null = null;

async function loadRepos(): Promise<IndexData> {
  if (cache) return cache;
  const r = await fetch(`${import.meta.env.BASE_URL}external-repos.json`);
  if (!r.ok) throw new Error(`fetch external-repos.json: ${r.status}`);
  cache = (await r.json()) as IndexData;
  return cache;
}

function getHashParams(): URLSearchParams {
  const hash = window.location.hash;
  const qIdx = hash.indexOf("?");
  return qIdx > -1 ? new URLSearchParams(hash.slice(qIdx + 1)) : new URLSearchParams();
}

function updateHashParams(params: URLSearchParams): void {
  const baseHash = "#/external";
  const qs = params.toString();
  const u = new URL(window.location.href);
  u.hash = qs ? `${baseHash}?${qs}` : baseHash;
  history.replaceState(null, "", u.toString());
}

export async function renderExternal(root: HTMLElement): Promise<void> {
  document.title = `${t("external.title")} — AI-SKILL`;
  const zh = getLocale() === "zh";

  // Read persisted filter state from the *hash* query string so a
  // reload or a language switch keeps the user's context. We keep
  // external state in the hash (e.g. #/external?q=rag&view=stars)
  // so it stays with the external route instead of colliding with
  // the list page's search-param filters.
  const hashParams = getHashParams();
  const initialQ = hashParams.get("q") ?? "";
  const initialVt = hashParams.get("vendor") ?? "";
  const initialView = (hashParams.get("view") ?? "domain") as ViewMode;

  root.innerHTML = `
    <div class="container-wide">
      <h1 class="external__title">${escHtml(t("external.title"))}</h1>
      <p class="external__subtitle">${escHtml(t("external.subtitle", { n: "928" }))}</p>

      <div class="ext-toolbar">
        <input type="search" id="ext-search" value="${escAttr(initialQ)}" placeholder="${escAttr(t("external.search.ph"))}" aria-label="${escAttr(t("external.search.ph"))}" />
        <div class="ext-views" role="tablist">
          <button class="ext-view-btn" data-view="domain" role="tab" aria-selected="true">${escHtml(t("external.view.domain"))}</button>
          <button class="ext-view-btn" data-view="vendor" role="tab">${escHtml(t("external.view.vendor"))}</button>
          <button class="ext-view-btn" data-view="category" role="tab">${escHtml(t("external.view.category"))}</button>
          <button class="ext-view-btn" data-view="stars" role="tab">${escHtml(t("external.view.stars"))}</button>
        </div>
        <select id="ext-vendor-filter" aria-label="${escAttr(t("external.filter.vendor"))}">
          <option value="">${escHtml(t("external.filter.all"))}</option>
        </select>
      </div>

      <div id="ext-stats" class="ext-stats"></div>
      <div id="ext-list" class="external-list" aria-busy="true">
        <div class="ext-loading" role="status" aria-live="polite">${escHtml(t("loading"))}</div>
      </div>
      <p class="external__hint">${escHtml(t("external.hint"))}</p>
    </div>
  `;

  const list = root.querySelector<HTMLDivElement>("#ext-list")!;
  const statsEl = root.querySelector<HTMLDivElement>("#ext-stats")!;
  const searchInput = root.querySelector<HTMLInputElement>("#ext-search")!;
  const vendorFilter = root.querySelector<HTMLSelectElement>("#ext-vendor-filter")!;
  const viewBtns = root.querySelectorAll<HTMLButtonElement>(".ext-view-btn");

  let currentView: ViewMode = initialView;
  // Sync the active tab with the URL state
  viewBtns.forEach(btn => {
    const active = btn.dataset.view === currentView;
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  try {
    const data = await loadRepos();
    list.removeAttribute("aria-busy");

    // Populate vendor filter
    const vtLabels = data.vendor_types;
    for (const [key, label] of Object.entries(vtLabels)) {
      const o = document.createElement("option");
      o.value = key;
      o.textContent = zh ? label.zh : label.en;
      if (key === initialVt) o.selected = true;
      vendorFilter.appendChild(o);
    }

    function paint(pushUrl = true) {
      const q = searchInput.value.trim().toLowerCase();
      const vt = vendorFilter.value;
      let filtered = data.repos;
      if (vt) filtered = filtered.filter(r => r.vendor_type === vt);
      if (q) {
        filtered = filtered.filter(r => {
          // Search across localized title/summary, tags, category,
          // and the vendor/repo/url identifiers — plus the per-repo
          // skills list so users can find a specific capability
          // and learn which repo provides it.
          const blob = [
            r.slug, r.title, r.title_zh, r.category,
            ...(r.tags ?? []), r.summary_en, r.summary_zh,
            ...(r.skills ?? []), r.vendor, r.repo, r.url,
          ].join(" ").toLowerCase();
          return blob.includes(q);
        });
      }

      if (pushUrl) {
        const p = new URLSearchParams();
        const rawQ = searchInput.value.trim();
        if (rawQ) p.set("q", rawQ);
        if (vt) p.set("vendor", vt);
        if (currentView !== "domain") p.set("view", currentView);
        updateHashParams(p);
      }

      statsEl.innerHTML = `<span>${escHtml(t("external.results", { n: filtered.length }))}</span>`;
      if (filtered.length === 0) {
        list.innerHTML = `<div class="empty">${escHtml(t("external.empty"))}</div>`;
        return;
      }
      list.innerHTML = groupAndRender(filtered, currentView, data, zh);
    }

    searchInput.addEventListener("input", debounce(() => paint(), 120));
    vendorFilter.addEventListener("change", () => paint());
    viewBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        viewBtns.forEach(b => { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        currentView = btn.dataset.view as ViewMode;
        paint();
      });
    });

    paint(false);
  } catch (e) {
    list.removeAttribute("aria-busy");
    list.innerHTML = `<div class="empty" role="alert">${escHtml(t("external.errorLoad"))} <code>${escHtml(String(e))}</code></div>`;
    if (import.meta.env.DEV) console.error(e);
  }
}

function groupAndRender(
  repos: ExternalRepo[],
  view: ViewMode,
  data: IndexData,
  zh: boolean,
): string {
  // Group repos by the selected view dimension
  const groups = new Map<string, ExternalRepo[]>();
  for (const r of repos) {
    let key: string;
    if (view === "domain") key = r.domain;
    else if (view === "vendor") key = r.vendor_type;
    else if (view === "category") key = r.category;
    else key = r.star_tier; // stars
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }

  // Sort groups: domain/vendor/category alphabetically, stars by tier order
  let sortedKeys: string[];
  if (view === "stars") {
    const tierOrder = ["100k+", "50k+", "10k+", "1k+", "<1k", "none"];
    sortedKeys = tierOrder.filter(k => groups.has(k));
  } else {
    sortedKeys = Array.from(groups.keys()).sort();
  }

  return sortedKeys.map(key => {
    const list = groups.get(key)!;
    // Resolve group label
    let label: string;
    if (view === "domain") {
      const d = data.domains[key];
      label = d ? (zh ? d.zh : d.en) : key;
    } else if (view === "vendor") {
      const v = data.vendor_types[key];
      label = v ? (zh ? v.zh : v.en) : key;
    } else if (view === "stars") {
      label = `★ ${key}`;
    } else if (view === "category") {
      // Use the localized category label from shared.ts instead of
      // raw slug formatting, so Chinese users see 中文分类名.
      label = categoryLabel(key);
    } else {
      label = key.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }
    return `
      <section class="ext-group">
        <header class="ext-group__head">
          <h2 class="ext-group__title">${escHtml(label)}</h2>
          <span class="ext-group__count">${escHtml(t("external.results", { n: list.length }))}</span>
        </header>
        <div class="ext-cards">
          ${list.map(r => cardHtml(r, zh)).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function cardHtml(r: ExternalRepo, zh: boolean): string {
  const desc = zh ? (r.summary_zh || r.summary_en) : r.summary_en;
  const title = zh ? (r.title_zh || r.title) : r.title;
  const hue = stableHue(r.vendor);
  const tags = r.tags.slice(0, 5).map(tg =>
    `<span class="external-card__tag">#${escHtml(tg)}</span>`
  ).join("");
  const starsFmt = r.stars >= 1000 ? `${(r.stars / 1000).toFixed(1)}k` : String(r.stars);
  // Skill-level index: list the concrete capabilities the repo
  // provides so users can find a specific skill and know which
  // repo to open. Cap at 8 to keep cards scannable.
  const skillsList = (r.skills ?? []).slice(0, 8).map(sk =>
    `<li class="external-card__skill">${escHtml(sk)}</li>`
  ).join("");
  const skillsBlock = skillsList
    ? `<ul class="external-card__skills" aria-label="${escAttr(t("external.skills"))}">${skillsList}</ul>`
    : "";
  return `
    <article class="external-card" style="--vendor-hue: ${hue};">
      <header class="external-card__head">
        <div class="external-card__vendor-row">
          <span class="external-card__vendor">${escHtml(r.vendor)}</span>
          <span class="external-card__repo">${escHtml(r.repo)}</span>
        </div>
        <a class="external-card__link" href="${escAttr(r.url)}" rel="noopener noreferrer" target="_blank">
          ${escHtml(t("external.visit"))} ↗
        </a>
      </header>
      <h3 class="external-card__title">${escHtml(title)}</h3>
      <p class="external-card__desc">${escHtml(desc)}</p>
      ${skillsBlock}
      <dl class="external-card__meta">
        <div><dt>${escHtml(t("external.stars.label"))}</dt><dd>★ ${escHtml(starsFmt)}</dd></div>
        <div><dt>${escHtml(t("external.license"))}</dt><dd>${escHtml(r.license || "—")}</dd></div>
        <div><dt>${escHtml(t("external.category"))}</dt><dd>${escHtml(categoryLabel(r.category))}</dd></div>
        ${r.archived ? `<div><dt></dt><dd><span class="ext-archived">${escHtml(t("external.archived"))}</span></dd></div>` : ""}
      </dl>
      <div class="external-card__tags">${tags}</div>
    </article>
  `;
}
