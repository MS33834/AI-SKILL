---
slug: api-versioning
name: API Versioning
version: 0.2.0
description: Design a versioning and deprecation strategy for an API.
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
updated: 2026-06-22
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

## Migration Guide Template

```markdown
# API Migration Guide: v{N} → v{N+1}

## TL;DR
[一句简洁的迁移原因说明]

## Timeline
- **{date}**: v{N+1} 发布
- **{date}**: v{N} 进入 deprecated（收到 Sunset 头）
- **{date}**: v{N} 将返回 410 Gone

## What's Changed

### Breaking Changes
| 变更 | 旧写法 | 新写法 | 迁移代码 |
|------|--------|--------|----------|
| 字段重命名 | `name` | `full_name` | `obj.full_name = obj.name` |

### New Features
| 功能 | 说明 | 文档链接 |
|------|------|----------|
| Batch 操作 | 单请求处理多个资源 | [链接](#) |

## Step-by-Step Migration

### Step 1: Update SDK
```bash
pip install stripe==13.0.0
```

### Step 2: Update Code
```python
# Before
charge = stripe.Charge.create(amount=1000, currency='usd')

# After
charge = stripe.Charge.create(amount=1000, currency='usd', automatic_payment_methods={'enabled': true})
```

### Step 3: Test
```bash
stripe test --api-version 2024-01-01
```

## Need Help?
- [Migration Guide](#)
- [Support](#)
- [Status Page](#)
```

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

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Breaking changes without version bump**: Removing fields, changing types, or removing enum values without a new version breaks existing clients.
  - how to detect: clients report failures after a deployment with no version change
  - how to fix: follow semver strictly; any breaking change requires new major version

- **No deprecation headers**: Clients continue using old versions indefinitely without `Sunset`, `Deprecation`, or `Link` headers.
  - how to detect: traffic analytics show clients still on old versions months after deprecation
  - how to fix: add standard deprecation headers and communicate through multiple channels

- **URL versioning but no migration path**: Putting version in URL (`/v1/`) without a clear deprecation policy leaves clients stranded.
  - how to detect: clients report being stuck on old version with no upgrade path documented
  - how to fix: publish migration guides and set explicit sunset dates

- **Header versioning with wrong cache semantics**: Using header-based versioning but not setting `Vary: Accept` causes cached responses to be served to wrong versions.
  - how to detect: clients receive responses for wrong API version
  - how to fix: always set `Vary: Accept` header when using content negotiation versioning
