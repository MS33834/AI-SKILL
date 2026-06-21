---
slug: microservice-boundary-review
name: Microservice Boundary Review
name_zh: 微服务边界评审
version: 0.1.0
description: Evaluate whether a proposed service boundary is coherent and low-coupling.
description_zh: 评估提议的服务边界是否内聚且低耦合。
category: dev-tools
tags: ['microservices', 'architecture', 'bounded-context', 'design']
inputs:
  - name: proposed_service
    type: string
    required: true
    description: Service responsibility and data ownership
  - name: collaborators
    type: string
    required: false
    description: Other services it must call
output:
  format: markdown
  description: Boundary assessment with coupling risks and alternatives.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Splitting a monolith, adding a new service, or reviewing a service's scope creep.

# Inputs

Describe the proposed service and its collaborators.

# Output

An assessment of cohesion, coupling, data ownership, and suggested alternatives.

# Prompt

```prompt
Evaluate a proposed microservice boundary.

Dimensions:
1. Cohesion: does the service own one bounded context?
2. Data ownership: which data does it own vs reference?
3. Coupling: sync vs async calls, fan-out, circular dependencies
4. Transaction boundaries: sagas, two-phase commit, eventual consistency
5. Operational cost: deploy frequency, blast radius, on-call load
6. Alternatives: library, module, or separate team-owned service

Output:

## Verdict
Keep / split / merge / defer

## Risks
...

## Recommendations
...

```

# When NOT to use

- Small teams where microservices create more overhead than value
- Greenfield projects without clear domain boundaries
- Temporary integrations that will be replaced within a quarter

# Example

**Input:**

```
proposed_service: 'notification service owning email/sms/push templates and delivery'
collaborators: 'user-service, order-service, billing-service'
```

**Output:**

```markdown
## Verdict
Keep, but split template management from delivery if scale differs.

## Risks
- Fan-out to 3 services for personalization data.
- Delivery retries could saturate user-service during incidents.

## Recommendations
- Cache user preferences locally.
- Use async events for order/billing triggers.
- Keep template CRUD synchronous for authoring UX.
```
