---
slug: incident-postmortem
name: Incident Postmortem
version: 0.1.0
description: Draft a blameless postmortem from an incident timeline.
category: dev-tools
tags: ['incident', 'postmortem', 'sre', 'reliability']
inputs:
  - name: timeline
    type: string
    required: true
    description: Chronological incident timeline
  - name: impact
    type: string
    required: true
    description: User or business impact
output:
  format: markdown
  description: Blameless postmortem with summary, timeline, root cause, and action items.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

After resolving a production incident and before the team review meeting.

# Inputs

Provide the incident timeline and impact statement.

# Output

A structured postmortem document ready for team review.

# Prompt

```prompt
Draft a blameless postmortem from the provided timeline and impact.

Sections:
1. Summary: what happened, duration, impact
2. Timeline: reformatted in plain language with UTC timestamps
3. Root Cause: 5-Whys style, focused on systems not people
4. Impact: users affected, data lost, SLIs breached
5. Detection: how the incident was found, gaps in alerting
6. Recovery: steps taken, what worked, what slowed recovery
7. Action Items: owner, due date, priority; split into prevent/detect/respond
8. Lessons: one paragraph on what the team learned

Tone: blameless, specific, and forward-looking. No "someone should have".

```

# When NOT to use

- Security incidents that must follow a formal IR process and legal review
- Near-misses with no user impact and no repeatable lesson
- Incidents still in progress — wait until service is stable

# Example

**Input:**

```
timeline: '14:02 deploy; 14:05 error rate spike; 14:12 rollback; 14:20 recovery'
impact: 'Checkout API 503 for 18 minutes, ~1200 failed orders'
```

**Output:**

```markdown
## Summary
Checkout API returned 503s for 18 minutes after a deployment at 14:02 UTC.

## Root Cause
The new release added a required config that was missing in production. The service failed fast instead of defaulting.

## Action Items
- [P0] Add config validation at startup with a clear fatal log (owner: platform, due: 2026-06-28)
- [P1] Add canary deploy gate on checkout error rate (owner: sre, due: 2026-07-05)
```
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Blaming individuals**: Postmortems that focus on who failed rather than what failed.
  - how to detect: action items say "engineer should have" instead of "system should"
  - how to fix: focus on systemic causes, not human error

- **Root cause too shallow**: Stopping at the immediate cause without understanding why.
  - how to detect: same incident recurs with slightly different trigger
  - how to fix: apply 5 Whys, dig into contributing factors

- **No concrete action items**: "Improve monitoring" or "be more careful" aren't actionable.
  - how to detect: action items never get done
  - how to fix: make action items specific with owners and due dates

- **Timeline reconstruction fails**: Logs deleted or gaps make it impossible to reconstruct what happened.
  - how to detect: timeline has gaps during the incident window
  - how to fix: ensure logs are preserved, use structured logging with trace IDs

- **Lessons learned forgotten**: Action items completed but no one remembers why.
  - how to detect: similar incidents happen again because lessons weren't shared
  - how to fix: share postmortems broadly, review previous incidents before major changes
