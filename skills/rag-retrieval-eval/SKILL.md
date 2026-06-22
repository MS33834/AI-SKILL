---
slug: rag-retrieval-eval
name: RAG Retrieval Eval
version: 0.2.0
description: Design an evaluation for a RAG retrieval component.
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
updated: 2026-06-22
---

# When to use

Building or tuning a RAG system, choosing a retriever, or debugging retrieval quality.

# Inputs

Describe the corpus and representative queries. Include domain type, document structure, and any known failure modes.

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

---

# Retrieval Evaluation Metrics Explained

## NDCG@K (Normalized Discounted Cumulative Gain)

**What it measures:** How well the top-K retrieved results are ranked, accounting for position (results at top matter more).

**Formula:**
```
DCG@K = Σ(i=1 to K) relevance_score(i) / log2(i+1)
NDCG@K = DCG@K / IDCG@K
```
Where `IDCG@K` is the ideal DCG (perfect ranking).

**Why it matters:** A system that retrieves relevant docs at positions 1-5 scores higher than one with the same docs at positions 6-10.

**Code:**
```python
import numpy as np

def ndcg_at_k(relevance_labels: list[int], k: int) -> float:
    """Calculate NDCG@k for a single query.
    
    Args:
        relevance_labels: List of relevance scores in retrieval order (0=irrelevant, 1=relevant)
        k: Cutoff position
    """
    dcg = sum((rel / np.log2(idx + 2)) for idx, rel in enumerate(relevance_labels[:k]))
    ideal_relevance = sorted(relevance_labels, reverse=True)
    idcg = sum((rel / np.log2(idx + 2)) for idx, rel in enumerate(ideal_relevance[:k]))
    return dcg / idcg if idcg > 0 else 0.0

# Example
relevance = [3, 2, 3, 0, 1]  # doc0:rel=3, doc1:rel=2, doc2:rel=3, doc3:rel=0, doc4:rel=1
print(f"NDCG@3: {ndcg_at_k(relevance, 3):.4f}")
```

## MRR (Mean Reciprocal Rank)

**What it measures:** The rank of the first relevant document, averaged across queries.

**Formula:**
```
MRR = (1/|Q|) * Σ(1 / rank_i)
```
Where `rank_i` is the position of the first relevant result for query `i`.

**Why it matters:** Good for question-answering where only the first answer matters.

**Code:**
```python
def mean_reciprocal_rank(results: list[list[int]]) -> float:
    """Calculate MRR across queries.
    
    Args:
        results: List of ranked doc ID lists for each query (most relevant first)
    """
    reciprocal_ranks = []
    for ranked_docs in results:
        for rank, doc_id in enumerate(ranked_docs, start=1):
            if is_relevant(doc_id):  # your relevance judgment
                reciprocal_ranks.append(1.0 / rank)
                break
        else:
            reciprocal_ranks.append(0.0)  # No relevant doc found
    return sum(reciprocal_ranks) / len(reciprocal_ranks)
```

## Hit Rate@K

**What it measures:** The fraction of queries where at least one relevant document appears in the top-K.

**Formula:**
```
Hit Rate@K = |{ q ∈ Q : ∃d ∈ TopK(q), d is relevant }| / |Q|
```

**Why it matters:** Simple binary success/failure per query—easy to explain to stakeholders.

## Context Precision

**What it measures:** Whether the retrieved context contains only relevant information (no noise).

**Formula:**
```
Context Precision = Σ(precision_at_i) / |relevant docs in context|
precision_at_i = (# relevant docs in top-i) / i
```

**Why it matters:** High context precision means the LLM isn't distracted by irrelevant retrieved chunks.

## Context Recall

**What it measures:** What fraction of all relevant information in the corpus was retrieved.

**Formula:**
```
Context Recall = |retrieved ∩ relevant| / |all relevant|
```

**Why it matters:** Low recall means the answer will be incomplete because key information wasn't retrieved.

## Answer Faithfulness (Hallucination Rate)

**What it measures:** Whether the generated answer is supported by the retrieved context.

**Code:**
```python
def faithfulness_score(answer: str, context: str, llm) -> float:
    """Score answer faithfulness using LLM as judge.
    
    Returns 1.0 if answer is fully faithful to context, 0.0 if it contains hallucinations.
    """
    prompt = f"""Given the context below, does the answer make claims that are not
    supported by the context? Respond with only YES or NO.

    Context: {context}

    Answer: {answer}

    Does the answer contain information not supported by the context?"""
    
    response = llm.complete(prompt).strip().upper()
    return 0.0 if response.startswith("YES") else 1.0
```

