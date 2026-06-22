---
slug: error-handling-guide
name: Error Handling Guide
version: 0.1.0
description: Draft a language-agnostic error-handling strategy for a module or service.
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

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Catching too broadly**: Catching `Exception` or `Throwable` hides bugs and makes debugging harder.
  - how to detect: errors that should crash are silently swallowed
  - how to fix: catch specific exceptions, let unexpected ones propagate

- **Retry without idempotency**: Retrying operations that aren't idempotent causes duplicate effects (e.g., double charges).
  - how to detect: duplicate records, double charges, or other side effects after retries
  - how to fix: make operations idempotent or track retry keys to prevent duplicates

- **Exposing internal errors to clients**: Leaking stack traces, database errors, or internal paths to clients is a security risk.
  - how to detect: error responses contain internal paths, SQL errors, or stack traces
  - how to fix: log internal details, return generic error codes to clients

- **No timeout on external calls**: External service calls without timeouts can hang indefinitely and exhaust resources.
  - how to detect: requests hang, thread pools exhausted
  - how to fix: always set sensible timeouts on all external calls

- **Error codes not documented**: Defining error codes but not documenting them means clients guess at meanings.
  - how to detect: clients report confusion about error codes, contact support for explanation
  - how to fix: document all error codes with causes and recommended actions
