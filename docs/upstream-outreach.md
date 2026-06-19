> **注意**：当前本地 skill 中很多 `source` 块只写了 `source:`，没有填写 `url` 和 `commit`。正式 outreach 前，建议先补齐这些字段。本文档先按 author 字段中出现的上游名称准备模板。

# Upstream Outreach Playbook

This document contains templates for thanking upstream projects and inviting them to link back to AI-SKILL.

## Why reach out

- Give credit publicly.
- Build trust so upstreams do not ask for takedown later.
- Invite upstream maintainers to review our generalized versions.
- Encourage upstreams to link back, which drives discovery traffic both ways.

## Distinct upstreams to contact

Based on the current `skills/` directory, the following upstream names appear in `author` fields:

| Upstream | Skills count | Example skill |
|---|---|---|
| Langfuse | 7 | `code-review`, `ownership-bus-factor` |
| OpenAI | 6 | `sql-query-helper`, `test-generator` |
| Anthropic | 3 | `promptfoo-redteam`, `skill-creator` |
| Confident AI (DeepEval) | 3 | `deepeval-eval-suite`, `deepeval-otel` |
| Promptfoo | 2 | `promptfoo-evals`, `promptfoo-redteam` |
| Hugging Face | 2 | `embedding-model-training`, `browser-ml-in-js` |
| ClickHouse Inc + Langfuse | 1 | `clickhouse-best-practices` |
| Letta | 1 | `cli-builder` |

> **Action before outreach**: Fill in `source.url` and `source.commit` for each ported skill. Right now many skills only say `source:` with no URL.

## Issue / email template

Use this as the body of a GitHub issue or a private email.

---

Subject: Thank you for the inspiration — AI-SKILL has generalized your workflow

Hi [upstream] team,

I'm badhope, the maintainer of [AI-SKILL](https://gitcode.com/badhope/AI-SKILL), an open-source, community-driven index of AI agent skill repositories.

We have generalized one (or more) of your workflows into a vendor-neutral `SKILL.md` that can be dropped into any agent that reads Markdown (Claude, Codex, Cursor, Continue, etc.):

- Our generalized skill: `[skill-slug]` → link to skill detail page
- Upstream source we based it on: `[your repo/path]`
- Attribution in our frontmatter: `[your project name] (downstream pack: badhope)`

We kept the core concept but removed SDK-specific calls and replaced proprietary paths with placeholders. We'd love for you to:

1. Review the generalized version and let us know if anything is misrepresented.
2. Consider linking back to AI-SKILL if you find it useful for your users.
3. Let us know if you prefer a different attribution or have concerns about the port.

Thanks for the great work.

— badhope
AI-SKILL maintainer

---

## Per-upstream notes

### Langfuse

- Skills: 7
- Suggested contact: GitHub issue on `langfuse/langfuse` or email if available
- Suggested linkback location: Your docs / cookbook page mentioning "community ports"

### OpenAI

- Skills: 6
- Suggested contact: GitHub issue on relevant `openai/` repo (e.g., `openai/cookbook`)
- Note: Many OpenAI examples are already permissively licensed; attribution is still important.

### Anthropic

- Skills: 3
- Suggested contact: GitHub issue on `anthropics/anthropic-cookbook` or relevant repo
- Note: Anthropic has explicit prompt library content; make sure our generalization does not conflict with their usage terms.

### Confident AI (DeepEval)

- Skills: 3
- Suggested contact: GitHub issue on `confident-ai/deepeval`

### Promptfoo

- Skills: 2
- Suggested contact: GitHub issue on `promptfoo/promptfoo`

### Hugging Face

- Skills: 2
- Suggested contact: Depends on the exact repo (e.g., `huggingface/cookbook`)

### ClickHouse Inc + Langfuse

- Skills: 1 (`clickhouse-best-practices`)
- Suggested contact: Both `ClickHouse/ClickHouse` and `langfuse/langfuse`

### Letta

- Skills: 1 (`cli-builder`)
- Suggested contact: GitHub issue on `letta-ai/letta`
