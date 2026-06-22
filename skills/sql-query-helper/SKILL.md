---
name: SQL Query Helper
description: Generate or optimize SQL queries based on dialect and scenario.
category: text-to-sql
tags:
- ai
- cli
- database
- documentation
- llm
source: null
license: MIT
author: badhope
version: 1.0.0
needs_review: false
slug: sql-query-helper
created: '2026-06-12'
updated: '2026-06-19'
inputs:
- name: question
  type: string
  required: true
  description: The question to answer with SQL
- name: schema
  type: string
  required: true
  description: Database schema (CREATE TABLE statements)
- name: dialect
  type: string
  required: false
  description: SQL dialect - postgres/mysql/auto (default auto)
output:
  format: markdown
  description: Generated content based on the user request
---
# When to use

The user has a database (or a documented schema) and a question. They want SQL, not a chat about SQL. They will execute the query themselves; you're not connected to a DB.

# Inputs

`question` is what they want to find out. `schema` is mandatory — without it, you're guessing. `dialect=auto` reads the schema's syntax hints (BIGSERIAL → postgres, AUTO_INCREMENT → mysql, etc.).

# Output

A code block with the query, prefixed by a one-line explanation of what it does. After the code block:

- A "Tables touched" line listing the FROM/JOIN tables
- A "Cost note" line if the query is likely to be slow (full table scan, missing index hint)

# Prompt

```prompt
You translate questions into SQL. You are NOT connected to a
database. You produce a query; the user runs it.

Workflow:
  1. Read the schema. Identify the table(s) that answer the
     question. If you can't, list the missing tables.
  2. Identify the columns needed. If the user said "recent" or
     "active", pick a reasonable column (created_at, last_login_at)
     and state your pick.
  3. Write the query. Use table aliases when there are > 2 tables.
  4. Sanity-check: would this run on a 10M-row table in < 5 seconds?
     If no, say so and suggest an index.
  5. Format: UPPERCASE keywords, lowercase identifiers, one clause
     per line.

Rules:
- Never invent table or column names. If the schema doesn't have
  what you need, say so.
- SELECT only. Never emit INSERT/UPDATE/DELETE/DROP unless the
  user explicitly asked. (Most "questions" are read-only.)
- No SELECT *. Always name the columns.
- Use COALESCE for nullable aggregates unless the user wants NULLs.
- Date math: prefer `>=` and `<` over DATE_TRUNC when possible —
  the latter is slower and often wrong on timezone boundaries.
- If dialect=auto and the syntax is dialect-specific, mention
  which dialect you assumed.
```

# When NOT to use

- The user wants a stored procedure, trigger, or migration. Different scope.
- The schema is wrong or incomplete. Ask for a fix; don't guess.
- The user is debugging a slow query. Use a different skill (EXPLAIN ANALYZE territory).
- The question is "design me a schema" — that's schema design, not query writing.
- The dialect is exotic (Redshift, ClickHouse, DuckDB) and the user didn't specify. Ask.

# Example

**Input:**

```yaml
question: "Top 10 customers by total spend in 2024"
schema: |
  CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
  CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    total_cents INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
dialect: postgres
```

**Output:**

```sql
-- Top 10 customers by total order value in 2024.
SELECT
    c.id,
    c.name,
    SUM(o.total_cents) / 100.0 AS total_spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2024-01-01'
  AND o.created_at <  '2025-01-01'
GROUP BY c.id, c.name
ORDER BY total_spend DESC
LIMIT 10;
```

**Tables touched:** `customers`, `orders`
**Cost note:** Full scan of `orders` for 2024. If the table is > 10M rows, add an index on `(customer_id, created_at)`.
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **SELECT * in production**: Retrieving all columns when only a few are needed.
  - how to detect: unnecessary data transfer, network latency
  - how to fix: always name specific columns needed

- **No schema provided**: Writing queries without understanding the actual schema.
  - how to detect: query references tables/columns that don't exist
  - how to fix: require schema as mandatory input

- **Missing index hints**: Queries that will be slow on large tables.
  - how to detect: query runs fine on small test data, slow in production
  - how to fix: add cost note and suggest index when full table scan detected

- **Dialect mismatch**: Writing PostgreSQL syntax for MySQL or vice versa.
  - how to detect: query fails when deployed to different database
  - how to fix: always specify dialect explicitly

- **No sanity check on 10M-row table**: Assuming query will be fast.
  - how to detect: query times out in production
  - how to fix: always run sanity check, warn if full table scan likely