---
slug: logging-best-practices
name: Logging Best Practices
version: 0.1.0
description: Define a structured logging convention for a service or library.
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

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Logging sensitive data**: Accidentally logging passwords, tokens, or PII.
  - how to detect: security audit finds sensitive data in logs
  - how to fix: use redaction rules, scan logs before production

- **Log level confusion**: Using ERROR for expected cases or DEBUG for critical path.
  - how to detect: logs are either too noisy or missing important events
  - how to fix: document level definitions clearly, review logs in staging

- **No trace ID propagation**: Logs from the same request have different IDs across services.
  - how to detect: tracing a request across services is impossible
  - how to fix: propagate trace_id through all services, use correlation IDs

- **String interpolation in logs**: `log.info("user " + user.name)` creates string even when level is disabled.
  - how to detect: high CPU usage from log statement evaluation
  - how to fix: use lazy evaluation or parameterized logging

- **Logging in hot paths without sampling**: Every request logs, creating performance issues.
  - how to detect: latency spikes correlate with logging volume
  - how to fix: sample debug logs, use counters instead of detailed logs for high-frequency events
