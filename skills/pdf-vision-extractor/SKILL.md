---
name: PDF Vision Extractor
description: Extract invoice numbers, dates, amounts and other fields from scanned PDFs using Claude vision.
category: multimodal
tags:
- ai
- documentation
- javascript
- llm
- typescript
source: null
license: MIT
author: badhope
version: 0.1.0
platforms:
- claude
needs_review: false
slug: pdf-vision-extractor
created: '2026-06-12'
updated: '2026-06-19'
inputs:
- name: pdf_path
  type: string
  required: true
  description: Local path to scanned PDF file
- name: schema
  type: object
  required: true
  description: JSON schema defining fields to extract
- name: pages
  type: array
  required: false
  description: Specific pages to extract from (omit for all pages)
output:
  format: markdown
  description: Generated content based on the user request
---
# When to use

> **Claude-only** — This skill assumes the model has vision capability to read images in PDFs.
> Codex / GPT-4o vision may also work, but the prompt is tuned for Claude.
> Cursor / Continue using pure text path will not work.

The document is a **scanned or image-based PDF** (not a PDF with text layer). You need to extract several structured fields from it. Typical use cases: invoice number + date + amount, contract parties + amount, receipt merchant name + transaction ID.

The schema is specified by the caller, so the same prompt works for different forms — invoices, contracts, receipts, HSE reports.

**Do NOT use for:**

- Text PDFs (use `pdf-summarizer` or extract text directly)
- Irregular handwriting (recognition rate is low, out of v1 scope)
- Multi-language mixed scripts (>10 different fonts causes vision confusion)

# Inputs

| Field | Description |
|---|---|
| `pdf_path` | Local path to the scanned PDF |
| `schema` | Fields to extract. **Required** — without it the skill doesn't know what to extract |
| `pages` | Which pages to read. Omit for all pages |

Schema shape:

```yaml
schema:
  invoice_no: { type: string, description: Invoice number }
  total:      { type: number, description: Total amount including tax }
  currency:   { enum: [CNY, USD, EUR] }
  issued_at:  { type: string, description: YYYY-MM-DD }
```

The model does not strictly follow schema types — number fields may return strings and need upstream `float()` conversion. This is a known limitation, not handled in v1.

# Output

JSON, shape:

```json
{
  "extracted": { /* filled per schema, omit fields not found */ },
  "confidence": 0.85,
  "missing": ["currency"]
}
```

`confidence` is the model's self-assessed 0-1 number, **not trustworthy**. Use only for sorting/filtering.
For real validation, use schema validation + business rules (amount > 0, valid date, etc.).

# Prompt

```prompt
You have vision. The user will give you a PDF (scanned / image-based)
and a JSON schema. Look at every page they allow you to see, then
extract the requested fields.

Rules:

- Read top-to-bottom, left-to-right. Tables come in row order.
- Numbers: drop thousand separators, keep decimal point.
  "$1,234.50" → 1234.50, "￥1.234,50" → 1234.50.
- Dates: always emit YYYY-MM-DD. "March 5, 2024" → 2024-03-05.
- Enum fields: pick the closest enum value, even if the doc says
  it slightly differently. "RMB" → CNY.
- Missing fields: don't guess. If the doc doesn't show the field,
  omit it from `extracted` and add it to `missing`.
- Multi-page: aggregate across all allowed pages, prefer the
  canonical / summary line over individual line items.

Output JSON only, no prose. Schema:

{
  "extracted": <object with extracted fields, matching input schema>,
  "confidence": <number 0-1, your self-assessed certainty>,
  "missing": [<field names you couldn't find>]
}

Be terse in confidence — 0.9+ only when the field is clearly
printed; 0.5-0.8 when partially obscured; <0.5 when you're guessing.
```

# When NOT to use

- **PDF has text layer** — `pdftotext` extraction is more accurate, vision is wasteful
- **Tables spanning multiple pages with repeated headers** — vision may extract duplicates, preprocessing裁切 needed
- **Handwritten notes / doctor prescriptions** — character recognition rate 60-70%, not the target scenario
- **Need 100% accuracy** — vision is never 100% accurate, use OCR + human review for such requirements
- **Need original image coordinates / bounding box** — this skill doesn't return coordinates, use a specialized document understanding model

# Example

**Input:**

```yaml
pdf_path: ./invoices/2024-03-acme.pdf
schema:
  invoice_no: { type: string, description: Invoice number }
  issued_at:  { type: string, description: Invoice date YYYY-MM-DD }
  total:      { type: number, description: Total amount including tax }
  currency:   { enum: [CNY, USD, EUR] }
  vendor:     { type: string, description: Seller name }
```

**Output:**

```json
{
  "extracted": {
    "invoice_no": "INV-2024-03381",
    "issued_at":  "2024-03-15",
    "total":      12750.00,
    "currency":   "CNY",
    "vendor":     "Acme Technologies Co., Ltd."
  },
  "confidence": 0.88,
  "missing": []
}
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Scanned image PDFs**: PDFs that are images, not text.
  - how to detect: skill returns gibberish or "no text found"
  - how to fix: use OCR first, or use a vision model

- **Confidence threshold not checked**: Using low-confidence extractions.
  - how to detect: extracted data is wrong but passed through anyway
  - how to fix: reject or flag extractions with confidence < threshold

- **Field extraction without schema validation**: Fields returned don't match expected schema.
  - how to detect: downstream processing fails on unexpected field types
  - how to fix: validate extracted fields against schema before returning

- **PDF without extractable content**: Encrypted or protected PDF.
  - how to detect: skill fails to extract anything
  - how to fix: check PDF is not password-protected before processing

- **Over-reliance on single extraction**: Not verifying critical fields manually.
  - how to detect: critical data extracted incorrectly
  - how to fix: always verify critical fields with human review
