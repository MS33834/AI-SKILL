> **注意**：本仓库以 GitHub（https://github.com/MS33834/AI-SKILL）为主仓，GitCode 为镜像。请确认此 PR 是提交到 GitHub 主仓的。

## What

<!-- One-paragraph description of the change. -->
<!-- If you are submitting a new local skill under skills/, say so plainly. -->

## Why

<!-- Motivation. Link any issue this PR fixes (Fixes #123). -->

## Checklist

Pick the section that matches your change. Delete the other one.

### Adding / changing an entry in `external-index/skills.yaml`

- [ ] `slug` is unique and kebab-case
- [ ] `source_url` returns 2xx
- [ ] `category` matches an existing category in the same file
- [ ] `summary` and `summary_zh` (if present) are each one line
- [ ] I did NOT manually add `stars` / `license` / `pushed_at` / `archived`
- [ ] I did **not** commit any secrets, tokens, or credentials

### Adding / changing a local skill under `skills/<slug>/SKILL.md`

- [ ] Frontmatter is complete (see `docs/schema.md`)
- [ ] `platforms:` is correct — multi-platform when the skill is generic, a specific platform when it depends on vendor features
- [ ] `needs_review: true` is set if you had to guess any field
- [ ] `source.url` and `source.commit` point at the upstream commit the file was taken from
- [ ] `validate-skill.py skills/<slug>/SKILL.md` exits 0
- [ ] I did **not** commit any secrets, tokens, or credentials
