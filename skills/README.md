# skills/

Drop-in folder for skills we author and publish in this repo —
**not** the ones we link to from the catalog. The catalog points at
upstream projects; this folder is our own work.

Currently empty. When ready, a skill lives here as a single `.md`
file: YAML frontmatter (metadata) + a Markdown body (the prompt,
inputs/outputs, and a worked example).

The on-repo skills are indexed in `catalog/own_skills.yaml` so the
catalog can find them. Two files per skill, one PR.

## Adding a skill

1. Copy `skills/_TEMPLATE.md` to `skills/<your-slug>.md`.
   Slug is kebab-case, lowercased, no spaces — e.g.
   `url-summarizer`, `pdf-extractor-v2`.
2. Add a row to `catalog/own_skills.yaml` with at least a `path`
   field pointing back to your file (e.g. `path:
   skills/url-summarizer.md`). The other fields follow the same
   schema as catalog/skills.yaml.
3. Open a PR. The link-check and CI workflows will run; sync
   doesn't touch own_skills (it only refreshes external GitHub
   metadata).

That's it. No review queue, no formal sign-off.

## Layout of a skill

A skill's `.md` body is just Markdown. The convention is four
sections:

1. **When to use** — one paragraph describing the situation that
   calls for this skill. Be specific. "When you have a research
   paper and need a 5-bullet summary" is better than "for
   summarization."
2. **Inputs** — a table of fields the user (or upstream code) must
   supply. Type, whether it's required, any constraints.
3. **Output** — describe the shape the model should return. If the
   model must produce a fixed structure, list it here and reference
   the prompt body that enforces it.
4. **Prompt** — the actual prompt, in a fenced `prompt` code block.
   Inside the prompt use Markdown headings (`## Section A`) to
   structure the model's response.

Plus a worked **Example** at the bottom showing the full input →
output flow. Real, complete examples. Don't truncate.

## Frontmatter

| Field | Required | Notes |
|---|---|---|
| `slug` | yes | kebab-case, unique across `skills/` |
| `title` | yes | short, sentence case |
| `title_zh` | no | Chinese title |
| `summary` | yes | one sentence — what it does, for whom |
| `summary_zh` | no | Chinese summary, one sentence |
| `tags` | yes | 2-5 lowercase tags |
| `category` | yes | one of the 49 slugs in `catalog/skills.yaml` |
| `version` | yes | semver, e.g. `0.1.0` |
| `author` | yes | GitHub handle, or `Name <email>` |
| `license` | yes | typically `MIT` |
| `created` | yes | `YYYY-MM-DD` |
| `updated` | yes | `YYYY-MM-DD` |

## Why frontmatter + Markdown

- Frontmatter is machine-readable: a future script can render
  these as a static site, generate a README index, or push them to
  a prompt registry. Don't put the prompt body in frontmatter.
- Markdown is portable. Renders correctly on GitHub, in
  `grip`-previewed locally, and in any tool that does
  `markdown → HTML` or `markdown → plain text`. Don't lock the
  prompt inside a JSON file.
- One file per skill. No nested folders, no shared "prompts/"
  directory. The convention is enforceable with a single grep:
  `find skills -name '*.md' ! -name '_*'`.

## Versioning

- Bump `version` on the frontmatter (semver) every time the body
  changes meaningfully — i.e. the prompt produces different output.
- Cosmetic prose changes don't need a version bump; do update
  `updated` though.
- Breaking changes (different input/output shape) deserve a
  major version bump and a note in the PR description.
