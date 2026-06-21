---
slug: prompt-injection-guardrails
name: Prompt Injection Guardrails
name_zh: 提示注入防护
version: 0.1.0
description: Add guardrails against direct and indirect prompt injection for an LLM app.
description_zh: 为 LLM 应用添加直接和间接提示注入防护。
category: guardrails
tags: ['prompt-injection', 'security', 'llm', 'guardrails']
inputs:
  - name: app_description
    type: string
    required: true
    description: What the LLM app does and who provides input
  - name: untrusted_sources
    type: string
    required: false
    description: Untrusted data sources
output:
  format: markdown
  description: Defense layers with detection, filtering, and response strategies.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Building an LLM app that processes untrusted user input or external documents.

# Inputs

Describe the app and untrusted input sources.

# Output

A layered defense plan with implementation guidance.

# Prompt

```prompt
Design prompt-injection defenses for the described LLM app.

Layers:
1. Input validation: length limits, allowed formats, sandboxing
2. Instruction hierarchy: system prompt strength, delimiters
3. Output control: constrained generation, tool-call allowlists
4. Detection: heuristic filters, separate classifier model, canary checks
5. Runtime: rate limiting, human-in-the-loop for sensitive actions
6. Response: graceful refusal, logging, alerting

Do not claim any defense is 100% effective. Emphasize defense-in-depth.

```

# When NOT to use

- Fully trusted, closed-user-group internal tools
- Applications with no user-provided text or external documents
- Cases where the real risk is model hallucination rather than injection

# Example

**Input:**

```
app_description: 'Customer support chatbot that can read user emails and reply'
untrusted_sources: 'user chat messages, uploaded email threads'
```

**Output:**

```markdown
## Defense Layers
1. Delimit untrusted email content with XML tags; instruct model to treat as data.
2. Run email text through a prompt-injection classifier before LLM call.
3. Restrict tools: no send-email without human confirmation.
4. Add canary: reject if untrusted text contains common instruction-override markers.
5. Log all model inputs with injection scores for 30 days.
```
