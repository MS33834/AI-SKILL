# AI-SKILL

A working index of agent skills — repos, cookbooks, MCP servers,
production case studies. The stuff you'd actually want when building
with LLMs.

Not a library. Not a tutorial site. Just a single YAML file with
900+ curated `source_url` pointers, sorted into 49 categories.
You read it, you click through, you use the upstream project. That
is the whole loop.

[English](./README.md) · [简体中文](./README.zh.md)

## Why this exists

The agent ecosystem has thousands of good repos scattered across
GitHub, arXiv, and the corporate research blogs. Searching GitHub
directly returns noise. The existing awesome-lists are usually
abandoned or vendor-driven.

This repo is one hand-curated YAML file. The value is in the
picking: every entry has a `source_url` that resolves, a one-line
`summary` / `summary_zh`, and a `category` from a closed set of 49.
You can grep it, vendor it, render it, or clone it as a starting
point for your own list.

## What's in the box

- **`catalog/skills.yaml`** — the index. 900+ entries across 49
  categories, bilingual (en + zh). One entry per upstream repo.
- **`catalog/own_skills.yaml`** — an empty placeholder for skills
  we author and host in this repo. See `skills/` for the format.
- **`skills/`** — drop-in folder for our own skills (frontmatter +
  Markdown). Empty by design; fill it when you have something.

We don't host, mirror, or repackage anyone else's work. The catalog
points; the upstream delivers.

## The 49 categories

The full list lives in `catalog/skills.yaml` under `categories:`.
A sample so you know the shape:

| # | Category | What goes here |
|---:|---|---|
| 01 | Official Cookbooks | Vendor pattern books (Anthropic, OpenAI, Google, …) |
| 03 | Agent Frameworks | LangChain, AutoGen, CrewAI, smolagents, … |
| 04 | RAG & Retrieval | Vector stores, retrievers, chunkers, embedding pipelines |
| 10 | MCP Protocol | Model Context Protocol servers, clients, gateways |
| 22 | Synthetic Data | Self-instruct, evol-instruct, distillation |
| 35 | Reasoning Models | Chain-of-thought, o1-style, self-consistency |
| 49 | Case Studies | Production post-mortems, industry reports |

New entries fit into an existing category. New categories need a
reason — open an issue first if you think one is missing.

## Entry schema

Each record under the top-level `skills:` list in
`catalog/skills.yaml`:

```yaml
- slug: anthropic-cookbook            # unique id, kebab-case
  title: Claude Cookbook              # display name (en)
  title_zh: Claude Cookbook           # display name (zh)
  source: anthropics/anthropic-cookbook         # owner/repo on GitHub
  source_url: https://github.com/anthropics/anthropic-cookbook
  category: official-cookbooks        # one of the 49 slugs above
  subgroup: us-frontier-labs          # optional, for finer grouping
  tags:                               # 2-5 lowercase tags
    - claude
    - anthropic
    - official
    - notebook
  summary: Anthropic's official notebook collection for Claude — tool use, PDF, structured output.
  summary_zh: Anthropic 官方 notebook 合集：工具调用、PDF 理解、结构化输出。
  stars: 22000                        # refreshed daily by sync-github
  license: MIT                        # SPDX id, refreshed daily
  pushed_at: 2026-06-04               # last commit on upstream
  added: 2026-06-04                   # when we added it to the index
  archived: false                     # true if upstream went read-only
```

`source` and `source_url` are the pointers; the rest is metadata.
The `added` date is when the entry landed in the index — don't
conflate it with file modification time.

For non-GitHub sources (e.g. arXiv papers, blog postmortems in the
case-studies category), the `source` field can be a domain like
`arxiv.org` and the `source_url` the actual paper URL. The
sync-github script skips those entries automatically.

## Using the catalog

The repository is the catalog. There is no docs site, no Pages
build, no API. The data is the product.

Programmatic read:

```python
import yaml
with open("catalog/skills.yaml") as f:
    data = yaml.safe_load(f)
entry = next(s for s in data["skills"] if s["slug"] == "langchain")
print(entry["source_url"])
```

Grep-style read with [`yq`](https://github.com/mikefarah/yq):

```bash
# All RAG-related entries, slug + url
yq '.skills[] | select(.category == "rag-retrieval")
    | [.slug, .source_url] | @tsv' catalog/skills.yaml

# All entries from a single org
yq '.skills[] | select(.source | startswith("openai/"))
    | .slug' catalog/skills.yaml

# Categories with their entry counts
yq '.skills | group_by(.category) | .[]
    | {cat: .[0].category, n: length}' catalog/skills.yaml
```

## Extending the catalog

**Adding an external skill** is one PR, one file edit:

1. Fork the repo.
2. Append a new entry under `skills:` in `catalog/skills.yaml`
   using the schema above.
3. Constraints: `slug` unique, `source_url` resolves (2xx, not 404),
   `summary` and `summary_zh` each one line, `category` from the
   closed set of 49.
4. Open a PR. The link-check workflow pings your `source_url`.
   After merge, the sync workflow will backfill `stars` / `license`
   / `pushed_at` within a day.

**Publishing your own skill** on the in-repo shelf:

1. Copy `skills/_TEMPLATE.md` to `skills/<your-slug>.md`.
2. Add a row to `catalog/own_skills.yaml` with at least a `path`
   field pointing back to your file.
3. Open a PR.

No review queue, no formal process. If the entry is right and the
link works, it lands.

## The two helper scripts

Both are in `scripts/`. Stdlib-only except for `pyyaml` and
`ruamel.yaml`. Both work locally and in CI.

### `scripts/sync-github.py`

Refreshes `stars`, `license`, `pushed_at`, and `archived` for every
GitHub-hosted entry via the GitHub API. Runs daily at 06:00 UTC,
opens a PR with the diff.

```bash
pip install ruamel.yaml
GITHUB_TOKEN=ghp_xxx python scripts/sync-github.py --dry-run   # preview
GITHUB_TOKEN=ghp_xxx python scripts/sync-github.py             # apply
```

Without a token you get 60 req/h (sequential, ~15 h for 900
entries). With a token you get 5,000/h and 12 concurrent workers
(~3 minutes).

### `scripts/check-links.py`

Pings every `source_url`, classifies the result, and writes the
summary to `data/health.json`. Runs weekly on Mondays at 04:00 UTC.
Fails the workflow on any 4xx/5xx/timeout, so dead links are loud.

```bash
pip install pyyaml
python scripts/check-links.py            # prints summary
python scripts/check-links.py --fail     # exit 1 on any broken link
```

If a link breaks (repo moved, went private, the URL is malformed),
the script says so and the workflow fails. You fix the URL in the
next PR and the next Monday's run goes green again.

## When this isn't the right tool

- You want a deep technical comparison of two frameworks. We don't
  benchmark; we point you to the upstream.
- You need real-time star counts. We refresh daily; for live
  numbers go to GitHub.
- You're looking for tutorials. We link to the repos that contain
  them.

## License

MIT — see [LICENSE](LICENSE). The catalog *index* is MIT-licensed.
Each linked skill keeps its upstream license.
