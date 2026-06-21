---
slug: schema-evolution
name: Schema Evolution
name_zh: Schema 演进
version: 0.1.0
description: Plan a backward-compatible schema change for events or APIs.
description_zh: 为事件或 API 规划向后兼容的 schema 变更。
category: dev-tools
tags: ['schema', 'evolution', 'backward-compatibility', 'data']
inputs:
  - name: schema_context
    type: string
    required: true
    description: Events, API, database, etc.
  - name: change
    type: string
    required: true
    description: Proposed schema change
output:
  format: markdown
  description: Evolution plan with additive-only steps and consumer coordination.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Changing event schemas, API contracts, or database columns used by multiple consumers.

# Inputs

Describe the schema context and proposed change.

# Output

A backward-compatible evolution plan with steps and consumer coordination.

# Prompt

```prompt
Plan a backward-compatible schema evolution.

Output:
1. Current schema and proposed change
2. Compatibility analysis: additive vs breaking
3. Phased rollout: deploy producers first, then consumers
4. Default values and sentinels for optional fields
5. Deprecation: when to remove old fields
6. Consumer communication: schema registry, docs, code review

Avoid breaking changes unless all consumers are known and updated in one deploy.

```

# When NOT to use

- Internal data structures with a single consumer deployed together
- Prototypes where schema stability is not expected
- Cases requiring a breaking change with coordinated consumer migration — use a migration plan instead

# Example

**Input:**

```
schema_context: Kafka event schema
change: 'Add optional priority field, later make it required'
```

**Output:**

```markdown
## Compatibility
Adding `priority` as optional with default `normal` is backward-compatible.

## Phased Rollout
1. Update producer schema to include optional `priority`.
2. Update consumers to read `priority` with default fallback.
3. After all consumers are updated, make `priority` required.
4. Remove default fallback in consumers after 2 weeks.
```
