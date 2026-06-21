---
slug: logging-best-practices
name: Logging Best Practices
name_zh: 日志最佳实践
version: 0.1.0
description: Define a structured logging convention for a service or library.
description_zh: 为服务或库定义结构化日志规范。
category: dev-tools
tags: ['logging', 'observability', 'structured', 'debugging']
inputs:
  - name: runtime
    type: string
    required: true
    description: Language or framework
  - name: sensitive_fields
    type: array
    required: false
    description: Fields that must be redacted
output:
  format: markdown
  description: Log levels, field schema, redaction rules, and sample entries.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Bootstrapping observability, onboarding a new service, or standardizing logs across a team.

# Inputs

State the runtime and list any fields that must never appear in logs.

# Output

A convention doc with levels, required fields, redaction rules, and sample log lines.

# Prompt

```prompt
Create a structured logging convention for the given runtime.

Include:
1. Log levels and when to use each (DEBUG, INFO, WARN, ERROR)
2. Required base fields: timestamp (ISO8601), level, service, trace_id, span_id
3. Message style: sentence case, no interpolation, static keys
4. Redaction: how to handle the listed sensitive fields
5. Context propagation: request-scoped fields, thread-local / async context
6. Performance: when to sample, when to avoid logging in hot paths
7. Three sample log entries (INFO start, WARN degraded, ERROR failure)

Output format:

## Levels
...

## Base Schema
...

## Redaction
...

## Samples
...

Avoid vendor-specific logger syntax unless it is the runtime's de-facto standard.

```

# When NOT to use

- Client-side browser extensions where privacy law forbids logging
- Embedded devices with extreme storage constraints
- Teams already locked into a platform like Datadog Agent with auto-instrumentation

# Example

**Input:**

```
runtime: Go
sensitive_fields: [password, ssn, token, cvv]
```

**Output:**

```markdown
## Levels
- DEBUG: per-request details, sampled to 1% in production
- INFO: state changes and handoffs
- WARN: recoverable degradation
- ERROR: failed requests requiring human review

## Base Schema
`{time, level, msg, svc, trace_id, span_id, duration_ms}`

## Redaction
Mask values for keys matching `*password*`, `*token*`, `*ssn*`, `*cvv*`; replace with `[REDACTED]`.
```
