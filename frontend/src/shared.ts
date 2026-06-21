// Shared utilities used across list, detail, and bundle pages.
// Kept in one place so the category labels, escape functions,
// and YAML dumper stay in sync.

import type { Skill, SkillIndexEntry } from "./types";
import { getLocale, t, pickPlatform } from "./i18n";

// ============================ brand mark ============================

/**
 * Inline SVG brand mark. Use currentColor so it inherits the parent
 * text color in both light and dark modes.
 */
export function brandMarkSvg(size = 16): string {
  return `<svg class="brand-mark" width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect width="16" height="16" rx="2" fill="currentColor"/></svg>`;
}

// ============================ inline icons ============================

/**
 * Small inline SVG icons. They inherit `currentColor` so they match the
 * surrounding text in both light and dark modes, and they are always
 * aria-hidden because the adjacent text already carries the meaning.
 */
const ICONS = {
  arrowLeft:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4l-4 4 4 4"/></svg>',
  arrowRight:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  externalLink:
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3H3v10h10V10M7 9l6-6M9 3h4v4"/></svg>',
} as const;

export type IconName = keyof typeof ICONS;

export function iconSvg(name: IconName, size = 16): string {
  return `<span class="icon" style="display:inline-flex;width:${size}px;height:${size}px;vertical-align:-0.15em;flex-shrink:0;" aria-hidden="true">${ICONS[name]}</span>`;
}

// ============================ category labels ============================

export const CATEGORY_LABELS: Record<string, { en: string; zh: string }> = {
  applications: { en: "Applications", zh: "应用" },
  "agent-frameworks": { en: "Agent frameworks", zh: "Agent 框架" },
  "audio-speech": { en: "Audio & speech", zh: "音频与语音" },
  "awesome-lists": { en: "Awesome lists", zh: "精选列表" },
  benchmarks: { en: "Benchmarks", zh: "基准测试" },
  "browser-automation": { en: "Browser automation", zh: "浏览器自动化" },
  "case-studies": { en: "Case studies", zh: "案例研究" },
  "chat-uikits": { en: "Chat UI kits", zh: "聊天 UI 套件" },
  "code-assistants": { en: "Code assistants", zh: "代码助手" },
  "code-llms": { en: "Code LLMs", zh: "代码大模型" },
  "computer-use": { en: "Computer use", zh: "计算机操作" },
  "customer-support": { en: "Customer support", zh: "客户支持" },
  "data-pipelines": { en: "Data pipelines", zh: "数据流水线" },
  "dev-tools": { en: "Developer tools", zh: "开发工具" },
  "distributed-training": { en: "Distributed training", zh: "分布式训练" },
  documentation: { en: "Documentation", zh: "文档" },
  education: { en: "Education", zh: "教育" },
  embeddings: { en: "Embeddings", zh: "向量嵌入" },
  evaluation: { en: "Evaluation", zh: "评估" },
  finance: { en: "Finance", zh: "金融" },
  "fine-tuning": { en: "Fine-tuning", zh: "微调" },
  "gpu-kernels": { en: "GPU kernels", zh: "GPU 内核" },
  guardrails: { en: "Guardrails & safety", zh: "护栏与安全" },
  "image-generation": { en: "Image generation", zh: "图像生成" },
  "knowledge-graphs": { en: "Knowledge graphs", zh: "知识图谱" },
  legal: { en: "Legal", zh: "法律" },
  "llm-serving": { en: "LLM serving", zh: "LLM 部署" },
  "mcp-protocol": { en: "MCP protocol", zh: "MCP 协议" },
  "medical-bio": { en: "Medical & bio", zh: "医疗与生物" },
  memory: { en: "Memory & context", zh: "记忆与上下文" },
  "model-merging": { en: "Model merging & MoE", zh: "模型合并与 MoE" },
  multimodal: { en: "Multimodal", zh: "多模态" },
  observability: { en: "Observability", zh: "可观测性" },
  "official-cookbooks": { en: "Official cookbooks", zh: "官方 Cookbook" },
  "privacy-federated": { en: "Privacy & federated", zh: "隐私与联邦学习" },
  "prompt-libraries": { en: "Prompt libraries", zh: "提示词库" },
  quantization: { en: "Quantization", zh: "量化与压缩" },
  "rag-retrieval": { en: "RAG & retrieval", zh: "RAG 与检索" },
  "reasoning-models": { en: "Reasoning models", zh: "推理模型" },
  "robotics-embodied": { en: "Robotics & embodied", zh: "机器人与具身" },
  "safety-alignment": { en: "Safety & alignment", zh: "安全与对齐" },
  "scientific-ml": { en: "Scientific ML", zh: "科学机器学习" },
  "synthetic-data": { en: "Synthetic data", zh: "合成数据" },
  "terminal-cli": { en: "Terminal & CLI", zh: "终端与 CLI" },
  "text-to-sql": { en: "Text-to-SQL", zh: "Text-to-SQL" },
  "tool-use": { en: "Tool use & function calling", zh: "工具使用与函数调用" },
  translation: { en: "Translation", zh: "翻译" },
  "vector-databases": { en: "Vector databases", zh: "向量数据库" },
  "video-generation": { en: "Video generation", zh: "视频生成" },
};

export function categoryLabel(cat: string): string {
  const m = CATEGORY_LABELS[cat];
  if (m) return getLocale() === "zh" ? m.zh : m.en;
  return cat.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

// ============================ HTML escaping ============================

export function escHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!
  );
}

