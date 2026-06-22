---
slug: data-migration-plan
name: Data Migration Plan
version: 0.2.0
description: Plan a safe data migration between schemas, formats, or systems.
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
updated: 2026-06-22
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

## SQL Migration Script Examples

### PostgreSQL Migration Example

```sql
-- ============================================
-- ============================================
BEGIN;

ALTER TABLE orders
  ADD COLUMN total_price_new NUMERIC(15, 2),
  ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' NOT NULL;

UPDATE orders SET total_price_new = total_price WHERE total_price IS NOT NULL;

ALTER TABLE orders
  ALTER COLUMN total_price_new SET NOT NULL;

COMMENT ON COLUMN orders.total_price_new IS 'Replaced total_price on 2026-07-01';
COMMENT ON COLUMN orders.currency IS 'ISO 4217 currency code, added on 2026-07-01';

COMMIT;

-- ============================================
-- ============================================
SELECT
  COUNT(*) as total_rows,
  COUNT(total_price) as old_not_null,
  COUNT(total_price_new) as new_not_null,
  SUM(total_price) as old_sum,
  SUM(total_price_new) as new_sum,
  SUM(total_price) - SUM(total_price_new) as diff
FROM orders;

SELECT id, total_price, total_price_new
FROM orders
WHERE total_price::numeric != total_price_new::numeric
LIMIT 10;

-- ============================================
-- ============================================
BEGIN;

CREATE TABLE orders_total_price_backup AS
SELECT id, total_price, current_timestamp as backed_up_at
FROM orders WHERE total_price IS NOT NULL;

ALTER TABLE orders RENAME COLUMN total_price TO total_price_old_20260622;
ALTER TABLE orders RENAME COLUMN total_price_new TO total_price;

-- ALTER TABLE orders DROP COLUMN total_price_old_20260622;

COMMIT;
```

### MySQL Migration Example

```sql
-- ============================================
-- ============================================
START TRANSACTION;

ALTER TABLE users
  ADD COLUMN preferences JSON DEFAULT NULL
  COMMENT 'User preferences, migrated on 2026-07-01',
  ALGORITHM=INPLACE, LOCK=NONE;

ALTER TABLE users
  ADD INDEX idx_created_at (created_at),
  ALGORITHM=INPLACE, LOCK=NONE;

UPDATE users
SET preferences = JSON_OBJECT('theme', 'light', 'notifications', true)
WHERE preferences IS NULL AND old_prefs IS NOT NULL;

COMMIT;

-- ============================================
-- ============================================
DELIMITER //

CREATE PROCEDURE migrate_user_preferences(
  IN batch_size INT,
  IN offset_val INT
)
BEGIN
  DECLARE rows_affected INT DEFAULT 0;

  START TRANSACTION;

  UPDATE users
  SET preferences = JSON_MERGE_PRESERVE(
    preferences,
    JSON_OBJECT('legacy', old_preferences)
  )
  WHERE id IN (
    SELECT id FROM (
      SELECT id FROM users
      WHERE old_preferences IS NOT NULL
        AND JSON_EXTRACT(preferences, '$.legacy') IS NULL
      ORDER BY id
      LIMIT batch_size
    ) AS tmp
  );

  SET rows_affected = ROW_COUNT();

  COMMIT;

  SELECT rows_affected;
END //

DELIMITER ;

CALL migrate_user_preferences(1000, 0);

-- ============================================
-- ============================================
START TRANSACTION;

SELECT
  COUNT(*) as total,
  COUNT(old_preferences) as remaining_old
FROM users;

ALTER TABLE users RENAME TO users_old;
ALTER TABLE users_new RENAME TO users;

COMMIT;
```



```sql
SELECT
  id,
  MD5(
    COALESCE(id::text, '') ||
    COALESCE(name, '') ||
    COALESCE(email, '') ||
    COALESCE(created_at::text, '')
  ) as row_checksum,
  *
FROM orders
ORDER BY id;

SELECT
  COUNT(*) as total_rows,
  COUNT(DISTINCT MD5(...)) as unique_checksums
FROM (
  SELECT MD5(...) as checksum FROM source_table
  MINUS
  SELECT MD5(...) as checksum FROM target_table
) diff;
```


```sql
SELECT MD5(GROUPING SORT(
  id::text || name || COALESCE(email, '')
)) as table_checksum
FROM users;

SELECT
  CRC32(GROUP_CONCAT(
    id, name, COALESCE(email, '')
    ORDER BY id SEPARATOR '|'
  )) as table_checksum
FROM users;
```


