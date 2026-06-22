---
slug: microservice-boundary-review
name: Microservice Boundary Review
version: 0.1.0
description: Evaluate whether a proposed service boundary is coherent and low-coupling.
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

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Distributed monolith**: Services that are too fine-grained and must be deployed together.
  - how to detect: services always deployed in coordination, can't ship independently
  - how to fix: merge related services, reduce coupling

- **Shared databases**: Services that bypass APIs and directly read each other's data.
  - how to detect: schema changes in one service break another
  - how to fix: enforce API contracts, use database per service

- **Sync calls across service boundaries**: Using synchronous HTTP between services creates tight coupling.
  - how to detect: one service downtime cascades to others
  - how to fix: use async messaging for non-critical paths

- **God services**: Services that do too much and become a maintenance bottleneck.
  - how to detect: one team owns most of the codebase
  - how to fix: extract coherent bounded contexts into separate services

- **No data ownership clarity**: Unclear which service owns which data leads to conflicts.
  - how to detect: duplicate data, conflicting updates, coordination overhead
  - how to fix: define clear ownership, use event sourcing for shared data
