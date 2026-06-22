---
slug: refactoring-strategy
name: Refactoring Strategy
version: 0.1.0
description: Plan a safe refactoring for a tangled module or legacy service.
category: dev-tools
tags: ['refactoring', 'legacy', 'strategy', 'testing']
inputs:
  - name: target
    type: string
    required: true
    description: Module or service to refactor
  - name: pain_points
    type: string
    required: true
    description: Current problems and risks
output:
  format: markdown
  description: Refactoring plan with sequencing, test strategy, and rollback points.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Before touching legacy code with no tests, extracting a service, or paying down tech debt.

# Inputs

Describe the target module and the pain points driving the refactor.

# Output

A phased refactoring plan with tests, sequencing, and rollback points.

# Prompt

```prompt
Create a safe refactoring plan.

Sections:
1. Goal: one sentence on what good looks like
2. Current State: risks, coupling, test coverage
3. Sequencing: smallest safe steps in order; each step should be shippable
4. Tests: characterization tests, contract tests, approval tests
5. Rollback: how to revert each step if things go wrong
6. Validation: metrics or behavior checks after each step
7. Common traps: big-bang rewrites, refactoring under active feature work

Keep steps concrete and small enough to review in a single PR.

```

# When NOT to use

- Code that is about to be deleted or replaced entirely
- Hotfixes where behavior must change immediately
- Modules with active regulatory audit freeze

# Example

**Input:**

```
target: order-service checkout module
pain_points: 'No tests, direct DB queries mixed with business logic, circular imports'
```

**Output:**

```markdown
## Goal
Separate persistence from business logic and add characterization tests.

## Sequencing
1. Add golden-master approval tests for existing responses.
2. Extract pure functions from checkout flow (no DB access).
3. Introduce repository layer behind an interface.
4. Move SQL into repository implementations.
5. Remove circular imports by inverting a dependency.
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Big-bang rewrite**: Replacing the entire module at once means no rollback option.
  - how to detect: refactoring PR touches hundreds of files with no intermediate state
  - how to fix: refactor incrementally, each step should be shippable

- **Refactoring under active feature work**: Making structural changes while adding features causes merge conflicts and bugs.
  - how to detect: PRs keep conflicting, bugs introduced in unrelated areas
  - how to fix: freeze feature work during refactoring, merge refactor first

- **No characterization tests**: Changing code without tests means no way to know if behavior changed.
  - how to detect: after refactor, users report unexpected behavior changes
  - how to fix: write characterization tests before making any changes

- **Assuming old code is wrong**: Legacy code often has workarounds for real edge cases.
  - how to detect: "simplified" code fails on edge cases that worked before
  - how to fix: investigate why code is complex before simplifying

- **Refactoring without stopping to fix tests**: Tests that were fragile become more fragile.
  - how to detect: tests pass but flakily, or test logic mirrors the messy code
  - how to fix: improve test quality as part of refactoring
