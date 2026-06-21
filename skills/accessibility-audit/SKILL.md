---
slug: accessibility-audit
name: Accessibility Audit
name_zh: 可访问性审计
version: 0.1.0
description: Audit a UI or component for accessibility issues and fixes.
description_zh: 审计 UI 或组件的可访问性问题并给出修复方案。
category: dev-tools
tags: ['a11y', 'accessibility', 'wcag', 'frontend']
inputs:
  - name: ui_description
    type: string
    required: true
    description: Description or markup of the UI
  - name: wcag_level
    type: enum
    required: false
    description: Target WCAG conformance level
    values: ["A", "AA", "AAA"]
    default: AA
output:
  format: markdown
  description: Accessibility findings mapped to WCAG criteria with fix examples.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Before shipping a new UI, reviewing a component library, or responding to an a11y bug.

# Inputs

Describe the UI and target WCAG level.

# Output

Findings mapped to WCAG criteria with severity and example fixes.

# Prompt

```prompt
Audit the described UI for accessibility against the target WCAG level.

Check:
1. Keyboard navigation: tab order, focus indicators, trap avoidance
2. Screen readers: labels, headings, landmarks, live regions
3. Color: contrast ratios, not color-only information
4. Motion: reduced-motion support, no auto-playing content
5. Forms: labels, error association, required field indication
6. Touch/target sizes for mobile

Output:

## Findings
- **[Severity] WCAG X.X.X**: issue + fix example

## Manual Tests
List 3-5 manual checks a human should perform.

## Tools
Suggest automated tools appropriate for the UI stack.

```

# When NOT to use

- Backend-only services with no user interface
- Internal admin tools with a known narrow user base and separate audit process
- PDFs or documents where the audit scope is document remediation, not UI

# Example

**Input:**

```
ui_description: 'A modal dialog with a form, opened by a button. The close button is an icon only.'
wcag_level: AA
```

**Output:**

```markdown
## Findings
- **[HIGH] WCAG 4.1.2**: icon-only close button lacks accessible name. Fix: `aria-label="Close"`.
- **[MED] WCAG 2.4.3**: focus should move to the modal heading on open.
- **[MED] WCAG 2.4.7**: ensure visible focus ring on all interactive elements.
```
