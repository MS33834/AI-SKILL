---
slug: code-performance-review
name: Code Performance Review
version: 0.1.0
description: Review code for performance bottlenecks and suggest measured optimizations.
category: dev-tools
tags: ['performance', 'profiling', 'optimization', 'review']
inputs:
  - name: code
    type: string
    required: true
    description: Code snippet or function to review
  - name: constraints
    type: string
    required: false
    description: Latency, memory, or throughput targets
output:
  format: markdown
  description: Bottleneck analysis with profiling suggestions and optimized code.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Hot path review, latency regression investigation, or before scaling a service.

# Inputs

Provide the code and any performance constraints.

# Output

A review with identified bottlenecks, measurement strategy, and suggested code changes.

# Prompt

```prompt
Review the provided code for performance issues.

For each issue:
1. Identify the bottleneck (algorithmic, I/O, memory, concurrency)
2. Estimate impact in Big-O or approximate latency/memory terms
3. Suggest a measured optimization
4. Provide a code snippet if the change is local

Also include:
- How to profile/measure before and after
- When NOT to optimize (e.g., clarity trade-off, non-hot path)
- Risk of premature optimization

Output:

## Bottlenecks
...

## Recommendations
...

## Measurement Plan
...

```

# When NOT to use

- One-off scripts or background jobs without latency requirements
- Code that is already fast enough per the agreed SLO
- Prototype code where readability matters more than throughput

# Example

**Input:**

```
code: 'def find_duplicates(items): return [x for x in items if items.count(x) > 1]'
constraints: 'List up to 1M items, must complete under 500ms'
```

**Output:**

```markdown
## Bottlenecks
`items.count(x)` inside a list comprehension is O(n²).

## Recommendations
Use a Counter:
```python
from collections import Counter
counts = Counter(items)
return [x for x, c in counts.items() if c > 1]
```

## Measurement
Profile with `timeit` on a 1M-item list; target <100ms.
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Premature optimization**: Optimizing non-hot paths wastes time and adds complexity.
  - how to detect: profiling shows optimized code isn't in top 10% of time spent
  - how to fix: profile first, then optimize only the hot paths

- **Algorithmic complexity ignored**: Using O(n²) algorithms when O(n log n) or O(n) exists.
  - how to detect: latency increases super-linearly with input size
  - how to fix: analyze Big-O before coding, use built-in optimized functions

- **No measurement before/after**: Optimizing without baseline measurements means you don't know if you've improved.
  - how to detect: no benchmark results in PR description
  - how to fix: establish baseline with profiling tools before making changes

- **Memory leaks from caching**: Caching without eviction policies causes unbounded memory growth.
  - how to detect: memory usage grows over time without bound
  - how to fix: set max size or TTL on all caches

- **I/O not batched**: Making N individual calls instead of batch operations.
  - how to detect: many sequential network calls in traces
  - how to fix: batch requests where the API supports it
