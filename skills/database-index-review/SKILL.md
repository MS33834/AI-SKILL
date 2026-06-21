---
slug: database-index-review
name: Database Index Review
name_zh: 数据库索引评审
version: 0.1.0
description: Review a query or schema for missing, redundant, or misused indexes.
description_zh: 评审查询或 schema 中缺失、冗余或误用的索引。
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
