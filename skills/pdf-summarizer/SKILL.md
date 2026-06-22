---
name: PDF Summarizer
description: number of bullets in the summary
category: multimodal
tags:
- ai
- api
- documentation
- frontend
- llm
source: null
license: MIT
author: badhope
version: 1.0.0
needs_review: false
slug: pdf-summarizer
created: '2026-06-12'
updated: '2026-06-19'
inputs:
- name: pdf_path
  type: string
  required: true
  description: Local path to the PDF file
- name: audience
  type: string
  required: false
  description: Target audience - exec/PM/technical (default PM)
- name: length
  type: integer
  required: false
  description: Number of bullets in summary (default 5)
output:
  format: markdown
  description: Generated content based on the user request
---
# When to use

The user has handed you a PDF (paper, report, contract, README-as-PDF) and wants the gist without reading 50 pages. You have access to a PDF reader.

# Inputs

A `pdf_path` is mandatory. `audience` and `length` are optional with sensible defaults (PM, 5 bullets).

# Output

Markdown with:

1. A one-line TL;DR
2. N bullets (3-10) covering the main points
3. A "What's missing" line — be honest about what you couldn't tell from the PDF

# Prompt

```prompt
You are a careful reader, not a bullshitter. The user has handed you a PDF.

Step 1: Read the first 2 pages and the headings of the rest. If the PDF
        is purely a scanned image (no extractable text), say so and stop.

Step 2: Write a one-line TL;DR. No more than 20 words. If you can't,
        the user needs to know.

Step 3: Write N bullets. Each bullet = one claim, ≤ 25 words. Order
        by importance, not by appearance in the text. The first
        bullet is the most important thing in the document.

Step 4: Add a "What's missing" line. What would a careful reader
        still want to know that you didn't cover? Examples:
        methodology, sample size, counter-arguments, code, screenshots.

Rules:
- Never invent numbers, authors, dates, or citations.
- If the PDF is in a language you don't read, say so.
- If a section is irrelevant to the audience, drop it.
- Do not include "In conclusion" or "In this document".
```

# When NOT to use

- The user wants a literal extract, not a summary. Use a different skill.
- The PDF is a fillable form, code, or a presentation slide deck — those need a different tool.
- The user asked "is this real?" or "is this legal?" — that's fact-checking, not summarising. Out of scope.
- The PDF is over 200 pages. Split it first, or warn the user you'll take a long time.

# Example

**Input:**

```yaml
pdf_path: /tmp/q3-earnings.pdf
audience: exec
length: 4
```

**Output:**

```markdown
**TL;DR:** Q3 revenue beat consensus by 4%, driven by enterprise; full-year guidance unchanged.

- Enterprise ARR grew 28% YoY, the strongest segment this quarter
- Gross margin compressed 1.2 pp due to a one-time cloud cost
- Cash burn slowed to $8M/month; runway extended to 22 months
- Hiring freeze remains in place; 2 open reqs in engineering

**What's missing:** cohort retention numbers, customer concentration, full P&L
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Scanned image PDFs**: PDFs that are scanned images have no extractable text.
  - how to detect: skill says "no extractable text" or produces gibberish
  - how to fix: use OCR first, or use a vision-capable model

- **Invented citations**: LLM makes up numbers, dates, or citations that aren't in the PDF.
  - how to detect: citations in summary don't match actual PDF content
  - how to fix: verify claims against PDF, use lower temperature

- **Ignoring missing context**: Summarizing without acknowledging what wasn't covered.
  - how to detect: summary implies complete coverage when it isn't
  - how to fix: always include "What's missing" section

- **Language mismatch**: PDF in a language the model doesn't read.
  - how to detect: summary is generic or says "I couldn't read this"
  - how to fix: check PDF language first, refuse gracefully

- **Over-summary**: Summarizing so much that the summary becomes useless.
  - how to detect: bullets are longer than 25 words, lose the compression benefit
  - how to fix: enforce the 25-word bullet limit strictly
