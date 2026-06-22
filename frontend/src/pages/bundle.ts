// Bundle page: pick a subset of skills, download as one zip.
// v1 implementation: we already have the full Skill JSON
// cached for any skill the user has visited. For unvisited
// skills we fetch the .json on demand. The zip is built
// entirely client-side via JSZip — no backend.

import JSZip from "jszip";
import type { Skill, SkillIndex } from "../types";
import { t } from "../i18n";
import {
  categoryLabel,
  escHtml,
  escAttr,
  buildSearchBlob,
  debounce,
  triggerBlobDownload,
  skillToMarkdown,
  platformChipsHtml,
  qualityChipHtml,
} from "../shared";

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

export async function renderBundle(root: HTMLElement, index: SkillIndex): Promise<void> {
  root.innerHTML = `
    <div class="container-wide">
      <h2 class="bundle__title">${escHtml(t("bundle.title"))}</h2>
      <p class="meta-line">
        <span>${escHtml(t("bundle.intro"))}</span>
      </p>
      <div class="filter-bar">
        <input type="search" id="b-q" placeholder="${escAttr(t("bundle.filter.ph"))}" aria-label="${escAttr(t("bundle.filter.ph"))}" />
      </div>
      <ul class="bundle-list" id="b-list"></ul>
      <div class="bundle-actions">
        <button class="btn" id="b-select-all" type="button">${escHtml(t("bundle.selectAllVisible"))}</button>
        <button class="btn" id="b-clear" type="button">${escHtml(t("bundle.clear"))}</button>
        <span class="meta-line">
          <span>${escHtml(t("bundle.selected"))} <strong id="b-count" aria-live="polite" aria-atomic="true">0</strong></span>
        </span>
        <button class="btn btn--primary" id="b-download" type="button" disabled>${escHtml(t("bundle.download"))}</button>
      </div>
    </div>
  `;

  const listEl = root.querySelector<HTMLUListElement>("#b-list")!;
  const qInput = root.querySelector<HTMLInputElement>("#b-q")!;
  const countEl = root.querySelector<HTMLElement>("#b-count")!;
  const dlBtn = root.querySelector<HTMLButtonElement>("#b-download")!;
  const selAllBtn = root.querySelector<HTMLButtonElement>("#b-select-all")!;
  const clearBtn = root.querySelector<HTMLButtonElement>("#b-clear")!;

  // Make a slug safe to use inside an HTML id/for attribute.
  function legalId(slug: string): string {
    return slug.replace(/[^a-zA-Z0-9]/g, "-");
  }

  // Restore focus after a full list re-render.
  function restoreFocus(activeId: string | null) {
    if (!activeId) return;
    if (activeId === qInput.id) {
      qInput.focus();
      return;
    }
    const el = document.getElementById(activeId);
    if (el) el.focus();
  }

  // Build a checkbox list, preserving filter + checked state
  function paint() {
    const activeId = document.activeElement?.id ?? null;

    const q = qInput.value.trim().toLowerCase();
    const filtered = index.skills.filter((s) => {
      if (!q) return true;
      return buildSearchBlob(s).includes(q);
    });
    if (filtered.length === 0) {
      listEl.innerHTML = emptyStateHtml(t("empty.noResults"));
      restoreFocus(activeId);
      return;
    }
    // Snapshot which slugs are checked before re-rendering, so a
    // filter that hides then re-shows a row doesn't drop the
    // selection. (W4 from the prosecutor review.)
    const stillChecked = new Set(
      Array.from(listEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked")).map((c) => c.dataset.slug!)
    );
    listEl.innerHTML = filtered
      .map((s) => {
        const idSlug = legalId(s.slug);
        return `
      <li>
        <input type="checkbox" data-slug="${escAttr(s.slug)}" id="chk-${idSlug}"${stillChecked.has(s.slug) ? " checked" : ""} />
        <label for="chk-${idSlug}" class="bundle-list__slug">${escHtml(s.slug)}</label>
        <span class="bundle-list__cat">${escHtml(categoryLabel(s.category))}</span>
        <span class="bundle-list__chips">${platformChipsHtml(s.platforms)}${qualityChipHtml(s.quality)}</span>
        ${s.needs_review ? `<span class="skill-card__review-dot" title="${escAttr(t("reviewDot.title"))}"></span>` : ""}
      </li>
    `;
      })
      .join("");
    restoreFocus(activeId);
  }
  // Bind the change listener once on listEl — re-binding inside
  // paint() was leaking a handler per keystroke. (B1)
  listEl.addEventListener("change", () => updateCount());

  function updateCount() {
    const n = listEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked").length;
    countEl.textContent = String(n);
    dlBtn.toggleAttribute("disabled", n === 0);
  }

  qInput.addEventListener("input", debounce(paint, 80));
  selAllBtn.addEventListener("click", () => {
    listEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((c) => {
      c.checked = true;
    });
    updateCount();
  });
  clearBtn.addEventListener("click", () => {
    listEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((c) => {
      c.checked = false;
    });
    updateCount();
  });
  dlBtn.addEventListener("click", async () => {
    const slugs = Array.from(listEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]:checked"))
      .map((c) => c.dataset.slug!)
      .filter(Boolean);
    if (slugs.length === 0) return;
    const buildingLabel = t("bundle.building");
    const downloadLabel = t("bundle.download");
    dlBtn.textContent = buildingLabel;
    dlBtn.setAttribute("disabled", "true");
    try {
      const zip = new JSZip();
      const CONCURRENCY = 6;
      const results: { slug: string; md: string }[] = [];
      const failures: { slug: string; error: string }[] = [];

      for (let i = 0; i < slugs.length; i += CONCURRENCY) {
        const batch = slugs.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(
          batch.map(async (slug) => {
            try {
              const r = await fetch(`${import.meta.env.BASE_URL}skills/${encodeURIComponent(slug)}.json`);
              if (!r.ok) throw new Error(`fetch ${slug}: ${r.status}`);
              const s = (await r.json()) as Skill;
              return { ok: true as const, slug, md: skillToMarkdown(s) };
            } catch (e) {
              return { ok: false as const, slug, error: e instanceof Error ? e.message : String(e) };
            }
          })
        );
        for (const item of batchResults) {
          if (item.ok) {
            results.push({ slug: item.slug, md: item.md });
          } else {
            failures.push({ slug: item.slug, error: item.error });
            if (import.meta.env.DEV) {
              console.error(`Failed to download skill ${item.slug}: ${item.error}`);
            }
          }
        }
      }

      if (results.length === 0) {
        throw new Error(failures.map((f) => `${f.slug}: ${f.error}`).join("; "));
      }

      for (const { slug, md } of results) {
        zip.file(`${slug}/SKILL.md`, md);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      triggerBlobDownload(blob, `ai-skill-${results.length}-${stamp}.zip`);

      if (failures.length > 0) {
        const prevErr = listEl.parentElement?.querySelector(".bundle-error");
        if (prevErr) prevErr.remove();
        const failedSlugs = failures.map((f) => f.slug).join(", ");
        listEl.insertAdjacentHTML(
          "beforebegin",
          `<div class="error-state" role="alert"><span class="empty-state__title">${escHtml(t("bundle.partialFailed", { slugs: failedSlugs }))}</span></div>`
        );
        if (import.meta.env.DEV) {
          console.error("Bundle partial failures:", failures);
        }
      }
    } catch (e) {
      // Clear any previous error message before inserting a new one
      const prevErr = listEl.parentElement?.querySelector(".bundle-error");
      if (prevErr) prevErr.remove();
      // Render the error inline instead of using alert(); the
      // page already has the .empty shape, and alert() is blocked
      // in some embedded contexts. (W8)
      listEl.insertAdjacentHTML(
        "beforebegin",
        `<div class="error-state" role="alert"><span class="empty-state__title">${escHtml(t("error.loadFailed"))}</span> <code>${escHtml(e instanceof Error ? e.message : String(e))}</code></div>`
      );
      if (import.meta.env.DEV) {
        console.error(e);
      }
    } finally {
      dlBtn.textContent = downloadLabel;
      dlBtn.removeAttribute("disabled");
    }
  });

  paint();
  updateCount();
}
