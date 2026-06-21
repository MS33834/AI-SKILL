---
slug: error-handling-guide
name: Error Handling Guide
name_zh: 错误处理指南
version: 0.1.0
description: Draft a language-agnostic error-handling strategy for a module or service.
description_zh: 为模块或服务起草一份与语言无关的错误处理策略。
category: dev-tools
tags: ['errors', 'exceptions', 'reliability', 'logging']
inputs:
  - name: language
    type: string
    required: true
    description: Primary language or runtime
  - name: component
    type: string
    required: true
    description: Service or module boundary
output:
  format: markdown
  description: Strategy covering taxonomy, retries, propagation, and observability.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

When building a new service, refactoring exception-heavy code, or defining retry/timeout policies.

# Inputs

Name the language/runtime and the component boundary (e.g., payment gateway, ingestion worker).

# Output

A strategy document with error taxonomy, retry rules, propagation patterns, and observability hooks.

# Prompt

```prompt
Draft an error-handling strategy for the given language and component.

Cover:
1. Error taxonomy: user input, transient infra, dependency, bug/programmer error
2. Exception vs result type: when to use each in the named language
3. Retry policy: which errors are retryable, backoff, idempotency keys
4. Propagation: what to expose to callers vs what to mask
5. Logging: required context fields, safe vs unsafe data
6. Metrics: counters and labels for alerting

Output:

## Error Taxonomy
...

## Retry Policy
...

## Caller Contract
...

## Observability
...

Be concrete: reference language idioms (e.g., Result<T,E>, try/catch, checked exceptions).

```

# When NOT to use

- Frontend-only UI validation logic where native form errors suffice
- One-off scripts without production traffic
- Teams that have already adopted a company-wide framework like Spring Boot or Temporal

# Example

**Input:**

```
language: Python
component: payment webhook processor
```

**Output:**

```markdown
## Error Taxonomy
- UserInputError: 4xx from merchant, do not retry
- TransientError: 5xx / timeout, retry with exponential backoff up to 3 times
- DependencyError: database lock, retry once after jitter

## Retry Policy
Use tenacity with `@retry(stop=stop_after_attempt(3), wait=wait_exponential_jitter(...))`. Mark idempotent endpoints only.

## Caller Contract
Return `{ ok: false, error_code, retryable }`. Never leak stack traces.
```
