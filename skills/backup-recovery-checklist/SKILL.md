---
slug: backup-recovery-checklist
name: Backup Recovery Checklist
name_zh: 备份恢复清单
version: 0.1.0
description: Create a backup and recovery checklist for a datastore or service.
description_zh: 为数据存储或服务创建备份与恢复清单。
category: dev-tools
tags: ['backup', 'recovery', 'disaster-recovery', 'reliability']
inputs:
  - name: datastore
    type: string
    required: true
    description: Database, object store, or service
  - name: rto_rpo
    type: string
    required: false
    description: Recovery time and point objectives
output:
  format: markdown
  description: Backup strategy and step-by-step recovery runbook.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Productionizing a datastore, preparing for compliance, or before a disaster-recovery drill.

# Inputs

Describe the datastore and RTO/RPO targets.

# Output

A checklist covering backup schedule, retention, encryption, testing, and recovery steps.

# Prompt

```prompt
Create a backup and recovery checklist.

Output:
1. Backup scope: what to back up and what to exclude
2. Schedule and retention: frequency, lifecycle, off-site copies
3. Encryption and access control
4. Monitoring: verify backup success and freshness
5. Recovery runbook: step-by-step restore procedure
6. Testing schedule: how often to run a restore drill
7. Escalation: who to contact if restore fails

Do not include actual credentials or keys.

```

# When NOT to use

- Stateless services with no persistent data
- Data fully managed by a cloud provider with built-in point-in-time recovery
- Short-lived caches that can be rebuilt from source

# Example

**Input:**

```
datastore: PostgreSQL primary
rto_rpo: 'RTO 1h, RPO 15min'
```

**Output:**

```markdown
## Backup Schedule
- Continuous WAL archiving to object storage
- Full base backup nightly, retained for 30 days

## Recovery Runbook
1. Provision new instance from latest base backup.
2. Replay WAL to desired point in time.
3. Verify data checksums and run smoke queries.
4. Redirect application DNS/connection string.

## Testing
Run restore drill monthly in staging.
```
