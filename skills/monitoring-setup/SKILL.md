---
slug: monitoring-setup
name: Monitoring Setup
name_zh: 监控搭建
version: 0.1.0
description: Define metrics, dashboards, and alerts for a service.
description_zh: 为服务定义指标、仪表盘和告警。
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
