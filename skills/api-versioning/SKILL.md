---
slug: api-versioning
name: API Versioning
name_zh: API 版本控制
version: 0.1.0
description: Design a versioning and deprecation strategy for an API.
description_zh: 为 API 设计版本控制和弃用策略。
category: dev-tools
tags: ['api', 'versioning', 'backward-compatibility', 'design']
inputs:
  - name: api_type
    type: string
    required: true
    description: REST, GraphQL, gRPC, etc.
  - name: breaking_changes
    type: string
    required: false
    description: Known or anticipated breaking changes
output:
  format: markdown
  description: Versioning strategy with URL/header design and deprecation policy.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Launching a public API, planning a breaking change, or standardizing versioning.

# Inputs

Describe the API type and any breaking changes.

# Output

A versioning strategy with mechanism, deprecation policy, and migration guide outline.

# Prompt

```prompt
Design an API versioning strategy.

Cover:
1. Versioning mechanism: URL path, header, query param, or content negotiation
2. Version lifecycle: current, deprecated, sunset
3. Breaking-change policy: what counts as breaking
4. Deprecation communication: headers, docs, emails, SDK changelogs
5. Migration guide template
6. Exception handling: when to allow unversioned requests

Output in a format ready for an API design doc.

```

# When NOT to use

- Internal-only APIs where client and server are always deployed together
- GraphQL APIs that prefer schema evolution over versioning
-  APIs with a single client controlled by the same team and no public consumers

# Example

**Input:**

```
api_type: REST
breaking_changes: 'Removing enum values, changing field semantics'
```

**Output:**

```markdown
## Mechanism
URL path: `/v1/resources`, `/v2/resources`.

## Lifecycle
- Current: latest stable version
- Deprecated: 6-month notice, `Sunset` header in responses
- Sunset: returns 410 Gone with migration link

## Breaking Changes
Require a new major version: removing fields, changing types, removing enum values.
```
