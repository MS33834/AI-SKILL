---
slug: onboarding-checklist
name: Onboarding Checklist
name_zh: 入职清单
version: 0.1.0
description: Build a role-based onboarding checklist for a new team member.
description_zh: 为新团队成员创建按角色分类的入职清单。
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
