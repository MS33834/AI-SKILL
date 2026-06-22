---
slug: database-index-review
name: Database Index Review
version: 0.1.0
description: Review a query or schema for missing, redundant, or misused indexes.
category: dev-tools
tags: ['database', 'index', 'performance', 'sql']
inputs:
  - name: query
    type: string
    required: true
    description: SQL query or schema snippet
  - name: dbms
    type: string
    required: true
    description: PostgreSQL, MySQL, etc.
output:
  format: markdown
  description: Index recommendations with rationale and trade-offs.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Slow query investigation, schema design review, or before adding an index.

# Inputs

Provide the query/schema and the database system.

# Output

Index recommendations with rationale, trade-offs, and example DDL.

# Prompt

```prompt
Review the query/schema for index opportunities.

For each recommendation:
1. Identify the access pattern
2. Recommend an index type (B-tree, partial, covering, composite)
3. Provide example DDL
4. Note trade-offs: write overhead, storage, lock impact
5. Flag redundant or unused indexes if visible

Also warn about common mistakes: indexing low-cardinality columns alone, over-indexing, ignoring sort order.

Output:

## Recommendations
...

## Trade-offs
...

```

# When NOT to use

- Ad-hoc analytics queries on read replicas where sequential scans are acceptable
- Tables with fewer than 1,000 rows where indexes add overhead without benefit
- NoSQL stores where the access model is fundamentally different

# Example

**Input:**

```
query: 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
dbms: PostgreSQL
```

**Output:**

```markdown
## Recommendations
Create a composite index:
```sql
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
```

## Trade-offs
Write overhead on inserts/updates to orders table; monitor index bloat monthly.
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Indexing low-cardinality columns alone**: Indexing a boolean or status column alone doesn't help queries because cardinality is too low.
  - how to detect: query plan shows sequential scan despite index existing
  - how to fix: create composite indexes that include high-cardinality columns

- **Over-indexing writes**: Too many indexes slow down inserts, updates, and deletes.
  - how to detect: write latency increased after adding indexes
  - how to fix: audit indexes quarterly, remove unused or redundant ones

- **Ignoring sort order in index**: Creating index `(a, b)` but querying `ORDER BY a DESC, b DESC` doesn't use the index efficiently.
  - how to detect: EXPLAIN shows filesort despite index existing
  - how to fix: match index column order and direction to query pattern

- **Partial index on wrong predicate**: Creating a partial index with a predicate that doesn't match actual query filters.
  - how to detect: index not used in query plan despite being relevant
  - how to fix: verify index predicate matches the most common WHERE clause

- **Not considering covering indexes**: Queries requiring additional columns cause index lookups to become expensive.
  - how to detect: query uses index but still takes too long
  - how to fix: include frequently accessed columns in the index (covering index)
