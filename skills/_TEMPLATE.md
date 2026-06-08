---
slug: my-skill
title: My Skill
title_zh: 我的技能
summary: One sentence — what it does, for whom.
summary_zh: 一句话 — 干什么、为谁。
tags: [tag1, tag2, tag3]
category: official-cookbooks
version: 0.1.0
author: your-github-handle
license: MIT
created: 2026-06-08
updated: 2026-06-08
---

# When to use

Describe the situation that calls for this skill. Be specific.
"Given a long PDF and an audience, produce a 5-bullet executive
summary" is better than "for PDF summarization."

# Inputs

| Field | Type | Required | Notes |
|---|---|---|---|
| `pdf_path` | path | yes | local path to the PDF, ≤ 50 pages |
| `audience` | enum | no | one of: `engineer`, `pm`, `exec` (default: `pm`) |
| `length` | int | no | target bullet count, 3-10 (default: 5) |

# Output

The model returns Markdown with exactly `length` bullets under
`## Summary`, in the requested `audience` voice, then a one-line
`## Tags:` line.

Don't deviate from this structure — downstream code parses it.

# Prompt

```prompt
You are a senior analyst writing for the requested audience.
Read the PDF at the given path and produce a summary.

Voice: adapt register and vocabulary to the audience.
- engineer: precise, technical, uses domain terms
- pm: outcomes-first, no jargon, quantifies where possible
- exec: 1-2 sentences per bullet, decisions and risks only

Length: produce exactly the requested number of bullets.

Process:
1. Read the PDF cover, abstract, intro, conclusion, and any
   tables/figures.
2. Identify the 1-3 findings the audience needs to act on.
3. Distill to the requested number of bullets.
4. Order by importance, not by appearance in the document.

Output format:
## Summary
1. <bullet>
2. <bullet>
…

## Tags
comma, separated, keywords
```

# Example

**Input:**

```
pdf_path: ./q2-roadmap.pdf
audience: exec
length: 4
```

**Output:**

```markdown
## Summary
1. Q2 ships the federated-search rewrite (3× faster, half the
   cluster cost) and deprecates the v1 search API.
2. Hiring lag is the biggest risk: 2 of 4 open roles are still
   unfilled at the half.
3. The board asked about Anthropic vs. OpenAI as a vendor — we
   plan to stay multi-vendor with Bedrock as the primary.
4. ARR is tracking 8% above plan, mostly from the new enterprise
   tier.

## Tags
search, hiring, vendor, arr
```