---

# End-to-End RAG Eval Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG Evaluation Pipeline                           │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐    ┌────────────┐    ┌───────────┐    ┌──────────────┐    ┌─────────┐
  │  Query   │───▶│ Retrieve   │───▶│  Rerank   │───▶│   Generate  │───▶│ Metrics │
  │ (user)   │    │  (vector   │    │ (cross-   │    │   (LLM       │    │         │
  │          │    │  or BM25)  │    │  encoder) │    │    answer)   │    │         │
  └──────────┘    └────────────┘    └───────────┘    └──────────────┘    └─────────┘
       │                │                │                 │
       │                │                │                 │
       ▼                ▼                ▼                 ▼
  Ground Truth    Retrieved      Retrieved         Generated
   (golden        Chunks         Chunks           Answer
    doc IDs)       (top-K)        (reranked)       
```

## Pipeline Step: Query → Retrieve

```python
from typing import NamedTuple

class RetrievalResult(NamedTuple):
    query: str
    retrieved_chunk_ids: list[str]
    retrieved_chunks: list[str]
    scores: list[float]  # similarity scores from retriever

class RAGEvaluator:
    def __init__(
        self,
        retriever,      # e.g., FAISS index + embedding model
        reranker=None,  # e.g., cross-encoder, optional
        generator=None, # e.g., GPT-4, optional
    ):
        self.retriever = retriever
        self.reranker = reranker
        self.generator = generator

    def retrieve(self, query: str, top_k: int = 10) -> RetrievalResult:
        """Step 1: Retrieve chunks for a query."""
        chunk_ids, chunks, scores = self.retriever.search(query, k=top_k)
        return RetrievalResult(
            query=query,
            retrieved_chunk_ids=chunk_ids,
            retrieved_chunks=chunks,
            scores=scores
        )

    def rerank(self, result: RetrievalResult, top_k: int = 5) -> RetrievalResult:
        """Step 2: Optionally rerank retrieved results."""
        if not self.reranker:
            return result
        
        reranked = self.reranker.rerank(
            query=result.query,
            chunks=result.retrieved_chunks,
            chunk_ids=result.retrieved_chunk_ids,
            top_k=top_k
        )
        return RetrievalResult(
            query=result.query,
            retrieved_chunk_ids=reranked["ids"],
            retrieved_chunks=reranked["chunks"],
            scores=reranked["scores"]
        )

    def generate(self, query: str, context: list[str]) -> str:
        """Step 3: Generate answer from context."""
        if not self.generator:
            raise ValueError("Generator not configured")
        
        prompt = f"""Answer the question based ONLY on the provided context.
If the answer is not in the context, say "I don't know."

Context:
{chr(10).join(context)}

Question: {query}
Answer:"""
        return self.generator.complete(prompt)

    def evaluate_query(
        self,
        query: str,
        ground_truth_doc_ids: set[str],
        ground_truth_answer: str = None,
        top_k_retrieval: int = 10,
        top_k_rerank: int = 5,
    ) -> dict:
        """Full evaluation for a single query."""
        # Retrieve
        retrieval_result = self.retrieve(query, top_k=top_k_retrieval)
        
        # Rerank
        reranked_result = self.rerank(retrieval_result, top_k=top_k_rerank)
        
        # Metrics
        retrieved_ids = set(reranked_result.retrieved_chunk_ids)
        
        metrics = {
            "recall@k": len(retrieved_ids & ground_truth_doc_ids) / len(ground_truth_doc_ids),
            "hit_rate@5": 1.0 if len(retrieved_ids & ground_truth_doc_ids) > 0 else 0.0,
        }
        
        # If we have a generator, compute generation metrics
        if ground_truth_answer and self.generator:
            answer = self.generate(query, reranked_result.retrieved_chunks)
            metrics["faithfulness"] = faithfulness_score(answer, reranked_result.retrieved_chunks, self.generator)
            metrics["answer"] = answer
        
        return metrics
```

## Evaluation Dataset Structure

```python
from dataclasses import dataclass

