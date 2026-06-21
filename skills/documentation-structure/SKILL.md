---
slug: documentation-structure
name: Documentation Structure
name_zh: 文档结构
version: 0.1.0
description: Design a documentation outline for a project or feature.
description_zh: 为项目或功能设计文档大纲。
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
