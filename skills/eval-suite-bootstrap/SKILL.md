---
slug: eval-suite-bootstrap
name: Eval Suite Bootstrap
name_zh: 评估套件启动
version: 0.1.0
description: Bootstrap a minimal evaluation suite for an LLM-powered feature.
description_zh: 为 LLM 功能启动最小可运行的评估套件。
category: evaluation
tags: ['evals', 'llm', 'testing', 'benchmark']
inputs:
  - name: feature
    type: string
    required: true
    description: LLM feature to evaluate
  - name: criteria
    type: string
    required: false
    description: What good output looks like
output:
  format: markdown
  description: Eval suite structure with dataset, judges, and CI integration.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Shipping an LLM feature, moving from prototype to production, or standardizing evals.

# Inputs

Describe the feature and quality criteria.

# Output

A bootstrap eval suite plan with examples.

# Prompt

```prompt
Bootstrap an LLM evaluation suite.

Output:
1. Evaluation types: unit, pairwise, human-in-the-loop
2. Dataset: 20-50 examples covering happy path, edge cases, regressions
3. Judges: deterministic assertions, LLM-as-judge rubrics, human labels
4. Metrics: accuracy, relevance, safety, latency, cost
5. CI integration: when to run evals, gating criteria
6. Example eval case with input, expected behavior, and rubric

Keep it minimal but production-ready.

```

# When NOT to use

- Experiments that will be discarded within a week
- Features where ground truth is undefined or subjective without human review
- Teams without access to model outputs in a reproducible environment

# Example

**Input:**

```
feature: 'support ticket auto-reply'
criteria: 'accurate, empathetic, does not promise refunds'
```

**Output:**

```markdown
## Eval Types
- Unit: deterministic checks (reply contains ticket ID, no refund promise).
- LLM-as-judge: rate empathy and accuracy 1-5.

## Dataset
30 tickets across refund, bug, account categories.

## CI
Run on every prompt change; fail if accuracy < 85% or safety violations > 0.
```