@dataclass
class EvalQuery:
    query_id: str
    query: str
    relevant_doc_ids: set[str]  # Ground truth relevant document IDs
    answer: str                  # Expected answer (for generation eval)
    metadata: dict               # domain, difficulty, source

class EvalDataset:
    def __init__(self, queries: list[EvalQuery]):
        self.queries = queries
    
    @classmethod
    def from_jsonl(cls, path: str) -> "EvalDataset":
        queries = []
        with open(path) as f:
            for line in f:
                data = json.loads(line)
                queries.append(EvalQuery(
                    query_id=data["id"],
                    query=data["query"],
                    relevant_doc_ids=set(data["relevant_doc_ids"]),
                    answer=data.get("answer", ""),
                    metadata=data.get("metadata", {})
                ))
        return cls(queries)

# Example JSONL line:
# {"id": "q001", "query": "How do I reset my password?", "relevant_doc_ids": ["doc_123", "doc_456"], "answer": "Go to Settings > Security > Reset Password", "metadata": {"domain": "support", "difficulty": "easy"}}
```

---

# Retrieval Failure Modes

## 1. Semantic Drift
Query intent doesn't match the language in relevant documents.

**Example:**
- Query: "why is my export failing"
- Relevant doc: "File export timeout errors occur when the export exceeds 100MB"

**Mitigation:** Use query expansion / rewrite techniques, add synonyms.

## 2. Chunk Boundary Issues
Important information split across chunks, losing context.

**Example:**
- Chunk 1: "The server requires authentication"
- Chunk 2: "with a valid API key in the Authorization header"

A query about "server authentication" might retrieve only one chunk.

**Mitigation:** Increase overlap, use document-level retrieval before chunk-level.

## 3. Near-Duplicate Retrieval
Retriever returns multiple variants of the same content.

**Example:** Retrieved chunks 1, 2, 3 are all from the same document section with minor text differences.

**Mitigation:** Deduplicate at retrieval time, use MMR (Maximal Marginal Relevance).

## 4. Out-of-Domain Queries
User asks about topics not covered in the corpus.

**Example:**
- Corpus: Internal HR policies
- Query: "How do I fix a network printer?"

**Mitigation:** Detect out-of-domain queries, return "I don't know" gracefully.

## 5. Hallucinated Retrieval
Retriever returns fabricated or irrelevant content confidently.

**Mitigation:** Evaluate with negative examples (truly irrelevant docs), use contrastive learning.

---

# Footguns: Common Retrieval Evaluation Mistakes

1. **Only measuring Recall@K** — Recall ignores ranking quality. Always pair with NDCG@K.

2. **No negative sampling** — A retriever that returns everything has 100% recall but is useless. Include hard negatives.

3. **Using the same data for training and evaluation** — If you tune chunk size on your eval set, you're measuring overfitting.

4. **Ignoring latency** — Fast retrieval of irrelevant docs is worse than slower retrieval of correct ones. Report p50/p95 latency.

5. **Evaluating retrieval without generation** — A retriever can get "good" metrics but produce terrible answers due to context pollution.

6. **Golden doc IDs don't match your chunking strategy** — If golden truth uses document IDs but you chunk at 512 tokens, the IDs won't map.

7. **Not measuring context precision** — Retrieving 5 relevant + 95 irrelevant docs scores 100% recall but destroys generation quality.

8. **Assuming fixed K works for all queries** — Short queries need different K than verbose multi-entity queries.

9. **No inter-annotator agreement** — Human relevance judgments vary. Report Cohen's kappa between annotators.

10. **Evaluating reranking in isolation** — A reranker that boosts NDCG but hurts recall needs to be evaluated in the full pipeline.

---

# Dataset Construction

## Golden Pair Creation

```python
def create_golden_pairs(corpus: list[dict], queries: list[str]) -> list[EvalQuery]:
    """Create evaluation dataset with human-in-the-loop.
    
    For each query:
    1. Retrieve top-50 candidates using BM25
    2. Show to human annotator
    3. Annotator labels relevant/irrelevant + provides expected answer
    4. Collect as EvalQuery
    """
    import anthropic
    
    client = anthropic.Anthropic()
    
    eval_queries = []
    for q in queries:
        # BM25 baseline retrieval
        bm25_results = bm25_retriever.search(q, k=50)
        
        annotation_prompt = f"""Given the query: "{q}"
        
        Review these retrieved document chunks and label each as relevant or irrelevant.
        Also provide the ideal answer based on the relevant documents.
        
        Documents:
        {format_chunks(bm25_results)}
        
        Format your response as JSON with fields: relevant_ids[], answer, notes"""
        
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": annotation_prompt}]
        )
        
        # Parse and create EvalQuery...
    return eval_queries