```sql
SELECT 'count' as check_type, 'orders' as table_name,
       (SELECT COUNT(*) FROM orders_v1) as v1_count,
       (SELECT COUNT(*) FROM orders_v2) as v2_count
UNION ALL
SELECT 'sum' as check_type, 'orders' as table_name,
       (SELECT SUM(total_price) FROM orders_v1) as v1_sum,
       (SELECT SUM(total_price) FROM orders_v2) as v2_sum
UNION ALL
SELECT 'null_count' as check_type, 'orders' as table_name,
       (SELECT COUNT(*) FROM orders_v1 WHERE total_price IS NULL) as v1_nulls,
       (SELECT COUNT(*) FROM orders_v2 WHERE total_price IS NULL) as v2_nulls;
```


```python
#!/usr/bin/env python3
import hashlib
import random

def compute_row_hash(row):
    values = [str(v) for v in row.values()]
    return hashlib.md5('|'.join(values).encode()).hexdigest()

def sample_compare(source_cursor, target_cursor, table, sample_rate=0.01):
    """
    """
    source_cursor.execute(f"SELECT COUNT(*) FROM {table}")
    total = source_cursor.fetchone()[0]

    sample_size = int(total * sample_rate)
    random_ids = random.sample(range(1, total + 1), sample_size)

    mismatches = []
    for row_id in random_ids:
        source_cursor.execute(f"SELECT * FROM {table}_v1 WHERE id = %s", [row_id])
        target_cursor.execute(f"SELECT * FROM {table}_v2 WHERE id = %s", [row_id])

        src = source_cursor.fetchone()
        tgt = target_cursor.fetchone()

        if compute_row_hash(src) != compute_row_hash(tgt):
            mismatches.append({'id': row_id, 'source': src, 'target': tgt})

    return {
        'sample_size': sample_size,
        'mismatches': mismatches,
        'match_rate': (sample_size - len(mismatches)) / sample_size
    }
```



|------|-----------|----------|----------|


```bash
#!/bin/bash
# rollback_migration.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/migration_rollback_${TIMESTAMP}.log"

log() {
    echo "[$(date)] $1" | tee -a "$LOG_FILE"
}

if [ -z "$MIGRATION_ID" ]; then
    log "ERROR: MIGRATION_ID not set"
    exit 1
fi

rollback_postgresql() {
    log "Starting PostgreSQL rollback for migration $MIGRATION_ID"

    psql -c "SELECT pg_switch_wal();" || true

    psql -c "SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE application_name = 'migration';"

    psql <<-EOSQL
        BEGIN;
        ALTER TABLE orders RENAME COLUMN total_price TO total_price_v2;
        ALTER TABLE orders RENAME COLUMN total_price_old TO total_price;
        ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'USD';
        COMMIT;
    EOSQL

    log "PostgreSQL rollback completed"
}

rollback_mysql() {
    log "Starting MySQL rollback for migration $MIGRATION_ID"

    mysql <<-EOSQL
        ALTER TABLE users
            DROP COLUMN preferences,
            ADD COLUMN old_preferences TEXT;

        ALTER TABLE users
            DROP INDEX idx_created_at,
            ALGORITHM=COPY, LOCK=SHARED;
    EOSQL

    log "MySQL rollback completed"
}

case "$DB_TYPE" in
    postgresql) rollback_postgresql ;;
    mysql) rollback_mysql ;;
    *) log "ERROR: Unknown DB_TYPE: $DB_TYPE" ;;
esac

log "Rollback process completed. Manual verification required."
```


```



```

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

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **No validation before cutover**: Migrating data without checksum validation risks silent data corruption.
  - how to detect: post-migration queries return different results than pre-migration
  - how to fix: run row count and checksum validation before switching traffic

- **Locks blocking production traffic**: Large batch updates without proper batching causes table locks.
  - how to detect: queries timeout, application reports deadlocks
  - how to fix: use small batch sizes (1000-5000 rows), add sleeps between batches

- **Dual-write inconsistency**: Writing to both old and new systems but with different transforms causes data drift.
  - how to detect: source and target data diverge over time
  - how to fix: use the same transformation logic for both writes, validate regularly

- **Rollback plan not tested**: Having a rollback plan but never testing it means it fails when you need it.
  - how to detect: rollback takes longer than expected when issues arise
  - how to fix: test rollback on staging before production migration

- **Migration breaks during incremental phase**: Incremental migration with no monitoring causes missed records.
  - how to detect: record counts don't match after migration completes
  - how to fix: monitor migration progress continuously, alert on stalls
