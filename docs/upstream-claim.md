# Upstream Author Claim & Removal

This page explains how upstream repository owners and maintainers can interact
with the AI-SKILL index.

## What AI-SKILL does

AI-SKILL maintains a searchable index of publicly available AI-skill
repositories. We do **not** redistribute upstream code unless the repository's
license explicitly allows it. Each index entry links directly back to the
upstream source URL and displays the upstream license.

## Your options as an upstream author

1. **Claim the entry** — we add a `verified: true` flag and, if you like, a
   public author note.
2. **Update metadata** — title, description, category, tags, or skills list.
3. **Request removal** — we remove the entry from `external-index/skills.yaml`.
4. **Report inaccuracies** — license mismatch, dead link, wrong category, etc.

## How to request a change

Open an issue using the
[**Upstream author claim / removal**](../.github/ISSUE_TEMPLATE/upstream-claim.yml)
template. For claims, please provide proof that you are a maintainer, such as:

- A link to your public profile on the upstream org
- A reference in the repo's `CODEOWNERS`, `MAINTAINERS`, or contributor list
- A trivial PR opened from the upstream repo confirming ownership

We aim to respond within 3 business days.

## First outreach targets

The maintainers plan to reach out to the following 10 repositories first. The
goal is to invite them to claim their entries and, if they are interested,
collaborate on better metadata.

| # | Repository | Why invite? | Invitation link |
|---|------------|-------------|-----------------|
| 1 | [anthropics/skills](https://github.com/anthropics/skills) | Pioneer in curated agent skills; widely referenced | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+anthropics%2Fskills) |
| 2 | [openai/skills](https://github.com/openai/skills) | Official Codex / agent skill examples | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+openai%2Fskills) |
| 3 | [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | Major agent-framework ecosystem | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+langchain-ai%2Flangchain) |
| 4 | [chroma-core/chroma](https://github.com/chroma-core/chroma) | Leading open-source vector database | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+chroma-core%2Fchroma) |
| 5 | [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | Active LLM evals & red-teaming community | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+promptfoo%2Fpromptfoo) |
| 6 | [confident-ai/deepeval](https://github.com/confident-ai/deepeval) | Popular LLM evaluation framework | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+confident-ai%2Fdeepeval) |
| 7 | [langfuse/langfuse](https://github.com/langfuse/langfuse) | OSS LLM observability platform | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+langfuse%2Flangfuse) |
| 8 | [huggingface/skills](https://github.com/huggingface/skills) | Large ML community with skill/prompt assets | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+huggingface%2Fskills) |
| 9 | [letta-ai/skills](https://github.com/letta-ai/skills) | Agent memory & skills ecosystem | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+letta-ai%2Fskills) |
| 10 | [paul-gauthier/aider](https://github.com/paul-gauthier/aider) | Widely used AI coding assistant | [open issue](../issues/new?template=upstream-claim.yml&title=%5Bupstream%5D+paul-gauthier%2Faider) |

## Sample invitation message

Use this as the body of the issue or PR you open in the upstream repo:

```markdown
Hi there,

[AI-SKILL](https://github.com/MS33834/AI-SKILL) is a community-driven index of
AI-skill repositories. We list `REPO_NAME` in our external index because it
contains useful prompts, skills, or examples for agent builders.

We would like to invite you to **claim** the entry so visitors can see that
the metadata is verified by the upstream maintainer. You can:

- Claim or update the entry: `https://github.com/MS33834/AI-SKILL/issues/new?template=upstream-claim.yml`
- Request removal if you prefer not to be listed
- Suggest better tags, category, or a list of concrete skills the repo provides

Thanks for maintaining great open-source AI tooling!
```

## Maintainer response checklist

When an upstream claim issue comes in:

1. Verify the author is a public maintainer of the repo.
2. Apply the requested change in `external-index/skills.yaml` or remove the
   entry.
3. Run `python scripts/validate-external-index.py` and
   `python scripts/sync-external-index.py`.
4. Open a PR with the change and link the upstream issue.
5. Close the upstream issue once the PR is merged.

## Legal note

We index only public GitHub repositories. If an upstream author requests
removal, we remove the entry promptly. We do not copy upstream code into the
index; the index stores only metadata and a link.
