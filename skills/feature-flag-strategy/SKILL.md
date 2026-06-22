---
slug: feature-flag-strategy
name: Feature Flag Strategy
version: 0.1.0
description: Design a feature-flag rollout strategy for a new feature.
category: dev-tools
tags: ['feature-flags', 'release', 'testing', 'rollback']
inputs:
  - name: feature
    type: string
    required: true
    description: Feature to roll out
  - name: audiences
    type: string
    required: false
    description: Target audiences or segments
output:
  format: markdown
  description: Rollout plan with flag taxonomy, stages, and cleanup.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Shipping a risky feature, doing a canary release, or enabling gradual rollout.

# Inputs

Describe the feature and target audiences.

# Output

A flag strategy with taxonomy, rollout stages, and cleanup checklist.

# Prompt

```prompt
Design a feature-flag rollout strategy.

Output:
1. Flag taxonomy: release flag, experiment flag, ops flag, kill switch
2. Rollout stages: dev, internal, beta, percentage, general availability
3. Targeting rules: user segments, regions, subscription tiers
4. Metrics: success criteria and guardrail metrics
5. Rollback: kill-switch procedure and rollback criteria
6. Cleanup: when to remove the flag and associated dead code
7. Naming convention for the flag

Avoid vendor-specific SDK syntax unless necessary.

```

# When NOT to use

- Static configuration that never changes at runtime
- Features that must be globally on or off with no middle state
- Teams without a flag-management service or database-backed config

# Example

**Input:**

```
feature: new checkout page
audiences: 'internal employees, 5% beta users, all users'
```

**Output:**

```markdown
## Flag Taxonomy
`checkout_v2` is a release flag; `checkout_v2_experiment` is an experiment flag.

## Stages
1. Dev: flag on for team only
2. Internal: employees for 1 week
3. Beta: 5% of users, watch conversion and error rate
4. GA: 100% rollout

## Cleanup
Remove flag and old checkout code 2 weeks after GA.
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Flag never cleaned up**: Feature flags accumulate and create technical debt.
  - how to detect: dozens of old flags still in code, no one knows what they do
  - how to fix: set a cleanup date when creating the flag, automate removal

- **Flag name collisions**: Same flag name used in different services means they interfere with each other.
  - how to detect: changing flag in one service affects another
  - how to fix: use namespaced flag names like `checkout_v2_enabled`

- **Kill switch too slow**: Rollback via flag takes too long under load.
  - how to detect: incident escalates while waiting for flag change to propagate
  - how to fix: have circuit breakers that auto-trigger, test kill switch latency

- **Targeting rules too complex**: Flag rules so complicated that it's unclear who has the feature.
  - how to detect: unexpected users get the feature, or expected users don't
  - how to fix: keep targeting simple, document rules clearly

- **Flag checked on hot path**: Reading flag on every request without caching causes latency spikes.
  - how to detect: p99 latency increases when flag is toggled
  - how to fix: cache flag values, refresh on intervals not on every request
