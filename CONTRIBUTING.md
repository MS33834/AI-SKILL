# Contributing

AI-SKILL is dual-track:

1. **Local Vault** — `skills/<slug>/SKILL.md`: ready-to-use skills.
2. **External Index** — `external-index/skills.yaml`: discovery links to upstream repositories.

See also [`GOVERNANCE.md`](../GOVERNANCE.md) for roles, decision flow, and maintainer criteria.

## Adding a local skill

```bash
cp skills/_TEMPLATE.md skills/<your-slug>/SKILL.md
# edit it
python scripts/validate-skill.py skills/<your-slug>/SKILL.md
```

If the file is from upstream:

- Fill in the `source` block (URL, commit SHA, license). See `SOURCE.md`.
- Follow [`docs/generalization-checklist.md`](../docs/generalization-checklist.md) to remove platform-specific assumptions.

If you had to guess any frontmatter field, set `needs_review: true`
and explain in the PR body what you guessed. Don't silently ship a guess.

## Adding an external link

Append to `external-index/skills.yaml`. Its current schema
(`summary` / `summary_zh`) is the only schema for that file — the
local skill vault (`skills/`) uses a different schema (`description`
/ `description_zh` per `docs/schema.md`), and we don't plan to
migrate one to the other. Keeping them apart avoids re-writing
the sync workflow.

Rules:

- `slug` is unique and kebab-case
- `source_url` returns 2xx
- `category` matches an existing entry in the same file
- Don't add `stars` / `license` / `pushed_at` / `archived` — the sync
  workflow fills those

## Reporting a dead link

Open an issue, use the **Dead link** template. Slug + broken URL +
a sentence of context (renamed? moved? private?).

## Suggesting a new category

Open an issue first. Most entries fit an existing one. New category
needs a reason.

## PR hygiene

- **One skill per PR.** Easier to review, easier to revert.
- **Squash merge.**
- **Don't** commit secrets, tokens, generated bundles, large
  binaries, or somebody else's code without a license.
- Wait for CI green. `validate-skill.py` should exit 0 before you
  commit; run `check-links.py` if you changed `external-index/skills.yaml`.

## Becoming a maintainer

We want more area owners. If you care about one of these areas, start by
reviewing PRs in that area and open a discussion:

- **Content** — review `skills/` PRs, enforce generalization and schema rules
- **Index** — review `external-index/` PRs, keep link checks green
- **Frontend** — UI/UX, performance, accessibility
- **Tooling / Ops** — CI, validation scripts, data sync
- **Community** — onboarding, upstream relations, release notes

See `GOVERNANCE.md` for the formal appointment process.

## License

By contributing, you agree your contribution is licensed under
MIT, the same as the rest of the project. See [LICENSE](./LICENSE).
