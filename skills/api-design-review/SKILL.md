---
slug: api-design-review
name: API Design Review
name_zh: API 设计评审
version: 0.1.0
description: Review an API design against consistency, versioning, auth, and error-handling best practices.
description_zh: 按一致性、版本控制、认证和错误处理最佳实践评审 API 设计。
category: dev-tools
tags: ['api', 'design', 'review', 'rest', 'graphql']
inputs:
  - name: api_spec
    type: string
    required: true
    description: OpenAPI spec, schema, or endpoint description
  - name: context
    type: string
    required: false
    description: Team conventions or existing API examples
output:
  format: markdown
  description: Review with severity-ranked findings and concrete recommendations.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Before publishing a new API, adding a breaking endpoint, or standardizing an existing surface.

# Inputs

Provide the API spec or endpoint list plus any team conventions the API should align with.

# Output

A markdown report: summary score, findings grouped by severity, and actionable recommendations with example rewrites.

# Prompt

```prompt
You are a senior API architect reviewing the provided API design.

Evaluate across these dimensions:
1. Consistency: naming, paths, HTTP methods, status codes, error shapes
2. Versioning: strategy (URL / header / deprecation), breaking-change handling
3. Authentication & authorization: scheme choice, scope granularity
4. Error handling: structured errors, status-code correctness, retry signals
5. Pagination & filtering: cursor vs offset, query param design
6. Documentation: example requests/responses, required vs optional fields

Output format:

## Score: X/10

## Findings
- **[Severity] Title**: explanation and recommended fix

## Recommendations
1. ...
2. ...

Keep findings specific; avoid generic advice like "use REST".

```

# When NOT to use

- Internal-only prototypes that will be thrown away next week
- APIs where the team has already frozen the contract and cannot change
- GraphQL-specific schema stitching questions — use a dedicated GraphQL skill

# Example

**Input:**

```
api_spec: 'GET /users/{id}/orders?limit=20&page=1 returns 200 or 404'
context: 'We use URL versioning and OAuth2 scopes'
```

**Output:**

```markdown
## Score: 6/10

## Findings
- **[MED] Pagination uses page/limit**: prefer cursor-based pagination for high-churn collections.
- **[HIGH] 404 for empty list**: returning 404 for no orders breaks client caching; return 200 with empty array.

## Recommendations
1. Replace `page` with `cursor` and return `next_cursor`.
2. Standardize error schema to `{ error, message, code, request_id }`.
```
