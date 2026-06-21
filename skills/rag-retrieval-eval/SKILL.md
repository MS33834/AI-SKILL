---
slug: rag-retrieval-eval
name: RAG Retrieval Eval
name_zh: RAG 检索评估
version: 0.1.0
description: Design an evaluation for a RAG retrieval component.
description_zh: 为 RAG 检索组件设计评估方案。
category: rag-retrieval
tags: ['rag', 'retrieval', 'evaluation', 'llm']
inputs:
  - name: corpus
    type: string
    required: true
    description: Document corpus description
  - name: queries
    type: string
    required: false
    description: Example user queries
output:
  format: markdown
  description: Retrieval evaluation plan with metrics and dataset design.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Building or tuning a RAG system, choosing a retriever, or debugging retrieval quality.

# Inputs

Describe the corpus and representative queries.

# Output

An eval plan with metrics, dataset construction, and baseline approach.

# Prompt

```prompt
Design a retrieval evaluation for a RAG system.

Cover:
1. Metrics: recall@k, MRR, NDCG, precision, latency
2. Dataset: golden pairs (query, relevant doc IDs), negative sampling
3. Baseline: keyword/BM25 vs embedding retrieval
4. Failure modes: hallucinated retrieval, duplicates, out-of-domain queries
5. Human evaluation: when and how to spot-check
6. Iteration: chunk size, overlap, embedding model, reranker

Output:

## Metrics
...

## Dataset Construction
...

## Baseline
...

```

# When NOT to use

- Systems where retrieval is deterministic (exact ID lookup)
- Very small corpora where manual inspection is sufficient
- End-to-end generation eval where retrieval is not the bottleneck

# Example

**Input:**

```
corpus: '10k technical support articles'
queries: 'how do I reset password, why is my export failing'
```

**Output:**

```markdown
## Metrics
- Recall@5: did the right article appear in top 5?
- MRR: rank of first relevant article
- Latency p95 < 200ms

## Dataset
Create 200 query/answer pairs with 1-3 relevant article IDs each. Include 50 out-of-domain negatives.
```
