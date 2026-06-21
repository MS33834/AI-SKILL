---
slug: data-migration-plan
name: Data Migration Plan
name_zh: 数据迁移方案
version: 0.1.0
description: Plan a safe data migration between schemas, formats, or systems.
description_zh: 规划schema、格式或系统之间的安全数据迁移。
category: dev-tools
tags: ['migration', 'database', 'data', 'planning']
inputs:
  - name: source_target
    type: string
    required: true
    description: Source and target systems/schemas
  - name: volume
    type: string
    required: false
    description: Data volume and downtime tolerance
output:
  format: markdown
  description: Migration plan with phases, rollback, and validation.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Changing a database schema, moving to a new store, or merging datasets.

# Inputs

Describe source/target systems and data volume/downtime constraints.

# Output

A phased migration plan with rollback and validation steps.

# Prompt

```prompt
Create a data migration plan.

Sections:
1. Overview: source, target, volume, downtime tolerance
2. Migration strategy: big-bang vs incremental vs dual-write vs backfill
3. Phases: schema changes, code changes, data copy, verification, cutover
4. Validation: row counts, checksums, sample comparisons, query parity
5. Rollback: how to revert at each phase
6. Risk mitigation: locks, batch sizes, observability, communication plan

Keep it practical. Include example SQL or pseudo-code only if it clarifies the plan.

```

# When NOT to use

- Migrations handled by managed services with zero-downtime guarantees and their own runbooks
- Small config or metadata changes that do not move user data
- Data deletion requests governed by privacy policy rather than migration process

# Example

**Input:**

```
source_target: 'PostgreSQL orders table v1 -> v2 with denormalized total'
volume: '50M rows, downtime tolerance 5 minutes'
```

**Output:**

```markdown
## Strategy
Incremental backfill with dual-write: new writes go to both schemas, backfill in batches.

## Phases
1. Add v2 columns and triggers for dual-write.
2. Backfill existing rows in 100k-row batches during low traffic.
3. Validate row counts and checksums per batch.
4. Switch reads to v2, monitor for 24h.
5. Remove v1 columns in a follow-up deploy.
```
