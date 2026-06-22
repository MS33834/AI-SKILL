---
slug: dependency-update
name: Dependency Update
version: 0.1.0
description: Plan and execute a low-risk dependency update for a project.
category: dev-tools
tags: ['dependencies', 'upgrade', 'security', 'semver']
inputs:
  - name: package_manager
    type: string
    required: true
    description: npm, pip, cargo, etc.
  - name: dependencies
    type: string
    required: true
    description: List of packages to update with current and target versions
output:
  format: markdown
  description: Step-by-step update plan with rollback instructions.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Before bumping major versions, applying security patches, or refreshing stale lock files.

# Inputs

Provide the package manager and the dependency list with current/target versions.

# Output

A plan covering grouping order, test strategy, breaking-change checks, and rollback steps.

# Prompt

```prompt
You are a dependency-maintenance engineer. Produce a safe update plan.

Inputs:
- Package manager and its lockfile
- Dependencies to update with current and target versions

Output sections:
1. Grouping strategy: which updates to batch vs isolate
2. Pre-flight checks: changelog review, deprecation scan, CVE lookup
3. Update commands: exact CLI steps for the package manager
4. Validation: tests to run, smoke checks, canary rollout
5. Breaking-change remediation: common patterns to watch for
6. Rollback: how to revert the lockfile and code changes

Use concrete commands. Do not invent changelogs; tell the user where to find them.

```

# When NOT to use

- Libraries where consumers pin the dependency and you only control devDeps
- Emergency patches that should go through the team's incident process instead
- Monorepos with unpublished internal packages — coordinate with those owners first

# Example

**Input:**

```
package_manager: npm
dependencies: 'eslint 8.x -> 9.x, vite 5.x -> 6.x'
```

**Output:**

```markdown
## Grouping
- Isolate eslint 9 migration (config format changed).
- Batch vite with related plugins after eslint is green.

## Pre-flight
1. Read eslint 9 migration guide and vite 6 changelog.
2. Run `npm audit` and note direct CVEs.

## Commands
```bash
npm install eslint@9 --save-dev
npx @eslint/migrate-config .eslintrc.js
```
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Major version bumps without reading changelog**: Skipping changelog review means missing breaking changes that will fail silently.
  - how to detect: tests fail after dependency update in production
  - how to fix: always read changelog and migration guide before major version bumps

- **Lockfile conflicts in monorepos**: Updating dependencies in one package breaks the shared lockfile for others.
  - how to detect: CI fails with lockfile conflicts, different packages get different versions
  - how to fix: use workspace-aware update commands, test all affected packages

- **Transitive dependency CVEs ignored**: Updating a direct dependency doesn't fix CVEs in transitive dependencies.
  - how to detect: security scan still reports CVEs after update
  - how to fix: use `npm audit` and check transitive dependency tree, update where possible or use overrides

- **Update grouping causes cascade failures**: Updating multiple packages at once makes it impossible to identify which one broke.
  - how to detect: after update, multiple tests fail with no clear cause
  - how to fix: update packages one at a time or in small groups, validate between each

- **DevDeps promoted to dependencies**: Updating a dev-only dependency and saving it as a regular dependency bloats production builds.
  - how to detect: production bundle size increases unexpectedly
  - how to fix: use `--save-dev` for development-only dependencies
