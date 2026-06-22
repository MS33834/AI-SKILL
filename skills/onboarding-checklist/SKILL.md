---
slug: onboarding-checklist
name: Onboarding Checklist
version: 0.1.0
description: Build a role-based onboarding checklist for a new team member.
category: documentation
tags: ['onboarding', 'checklist', 'team', 'docs']
inputs:
  - name: role
    type: string
    required: true
    description: e.g., backend engineer, designer, PM
  - name: team_context
    type: string
    required: false
    description: Team rituals, tools, and key repos
output:
  format: markdown
  description: A week-by-week onboarding checklist with owners and resources.
author: badhope
license: MIT
created: 2026-06-21
updated: 2026-06-21
---

# When to use

Hiring a new teammate, rotating someone into a team, or standardizing onboarding across squads.

# Inputs

State the role and any team-specific context.

# Output

A checklist organized by week with tasks, owners, and links/docs.

# Prompt

```prompt
Create a role-based onboarding checklist.

Output:
1. Pre-start: accounts, hardware, access requests
2. Week 1: people, rituals, codebase walkthrough, first commit
3. Week 2: domain deep-dive, on-call shadowing, first review
4. Week 3: own a small improvement, write docs, feedback session
5. Ongoing: 30/60/90-day goals

For each item include: task, owner (new hire vs buddy vs manager), and success criteria.

```

# When NOT to use

- Contractors on a single-day task
- Teams smaller than 3 people where onboarding is informal by necessity
- Roles governed by external compliance training that already provides a checklist

# Example

**Input:**

```
role: backend engineer
team_context: 'Go microservices, Postgres, Kafka, on-call rotation'
```

**Output:**

```markdown
## Week 1
- [ ] Get repo access (owner: manager, due: day 1)
- [ ] Local dev environment builds (owner: new hire, due: day 2)
- [ ] Pair with buddy on a bug fix (owner: buddy, due: day 4)
- [ ] Merge first PR (owner: new hire, due: day 5)

## Week 2
- [ ] Shadow on-call primary for one shift
- [ ] Read ADRs in `docs/architecture`
```

## Footguns

These are the bugs that bite every new user.
Check them before shipping:

- **Checklist too generic**: New hires get the same checklist as everyone else, not role-specific.
  - how to detect: checklist includes tasks irrelevant to the role
  - how to fix: customize checklist per role, remove generic fluff

- **No pre-start preparation**: New hire shows up day one with no accounts or access.
  - how to detect: new hire spends first day waiting for access instead of being productive
  - how to fix: assign pre-start tasks to manager, track completion before day one

- **Buddy not prepared**: Buddy doesn't know they're supposed to help or what to do.
  - how to detect: new hire feels abandoned the first week
  - how to fix: explicitly assign buddy role, give buddy a checklist too

- **Checklist never updated**: Old checklists accumulate tasks that no longer apply.
  - how to detect: tasks reference deprecated tools or discontinued processes
  - how to fix: review and prune checklist quarterly

- **Success criteria undefined**: "Complete onboarding" has no clear end state.
  - how to detect: new hire never feels "done" with onboarding
  - how to fix: define specific 30/60/90-day goals with measurable outcomes
