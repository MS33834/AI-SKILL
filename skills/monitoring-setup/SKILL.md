---
slug: monitoring-setup
name: Monitoring Setup
version: 0.1.0
description: Define metrics, dashboards, and alerts for a service.
category: dev-tools
tags: ['monitoring', 'observability', 'metrics', 'alerts']
inputs:
  - name: service
    type: string
    required: true
    description: Service or component to monitor
  - name: slos
    type: string
    required: false
    description: SLOs or user-facing goals
output:
  format: markdown
  description: Monitoring plan with SLIs, dashboards, and alert rules.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Launching a new service, revising on-call coverage, or refining alert fatigue.

# Inputs

Describe the service and any SLOs.

# Output

A monitoring plan with SLIs, dashboards, and alert rules.

# Prompt

```prompt
Define monitoring for the given service.

Output:
1. SLIs: request latency, error rate, throughput, saturation
2. Dashboards: key panels and why they matter
3. Alerts: symptom-based vs cause-based, thresholds, runbook links
4. Log-based metrics: what to count or trace
5. On-call expectations: page vs ticket, escalation

Use generic metric names; avoid vendor query languages unless asked.

```

# When NOT to use

- Batch jobs where the right signal is completion notifications, not real-time dashboards
- Third-party SaaS services the team cannot instrument
- Services already fully covered by a platform team’s golden signals

# Example

**Input:**

```
service: payment webhook processor
slos: '99.9% delivery within 30s, <0.1% error rate'
```

**Output:**

```markdown
## SLIs
- `webhook_latency_p99` < 30s
- `webhook_error_rate` < 0.1%
- `webhook_queue_depth` for saturation

## Alerts
- PAGE: error rate > 0.5% for 5 minutes
- TICKET: p99 latency > 20s for 10 minutes
- PAGE: queue depth > 10k for 5 minutes
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Alert fatigue from too many alerts**: Too many alerts cause responders to ignore them.
  - how to detect: alert volume is high but page rate is low
  - how to fix: use composite alerts, only page on actionable events

- **Symptom vs cause confusion**: Alerting on cause (database slow) instead of symptom (user-facing errors).
  - how to detect: on-call fixes the database but users are still affected
  - how to fix: alert on SLIs/SLOs, not infrastructure metrics alone

- **No runbook for alerts**: Alert fires but no one knows what to do.
  - how to detect: mean time to resolve increases during incidents
  - how to fix: link runbooks to every alert, update them after incidents

- **Static thresholds that drift**: Thresholds set once become outdated as traffic patterns change.
  - how to detect: alerts fire during normal peak traffic
  - how to fix: use dynamic thresholds or traffic-aware alerting

- **Missing dependency monitoring**: Service is healthy but its dependency is failing slowly.
  - how to detect: service alert fires but root cause is upstream
  - how to fix: monitor key dependencies separately
