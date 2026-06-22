---
slug: documentation-structure
name: Documentation Structure
version: 0.1.0
description: Design a documentation outline for a project or feature.
category: documentation
tags: ['docs', 'structure', 'readme', 'onboarding']
inputs:
  - name: project_type
    type: string
    required: true
    description: Library, service, CLI, etc.
  - name: audiences
    type: array
    required: false
    description: e.g., users, contributors, operators
output:
  format: markdown
  description: A docs outline with page titles, purposes, and cross-links.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Starting a new project, reorganizing scattered docs, or preparing for open-source release.

# Inputs

Describe the project type and primary audiences.

# Output

A hierarchical docs outline with each page's goal and suggested cross-links.

# Prompt

```prompt
Design a documentation structure for the given project type and audiences.

Output:
1. Top-level sections (e.g., Getting Started, API Reference, Operations)
2. Each page title and one-sentence purpose
3. Cross-links between pages
4. One README outline (the entry point)
5. Notes on what NOT to put in docs vs code comments

Keep the structure actionable. Avoid generic sections that do not serve the audiences.

```

# When NOT to use

- Internal one-pager experiments that will not be maintained
- Projects whose docs are auto-generated from code and require no narrative
- Cases where the team has already adopted a docs-as-code toolchain with mandatory templates

# Example

**Input:**

```
project_type: Python library
audiences: [users, contributors]
```

**Output:**

```markdown
## Docs Outline
- README: one-line pitch, install, quickstart, badges
- `docs/getting-started.md`: first 5 minutes
- `docs/api.md`: auto-generated from docstrings
- `docs/examples.md`: 3 end-to-end recipes
- `docs/contributing.md`: dev setup, test commands, release process

## Cross-links
README quickstart → examples → API reference
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Docs that contradict code**: Documentation that says one thing, code does another.
  - how to detect: users report confusion when code doesn't match docs
  - how to fix: docs are generated from code where possible, or enforced by CI

- **README that assumes expertise**: "See the docs" doesn't help when someone needs to get started.
  - how to detect: new users ask basic questions answered elsewhere in docs
  - how to fix: README should be self-contained for the 5-minute getting-started experience

- **Out-of-date examples**: Examples that worked last year no longer work.
  - how to detect: users report examples failing, issue tracker fills with "docs outdated"
  - how to fix: test examples in CI, mark stale sections clearly

- **No search or findability**: Users can't find the docs they need.
  - how to detect: users ask questions answered in docs but they couldn't find
  - how to fix: add search, cross-link related content, use consistent terminology

- **Documentation for imaginary users**: Writing docs for a hypothetical expert instead of actual users.
  - how to detect: docs are either too basic or too advanced for real users
  - how to fix: base docs structure on actual user feedback and support tickets
