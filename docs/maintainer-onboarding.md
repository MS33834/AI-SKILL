# Maintainer Onboarding

Welcome. This document is for newly appointed AI-SKILL maintainers.

## Your first week

### 1. Read the core documents

- [README.md](../README.md) — project positioning and quick start
- [GOVERNANCE.md](../GOVERNANCE.md) — roles, decision flow, conflict resolution
- [CONTRIBUTING.md](../CONTRIBUTING.md) — how contributors should open PRs
- [docs/schema.md](../docs/schema.md) — local skill frontmatter schema
- [docs/generalization-checklist.md](../docs/generalization-checklist.md) — how to review ported skills
- [docs/licensing.md](../docs/licensing.md) — license rules

### 2. Run the project locally

```bash
# Python validation
pip install -r requirements-lock.txt
python scripts/validate-skill.py --strict
python scripts/check-links.py

# Frontend build
cd frontend
npm install
npm run typecheck
npm run build
```

### 3. Watch the repo

Subscribe to notifications for:

- New PRs in your area
- New issues with the `rfc` label
- CI failures on `main`

## Maintainer responsibilities by area

### Content / Curation

- Review local skill PRs (`skills/<slug>/SKILL.md`).
- Enforce the generalization checklist for upstream ports.
- Check that `source` attribution is complete and accurate.
- Verify the skill passes `validate-skill.py --strict`.

### Index

- Review `external-index/skills.yaml` additions.
- Run `check-links.py` before merging.
- Ensure `slug` is unique and `category` exists.

### Frontend

- Review TypeScript / HTML / CSS changes.
- Keep `npm run typecheck` and `npm run build` green.
- Watch for XSS risks in any string-to-HTML paths.

### Tooling / Ops

- Maintain `.github/workflows/`.
- Keep `requirements-lock.txt` up to date when Python deps change.
- Monitor scheduled link checks and sync jobs.

### Community

- Welcome new contributors.
- Triage issues and apply labels.
- Coordinate upstream outreach and release notes.

## Review checklist

For every PR in your area, confirm:

- [ ] PR scope is focused (one skill / one feature per PR).
- [ ] CI is green or the failure is unrelated and documented.
- [ ] No secrets, tokens, or large binaries committed.
- [ ] Licensing is clear (for ported skills).
- [ ] Author is responsive to review feedback.

## How to merge

- Use **squash merge** for single-scope PRs.
- Write a clear commit message explaining the "why".
- If the PR crosses areas, wait for a second maintainer's review.

## Getting help

- Ping the Project Lead for disputes or unclear decisions.
- Open a private issue for security or conduct concerns.
