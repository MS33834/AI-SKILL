# AI-SKILL Governance

This document describes how the AI-SKILL project is governed. It exists so that contributors know who decides what, how to get a skill accepted, and how to resolve disagreements.

## Project model

AI-SKILL uses a **Project Lead + transparent process** model:

- `badhope` is the current Project Lead.
- Day-to-day decisions are delegated to maintainers listed below.
- All rules, criteria, and major decisions are written down in this repo.
- If the Project Lead becomes inactive, the most senior maintainer steps up as interim lead and opens a public discussion about long-term succession within 30 days.

## Roles

### Project Lead

- Has final say on architecture, scope, and disputes.
- Appoints and removes maintainers.
- Publishes release notes and project direction updates.
- Ensures the project stays aligned with its mission.

Current Project Lead: **badhope**.

### Maintainers

Maintainers review PRs, enforce standards, and can merge changes.

| Area              | Responsibilities                                                                    | Status |
| ----------------- | ----------------------------------------------------------------------------------- | ------ |
| **Content**       | Review `skills/` PRs, enforce vendor-neutrality and schema rules                    | vacant |
| **Index / Data**  | Review `external-index/skills.yaml` additions, run link checks, keep metadata fresh | vacant |
| **Frontend**      | Review UI changes, keep build and typecheck green                                   | vacant |
| **Design / UX**   | Own the design system, responsive layout, motion, empty states, brand assets        | vacant |
| **Tooling / Ops** | Maintain CI, validation scripts, and data sync workflows                            | vacant |
| **Security / QA** | Maintain security scan rules, test coverage, and broken-link monitoring             | vacant |
| **Community**     | Onboard contributors, manage upstream relations, publish updates                    | vacant |

To become a maintainer, a contributor must:

1. Have at least 3 merged PRs that meaningfully improve the project (docs, skills, code, or ops).
2. Demonstrate good judgment in reviews and discussions.
3. Be proposed by an existing maintainer or the Project Lead.
4. Be approved by the Project Lead.

A maintainer can step down at any time by opening an issue. A maintainer may be removed by the Project Lead for repeated violations of the [Code of Conduct](CODE_OF_CONDUCT.md) or for prolonged inactivity (≥6 months).

### Contributors

Anyone who opens an issue or PR is a contributor. Contributors are listed in release notes and, over time, in per-skill attribution.

## Decision flow

| Topic                  | How it is decided                                          | Typical timeline |
| ---------------------- | ---------------------------------------------------------- | ---------------- |
| New local skill        | PR → CI green → area maintainer review → merge             | 1–7 days         |
| New external repo      | PR → link check green → index maintainer review → merge    | 1–3 days         |
| New skill category     | Open an RFC issue first; discuss for ≥7 days; BDFL decides | ≥7 days          |
| Schema change          | Open an RFC issue; discuss for ≥14 days; BDFL decides      | ≥14 days         |
| Major direction change | Written proposal + community discussion; BDFL decides      | Case by case     |
| Maintainer appointment | Maintainer nomination → BDFL approval                      | Case by case     |

## Contribution criteria

### Local skills (`skills/`)

A local skill must:

1. Pass `python scripts/validate-skill.py --strict`.
2. Be useful to more than one team or project.
3. Follow the [generalization checklist](docs/generalization-checklist.md) if it is ported from an upstream repo.
4. Be licensed under MIT, or the upstream license must allow redistribution under MIT.
5. Include a clear `When NOT to use` section.

### External repos (`external-index/skills.yaml`)

An external repo entry must:

1. Have a reachable `source_url`.
2. Provide concrete agent skills (SKILL.md files, skills folder, or equivalent).
3. Use an existing category; new categories require an RFC issue.
4. Not duplicate an existing entry.

## Conflict resolution

1. Disagreements on PR reviews are discussed in the PR thread.
2. If consensus is not reached, the relevant area maintainer makes a call.
3. If the dispute crosses areas or involves project scope, the Project Lead decides.
4. For conduct issues, see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Transparency commitments

- All rules live in this repo, not in private chats.
- All skill submissions are reviewed in public PRs.
- All major decisions are recorded in issue comments or release notes.
- CI results are public.

## Security and responsible disclosure

If you discover a security issue (e.g., XSS in skill rendering, malicious external link, leaked credential):

1. Do not open a public issue.
2. Email the Project Lead directly (or use GitCode private message if email is unavailable).
3. Allow reasonable time for a fix before public disclosure.

## License

By contributing, you agree your contributions are licensed under the same MIT license as the project.
