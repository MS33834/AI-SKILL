---
slug: code-performance-review
name: Code Performance Review
name_zh: 代码性能评审
version: 0.1.0
description: Review code for performance bottlenecks and suggest measured optimizations.
description_zh: 评审代码性能瓶颈并提出可测量的优化建议。
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
