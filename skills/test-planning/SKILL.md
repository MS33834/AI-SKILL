---
slug: test-planning
name: Test Planning
name_zh: 测试规划
version: 0.1.0
description: Design a test plan for a feature or release.
description_zh: 为功能或发布设计测试方案。
category: dev-tools
tags: ['testing', 'qa', 'plan', 'coverage']
inputs:
  - name: feature
    type: string
    required: true
    description: Feature or release under test
  - name: risks
    type: string
    required: false
    description: Known risks and edge cases
output:
  format: markdown
  description: Test plan with scope, levels, cases, and exit criteria.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Before a major release, introducing a critical path, or handing off to QA.

# Inputs

Describe the feature and any known risks or edge cases.

# Output

A test plan with scope, levels, cases, environments, and exit criteria.

# Prompt

```prompt
Design a test plan for the given feature.

Include:
1. Scope: in-scope and out-of-scope functionality
2. Test levels: unit, integration, contract, e2e, exploratory
3. Test cases: happy path, edge cases, negative cases, regression checks
4. Environments and data: prod-like fixtures, PII handling
5. Automation: what to automate vs manual
6. Exit criteria: coverage gates, bug severity thresholds, sign-off
7. Risks: top 3 testing risks and mitigations

Output in a format ready to paste into a ticket or test management tool.

```

# When NOT to use

- Spikes and prototypes that will not ship
- Pure refactorings with no behavior change — rely on existing tests
- Changes covered entirely by an established automated test matrix

# Example

**Input:**

```
feature: new subscription cancellation flow
risks: 'prorated refunds, third-party billing webhooks, idempotency'
```

**Output:**

```markdown
## Scope
In: user-initiated cancellation, prorated refund calculation, webhook retry.
Out: chargeback flow.

## Test Levels
- Unit: refund math, idempotency key handling
- Integration: billing service contract, database state transitions
- E2E: user cancels via UI and sees confirmation

## Exit Criteria
- 90% diff coverage on cancellation module
- Zero P0/P1 bugs open
- Webhook retry tested with simulated 5xx
```