export function escAttr(s: string): string {
  // Attribute values in this project are always quoted with double quotes.
  // We reuse HTML escapes plus normalize whitespace that can break
  // parsing when an attribute is written across multiple lines.
  return escHtml(s).replace(/\n/g, "&#10;").replace(/\r/g, "&#13;");
}

// ============================ YAML dumper ============================

export function dumpFrontmatter(s: Skill): string {
  const lines: string[] = ["---"];
  const set = (k: string, v: unknown, indent = 0) => {
    const pad = " ".repeat(indent);
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${pad}${k}: []`);
        return;
      }
      lines.push(`${pad}${k}:`);
      for (const x of v) {
        if (x !== null && typeof x === "object" && !Array.isArray(x)) {
          lines.push(`${pad}  -`);
          for (const [kk, vv] of Object.entries(x)) set(kk, vv, indent + 4);
        } else {
          lines.push(`${pad}  - ${formatScalar(x)}`);
        }
      }
      return;
    }
    if (typeof v === "object") {
      lines.push(`${pad}${k}:`);
      for (const [kk, vv] of Object.entries(v)) {
        if (vv === undefined) continue;
        set(kk, vv, indent + 2);
      }
      return;
    }
    lines.push(`${pad}${k}: ${formatScalar(v)}`);
  };
  set("slug", s.slug);
  set("name", s.name);
  set("name_zh", s.name_zh);
  set("version", s.version);
  set("description", s.description);
  set("description_zh", s.description_zh);
  set("category", s.category);
  set("tags", s.tags);
  set("platforms", s.platforms);
  set("inputs", s.inputs);
  set("output", s.output);
  set("author", s.author);
  set("license", s.license);
  set("created", s.created);
  set("updated", s.updated);
  set("needs_review", s.needs_review);
  return lines.join("\n") + "\n---\n";
}

function formatScalar(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

// ============================ shared utilities ============================

/** Stable string hash → hue (0-359). Used for category/vendor color chips. */
export function stableHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Category hue number for inline CSS custom properties. */
export function categoryHue(cat: string): number {
  return stableHue(cat);
}

/** Category color string for inline CSS. */
export function categoryColor(cat: string): string {
  return `hsl(${categoryHue(cat)} 60% 52%)`;
}

/** Build platform chips HTML for a skill card / detail page. */
export function platformChipsHtml(platforms: string[] | undefined): string {
  if (!platforms || platforms.length === 0) {
    return `<span class="chip chip--all" title="${escAttr(t("vendorNeutral"))}">${escHtml(t("anyChip"))}</span>`;
  }
  return platforms
    .map((p) => {
      const label = pickPlatform(p);
      return `<span class="chip chip--${escAttr(p)}" title="${escAttr(t("platform.tip", { p }))}">${escHtml(label)}</span>`;
    })
    .join(" ");
}

/** Build a quality chip. Stable skills don't get a chip (silent default). */
export function qualityChipHtml(quality: string | undefined): string {
  const q = quality || "stable";
  if (q === "stable") return "";
  const label = t(`quality.${q}` as Parameters<typeof t>[0]);
  return `<span class="chip chip--quality chip--quality-${escAttr(q)}" title="${escAttr(t("quality.tip", { q: label }))}">${escHtml(label)}</span>`;
}

/** Pre-compute a lowercased search blob for a skill entry. */
export function buildSearchBlob(s: SkillIndexEntry): string {
  return `${s.slug} ${s.name} ${s.name_zh ?? ""} ${(s.tags ?? []).join(" ")} ${s.category} ${s.description} ${s.description_zh ?? ""}`.toLowerCase();
}

/** Debounce a function call by `ms` milliseconds. */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let h: ReturnType<typeof setTimeout> | null = null;
  return (...args) => {
    if (h) clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
}

/** Trigger a browser download for a Blob, cleaning up the object URL. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Convert a Skill object back to SKILL.md text, preferring rawMarkdown. */
export function skillToMarkdown(s: Skill): string {
  if (s.rawMarkdown && s.rawMarkdown.length > 0) return s.rawMarkdown;
  return dumpFrontmatter(s) + "\n" + s.body;
}

/** Levenshtein edit distance between two strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure the shorter string is the column dimension to keep O(n*m) memory
  // bounded by the shorter side.
  const [s, t] = a.length < b.length ? [a, b] : [b, a];
  const m = s.length;
  const n = t.length;
  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  let curr = new Array(m + 1);

  for (let i = 1; i <= n; i++) {
    curr[0] = i;
    for (let j = 1; j <= m; j++) {
      const cost = t[i - 1] === s[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[m] ?? 0;
}

/**
 * Find the closest string in `candidates` to `query` using Levenshtein
 * distance. Returns `null` when the best match is worse than a per-length
 * threshold, so very different queries don't suggest nonsense.
 */
export function closestString(query: string, candidates: Iterable<string>): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  let best: string | null = null;
  let bestDist = Infinity;
  const seen = new Set<string>();

  for (const raw of candidates) {
    const c = raw.trim().toLowerCase();
    if (!c || c === q || seen.has(c)) continue;
    seen.add(c);
    const dist = levenshtein(q, c);
    if (dist < bestDist) {
      bestDist = dist;
      best = raw.trim();
    }
  }

  // Threshold: short queries must be nearly identical; longer queries can
  // tolerate a few edits. Cap at 4 to avoid wild suggestions.
  const threshold = q.length <= 3 ? 1 : q.length <= 6 ? 2 : q.length <= 10 ? 3 : 4;
  return best && bestDist <= threshold ? best : null;
}