```

## Negative Sampling Strategy

| Type | How to Create | Purpose |
|------|--------------|---------|
| Random | Sample from corpus randomly | Baseline noise |
| BM25 miss | High BM25 score but not relevant | Hard negative |
| Semantic near-miss | Similar embedding but different meaning | Contrastive |
| Out-of-domain | From different corpus | Specificity test |

```python
def add_negatives(dataset: EvalDataset, corpus: list[dict]) -> EvalDataset:
    """Add hard negatives to evaluation dataset."""
    for q in dataset.queries:
        # Find BM25-similar but irrelevant docs
        bm25_scores = bm25.score(q.query, corpus)
        candidates = sorted(zip(bm25_scores, corpus), key=lambda x: -x[0])
        
        hard_negatives = [
            doc_id for score, doc_id in candidates[:20]
            if doc_id not in q.relevant_doc_ids and score > 0.1
        ]
        q.hard_negatives = hard_negatives[:5]  # Add 5 hard negatives
    
    return dataset
```

---

# Baseline Comparison Framework

```python
class BaselineComparison:
    """Compare multiple retrievers on the same eval set."""
    
    def __init__(
        self,
        evaluators: dict[str, RAGEvaluator],
        dataset: EvalDataset,
    ):
        self.evaluators = evaluators
        self.dataset = dataset
    
    def run(self, top_k: int = 10) -> pd.DataFrame:
        """Run all evaluators and return comparison table."""
        results = []
        
        for name, evaluator in self.evaluators.items():
            for query in self.dataset.queries:
                metrics = evaluator.evaluate_query(
                    query.query,
                    query.relevant_doc_ids,
                    top_k_retrieval=top_k,
                )
                results.append({
                    "retriever": name,
                    "query_id": query.query_id,
                    **metrics
                })
        
        df = pd.DataFrame(results)
        
        # Aggregate by retriever
        summary = df.groupby("retriever").agg({
            "recall@k": "mean",
            "hit_rate@5": "mean",
            "ndcg@k": "mean" if "ndcg@k" in df.columns else None,
        }).round(4)
        
        return summary
```

---

# Example

**Input:**

```
corpus: '10k technical support articles'
queries: 'how do I reset password, why is my export failing'
```

**Output:**

```markdown
## Metrics
- **NDCG@5**: 0.82 (target: >0.85)
- **MRR**: 0.78
- **Hit Rate@5**: 0.91
- **Context Precision**: 0.75 (low—retriever returns noisy chunks)
- **Latency p95**: 180ms (target: <200ms)

## Dataset
- 200 query/answer pairs with 1-3 relevant article IDs each
- 50 out-of-domain negatives (support tickets not in corpus)
- 5 hard negatives per query (BM25-similar but irrelevant)

## Baseline Comparison
| Retriever      | NDCG@5 | Hit Rate@5 | p95 Latency |
|----------------|--------|------------|-------------|
| BM25           | 0.71   | 0.82       | 45ms        |
| sentence-bert  | 0.79   | 0.88       | 120ms       |
| OpenAI-embed   | 0.85   | 0.94       | 180ms       |
| + reranker     | 0.91   | 0.97       | 220ms       |

## Footguns Identified
1. **Chunk size 256 too small** — loses paragraph context; suggest 512 with 50 overlap.
2. **No deduplication** — near-duplicate articles returned as separate results.
3. **Out-of-domain queries** — "printer not working" returns unrelated docs with >0.7 similarity.

## Recommendations
1. Increase chunk size to 512 tokens with 50-token overlap.
2. Add MMR (Max Marginal Relevance) to reduce near-duplicate retrieval.
3. Add out-of-domain classifier to detect and gracefully handle queries outside corpus scope.
```

# See Also

- [BEIR Benchmark](https://github.com/beir-cellar/beir) — Retrieval evaluation framework
- [RAGAS](https://github.com/explodinggradients/ragas) — RAG evaluation library
- [MTEB](https://github.com/embeddings-benchmark/mteb) — Massive Text Embedding Benchmark
- [Sentence Transformers](https://www.sbert.net/) — Embedding models
