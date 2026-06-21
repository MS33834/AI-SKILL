#!/usr/bin/env python3
"""Generate a batch of vendor-neutral skills for C4.

These skills are original to this repo, covering common software-engineering
and AI-agent workflows that are missing from the current local vault.
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO / "skills"
TODAY = "2026-06-21"

SKILLS: list[dict] = [
    {
        "slug": "api-design-review",
        "name": "API Design Review",
        "name_zh": "API 设计评审",
        "category": "dev-tools",
        "tags": ["api", "design", "review", "rest", "graphql"],
        "description": "Review an API design against consistency, versioning, auth, and error-handling best practices.",
        "description_zh": "按一致性、版本控制、认证和错误处理最佳实践评审 API 设计。",
        "inputs": [
            {"name": "api_spec", "type": "string", "required": True, "description": "OpenAPI spec, schema, or endpoint description"},
            {"name": "context", "type": "string", "required": False, "description": "Team conventions or existing API examples"},
        ],
        "output": {"format": "markdown", "description": "Review with severity-ranked findings and concrete recommendations."},
        "when_to_use": "Before publishing a new API, adding a breaking endpoint, or standardizing an existing surface.",
        "inputs_body": "Provide the API spec or endpoint list plus any team conventions the API should align with.",
        "output_body": "A markdown report: summary score, findings grouped by severity, and actionable recommendations with example rewrites.",
        "prompt": """You are a senior API architect reviewing the provided API design.

Evaluate across these dimensions:
1. Consistency: naming, paths, HTTP methods, status codes, error shapes
2. Versioning: strategy (URL / header / deprecation), breaking-change handling
3. Authentication & authorization: scheme choice, scope granularity
4. Error handling: structured errors, status-code correctness, retry signals
5. Pagination & filtering: cursor vs offset, query param design
6. Documentation: example requests/responses, required vs optional fields

Output format:

## Score: X/10

## Findings
- **[Severity] Title**: explanation and recommended fix

## Recommendations
1. ...
2. ...

Keep findings specific; avoid generic advice like "use REST".
""",
        "when_not_to_use": [
            "Internal-only prototypes that will be thrown away next week",
            "APIs where the team has already frozen the contract and cannot change",
            "GraphQL-specific schema stitching questions — use a dedicated GraphQL skill",
        ],
        "example_input": "api_spec: 'GET /users/{id}/orders?limit=20&page=1 returns 200 or 404'\ncontext: 'We use URL versioning and OAuth2 scopes'",
        "example_output": "## Score: 6/10\n\n## Findings\n- **[MED] Pagination uses page/limit**: prefer cursor-based pagination for high-churn collections.\n- **[HIGH] 404 for empty list**: returning 404 for no orders breaks client caching; return 200 with empty array.\n\n## Recommendations\n1. Replace `page` with `cursor` and return `next_cursor`.\n2. Standardize error schema to `{ error, message, code, request_id }`.",
    },
    {
        "slug": "error-handling-guide",
        "name": "Error Handling Guide",
        "name_zh": "错误处理指南",
        "category": "dev-tools",
        "tags": ["errors", "exceptions", "reliability", "logging"],
        "description": "Draft a language-agnostic error-handling strategy for a module or service.",
        "description_zh": "为模块或服务起草一份与语言无关的错误处理策略。",
        "inputs": [
            {"name": "language", "type": "string", "required": True, "description": "Primary language or runtime"},
            {"name": "component", "type": "string", "required": True, "description": "Service or module boundary"},
        ],
        "output": {"format": "markdown", "description": "Strategy covering taxonomy, retries, propagation, and observability."},
        "when_to_use": "When building a new service, refactoring exception-heavy code, or defining retry/timeout policies.",
        "inputs_body": "Name the language/runtime and the component boundary (e.g., payment gateway, ingestion worker).",
        "output_body": "A strategy document with error taxonomy, retry rules, propagation patterns, and observability hooks.",
        "prompt": """Draft an error-handling strategy for the given language and component.

Cover:
1. Error taxonomy: user input, transient infra, dependency, bug/programmer error
2. Exception vs result type: when to use each in the named language
3. Retry policy: which errors are retryable, backoff, idempotency keys
4. Propagation: what to expose to callers vs what to mask
5. Logging: required context fields, safe vs unsafe data
6. Metrics: counters and labels for alerting

Output:

## Error Taxonomy
...

## Retry Policy
...

## Caller Contract
...

## Observability
...

Be concrete: reference language idioms (e.g., Result<T,E>, try/catch, checked exceptions).
""",
        "when_not_to_use": [
            "Frontend-only UI validation logic where native form errors suffice",
            "One-off scripts without production traffic",
            "Teams that have already adopted a company-wide framework like Spring Boot or Temporal",
        ],
        "example_input": "language: Python\ncomponent: payment webhook processor",
        "example_output": "## Error Taxonomy\n- UserInputError: 4xx from merchant, do not retry\n- TransientError: 5xx / timeout, retry with exponential backoff up to 3 times\n- DependencyError: database lock, retry once after jitter\n\n## Retry Policy\nUse tenacity with `@retry(stop=stop_after_attempt(3), wait=wait_exponential_jitter(...))`. Mark idempotent endpoints only.\n\n## Caller Contract\nReturn `{ ok: false, error_code, retryable }`. Never leak stack traces.",
    },
    {
        "slug": "logging-best-practices",
        "name": "Logging Best Practices",
        "name_zh": "日志最佳实践",
        "category": "dev-tools",
        "tags": ["logging", "observability", "structured", "debugging"],
        "description": "Define a structured logging convention for a service or library.",
        "description_zh": "为服务或库定义结构化日志规范。",
        "inputs": [
            {"name": "runtime", "type": "string", "required": True, "description": "Language or framework"},
            {"name": "sensitive_fields", "type": "array", "required": False, "description": "Fields that must be redacted"},
        ],
        "output": {"format": "markdown", "description": "Log levels, field schema, redaction rules, and sample entries."},
        "when_to_use": "Bootstrapping observability, onboarding a new service, or standardizing logs across a team.",
        "inputs_body": "State the runtime and list any fields that must never appear in logs.",
        "output_body": "A convention doc with levels, required fields, redaction rules, and sample log lines.",
        "prompt": """Create a structured logging convention for the given runtime.

Include:
1. Log levels and when to use each (DEBUG, INFO, WARN, ERROR)
2. Required base fields: timestamp (ISO8601), level, service, trace_id, span_id
3. Message style: sentence case, no interpolation, static keys
4. Redaction: how to handle the listed sensitive fields
5. Context propagation: request-scoped fields, thread-local / async context
6. Performance: when to sample, when to avoid logging in hot paths
7. Three sample log entries (INFO start, WARN degraded, ERROR failure)

Output format:

## Levels
...

## Base Schema
...

## Redaction
...

## Samples
...

Avoid vendor-specific logger syntax unless it is the runtime's de-facto standard.
""",
        "when_not_to_use": [
            "Client-side browser extensions where privacy law forbids logging",
            "Embedded devices with extreme storage constraints",
            "Teams already locked into a platform like Datadog Agent with auto-instrumentation",
        ],
        "example_input": "runtime: Go\nsensitive_fields: [password, ssn, token, cvv]",
        "example_output": "## Levels\n- DEBUG: per-request details, sampled to 1% in production\n- INFO: state changes and handoffs\n- WARN: recoverable degradation\n- ERROR: failed requests requiring human review\n\n## Base Schema\n`{time, level, msg, svc, trace_id, span_id, duration_ms}`\n\n## Redaction\nMask values for keys matching `*password*`, `*token*`, `*ssn*`, `*cvv*`; replace with `[REDACTED]`.",
    },
    {
        "slug": "dependency-update",
        "name": "Dependency Update",
        "name_zh": "依赖升级",
        "category": "dev-tools",
        "tags": ["dependencies", "upgrade", "security", "semver"],
        "description": "Plan and execute a low-risk dependency update for a project.",
        "description_zh": "为项目规划和执行低风险的依赖升级。",
        "inputs": [
            {"name": "package_manager", "type": "string", "required": True, "description": "npm, pip, cargo, etc."},
            {"name": "dependencies", "type": "string", "required": True, "description": "List of packages to update with current and target versions"},
        ],
        "output": {"format": "markdown", "description": "Step-by-step update plan with rollback instructions."},
        "when_to_use": "Before bumping major versions, applying security patches, or refreshing stale lock files.",
        "inputs_body": "Provide the package manager and the dependency list with current/target versions.",
        "output_body": "A plan covering grouping order, test strategy, breaking-change checks, and rollback steps.",
        "prompt": """You are a dependency-maintenance engineer. Produce a safe update plan.

Inputs:
- Package manager and its lockfile
- Dependencies to update with current and target versions

Output sections:
1. Grouping strategy: which updates to batch vs isolate
2. Pre-flight checks: changelog review, deprecation scan, CVE lookup
3. Update commands: exact CLI steps for the package manager
4. Validation: tests to run, smoke checks, canary rollout
5. Breaking-change remediation: common patterns to watch for
6. Rollback: how to revert the lockfile and code changes

Use concrete commands. Do not invent changelogs; tell the user where to find them.
""",
        "when_not_to_use": [
            "Libraries where consumers pin the dependency and you only control devDeps",
            "Emergency patches that should go through the team's incident process instead",
            "Monorepos with unpublished internal packages — coordinate with those owners first",
        ],
        "example_input": "package_manager: npm\ndependencies: 'eslint 8.x -> 9.x, vite 5.x -> 6.x'",
        "example_output": "## Grouping\n- Isolate eslint 9 migration (config format changed).\n- Batch vite with related plugins after eslint is green.\n\n## Pre-flight\n1. Read eslint 9 migration guide and vite 6 changelog.\n2. Run `npm audit` and note direct CVEs.\n\n## Commands\n```bash\nnpm install eslint@9 --save-dev\nnpx @eslint/migrate-config .eslintrc.js\n```",
    },
    {
        "slug": "documentation-structure",
        "name": "Documentation Structure",
        "name_zh": "文档结构",
        "category": "documentation",
        "tags": ["docs", "structure", "readme", "onboarding"],
        "description": "Design a documentation outline for a project or feature.",
        "description_zh": "为项目或功能设计文档大纲。",
        "inputs": [
            {"name": "project_type", "type": "string", "required": True, "description": "Library, service, CLI, etc."},
            {"name": "audiences", "type": "array", "required": False, "description": "e.g., users, contributors, operators"},
        ],
        "output": {"format": "markdown", "description": "A docs outline with page titles, purposes, and cross-links."},
        "when_to_use": "Starting a new project, reorganizing scattered docs, or preparing for open-source release.",
        "inputs_body": "Describe the project type and primary audiences.",
        "output_body": "A hierarchical docs outline with each page's goal and suggested cross-links.",
        "prompt": """Design a documentation structure for the given project type and audiences.

Output:
1. Top-level sections (e.g., Getting Started, API Reference, Operations)
2. Each page title and one-sentence purpose
3. Cross-links between pages
4. One README outline (the entry point)
5. Notes on what NOT to put in docs vs code comments

Keep the structure actionable. Avoid generic sections that do not serve the audiences.
""",
        "when_not_to_use": [
            "Internal one-pager experiments that will not be maintained",
            "Projects whose docs are auto-generated from code and require no narrative",
            "Cases where the team has already adopted a docs-as-code toolchain with mandatory templates",
        ],
        "example_input": "project_type: Python library\naudiences: [users, contributors]",
        "example_output": "## Docs Outline\n- README: one-line pitch, install, quickstart, badges\n- `docs/getting-started.md`: first 5 minutes\n- `docs/api.md`: auto-generated from docstrings\n- `docs/examples.md`: 3 end-to-end recipes\n- `docs/contributing.md`: dev setup, test commands, release process\n\n## Cross-links\nREADME quickstart → examples → API reference",
    },
    {
        "slug": "incident-postmortem",
        "name": "Incident Postmortem",
        "name_zh": "事故复盘",
        "category": "dev-tools",
        "tags": ["incident", "postmortem", "sre", "reliability"],
        "description": "Draft a blameless postmortem from an incident timeline.",
        "description_zh": "从事故时间线起草一份无责复盘报告。",
        "inputs": [
            {"name": "timeline", "type": "string", "required": True, "description": "Chronological incident timeline"},
            {"name": "impact", "type": "string", "required": True, "description": "User or business impact"},
        ],
        "output": {"format": "markdown", "description": "Blameless postmortem with summary, timeline, root cause, and action items."},
        "when_to_use": "After resolving a production incident and before the team review meeting.",
        "inputs_body": "Provide the incident timeline and impact statement.",
        "output_body": "A structured postmortem document ready for team review.",
        "prompt": """Draft a blameless postmortem from the provided timeline and impact.

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
""",
        "when_not_to_use": [
            "Security incidents that must follow a formal IR process and legal review",
            "Near-misses with no user impact and no repeatable lesson",
            "Incidents still in progress — wait until service is stable",
        ],
        "example_input": "timeline: '14:02 deploy; 14:05 error rate spike; 14:12 rollback; 14:20 recovery'\nimpact: 'Checkout API 503 for 18 minutes, ~1200 failed orders'",
        "example_output": "## Summary\nCheckout API returned 503s for 18 minutes after a deployment at 14:02 UTC.\n\n## Root Cause\nThe new release added a required config that was missing in production. The service failed fast instead of defaulting.\n\n## Action Items\n- [P0] Add config validation at startup with a clear fatal log (owner: platform, due: 2026-06-28)\n- [P1] Add canary deploy gate on checkout error rate (owner: sre, due: 2026-07-05)",
    },
    {
        "slug": "onboarding-checklist",
        "name": "Onboarding Checklist",
        "name_zh": "入职清单",
        "category": "documentation",
        "tags": ["onboarding", "checklist", "team", "docs"],
        "description": "Build a role-based onboarding checklist for a new team member.",
        "description_zh": "为新团队成员创建按角色分类的入职清单。",
        "inputs": [
            {"name": "role", "type": "string", "required": True, "description": "e.g., backend engineer, designer, PM"},
            {"name": "team_context", "type": "string", "required": False, "description": "Team rituals, tools, and key repos"},
        ],
        "output": {"format": "markdown", "description": "A week-by-week onboarding checklist with owners and resources."},
        "when_to_use": "Hiring a new teammate, rotating someone into a team, or standardizing onboarding across squads.",
        "inputs_body": "State the role and any team-specific context.",
        "output_body": "A checklist organized by week with tasks, owners, and links/docs.",
        "prompt": """Create a role-based onboarding checklist.

Output:
1. Pre-start: accounts, hardware, access requests
2. Week 1: people, rituals, codebase walkthrough, first commit
3. Week 2: domain deep-dive, on-call shadowing, first review
4. Week 3: own a small improvement, write docs, feedback session
5. Ongoing: 30/60/90-day goals

For each item include: task, owner (new hire vs buddy vs manager), and success criteria.
""",
        "when_not_to_use": [
            "Contractors on a single-day task",
            "Teams smaller than 3 people where onboarding is informal by necessity",
            "Roles governed by external compliance training that already provides a checklist",
        ],
        "example_input": "role: backend engineer\nteam_context: 'Go microservices, Postgres, Kafka, on-call rotation'",
        "example_output": "## Week 1\n- [ ] Get repo access (owner: manager, due: day 1)\n- [ ] Local dev environment builds (owner: new hire, due: day 2)\n- [ ] Pair with buddy on a bug fix (owner: buddy, due: day 4)\n- [ ] Merge first PR (owner: new hire, due: day 5)\n\n## Week 2\n- [ ] Shadow on-call primary for one shift\n- [ ] Read ADRs in `docs/architecture`",
    },
    {
        "slug": "refactoring-strategy",
        "name": "Refactoring Strategy",
        "name_zh": "重构策略",
        "category": "dev-tools",
        "tags": ["refactoring", "legacy", "strategy", "testing"],
        "description": "Plan a safe refactoring for a tangled module or legacy service.",
        "description_zh": "为纠缠的模块或遗留服务规划安全重构。",
        "inputs": [
            {"name": "target", "type": "string", "required": True, "description": "Module or service to refactor"},
            {"name": "pain_points", "type": "string", "required": True, "description": "Current problems and risks"},
        ],
        "output": {"format": "markdown", "description": "Refactoring plan with sequencing, test strategy, and rollback points."},
        "when_to_use": "Before touching legacy code with no tests, extracting a service, or paying down tech debt.",
        "inputs_body": "Describe the target module and the pain points driving the refactor.",
        "output_body": "A phased refactoring plan with tests, sequencing, and rollback points.",
        "prompt": """Create a safe refactoring plan.

Sections:
1. Goal: one sentence on what good looks like
2. Current State: risks, coupling, test coverage
3. Sequencing: smallest safe steps in order; each step should be shippable
4. Tests: characterization tests, contract tests, approval tests
5. Rollback: how to revert each step if things go wrong
6. Validation: metrics or behavior checks after each step
7. Common traps: big-bang rewrites, refactoring under active feature work

Keep steps concrete and small enough to review in a single PR.
""",
        "when_not_to_use": [
            "Code that is about to be deleted or replaced entirely",
            "Hotfixes where behavior must change immediately",
            "Modules with active regulatory audit freeze",
        ],
        "example_input": "target: order-service checkout module\npain_points: 'No tests, direct DB queries mixed with business logic, circular imports'",
        "example_output": "## Goal\nSeparate persistence from business logic and add characterization tests.\n\n## Sequencing\n1. Add golden-master approval tests for existing responses.\n2. Extract pure functions from checkout flow (no DB access).\n3. Introduce repository layer behind an interface.\n4. Move SQL into repository implementations.\n5. Remove circular imports by inverting a dependency.",
    },
    {
        "slug": "test-planning",
        "name": "Test Planning",
        "name_zh": "测试规划",
        "category": "dev-tools",
        "tags": ["testing", "qa", "plan", "coverage"],
        "description": "Design a test plan for a feature or release.",
        "description_zh": "为功能或发布设计测试方案。",
        "inputs": [
            {"name": "feature", "type": "string", "required": True, "description": "Feature or release under test"},
            {"name": "risks", "type": "string", "required": False, "description": "Known risks and edge cases"},
        ],
        "output": {"format": "markdown", "description": "Test plan with scope, levels, cases, and exit criteria."},
        "when_to_use": "Before a major release, introducing a critical path, or handing off to QA.",
        "inputs_body": "Describe the feature and any known risks or edge cases.",
        "output_body": "A test plan with scope, levels, cases, environments, and exit criteria.",
        "prompt": """Design a test plan for the given feature.

Include:
1. Scope: in-scope and out-of-scope functionality
2. Test levels: unit, integration, contract, e2e, exploratory
3. Test cases: happy path, edge cases, negative cases, regression checks
4. Environments and data: prod-like fixtures, PII handling
5. Automation: what to automate vs manual
6. Exit criteria: coverage gates, bug severity thresholds, sign-off
7. Risks: top 3 testing risks and mitigations

Output in a format ready to paste into a ticket or test management tool.
""",
        "when_not_to_use": [
            "Spikes and prototypes that will not ship",
            "Pure refactorings with no behavior change — rely on existing tests",
            "Changes covered entirely by an established automated test matrix",
        ],
        "example_input": "feature: new subscription cancellation flow\nrisks: 'prorated refunds, third-party billing webhooks, idempotency'",
        "example_output": "## Scope\nIn: user-initiated cancellation, prorated refund calculation, webhook retry.\nOut: chargeback flow.\n\n## Test Levels\n- Unit: refund math, idempotency key handling\n- Integration: billing service contract, database state transitions\n- E2E: user cancels via UI and sees confirmation\n\n## Exit Criteria\n- 90% diff coverage on cancellation module\n- Zero P0/P1 bugs open\n- Webhook retry tested with simulated 5xx",
    },
    {
        "slug": "code-performance-review",
        "name": "Code Performance Review",
        "name_zh": "代码性能评审",
        "category": "dev-tools",
        "tags": ["performance", "profiling", "optimization", "review"],
        "description": "Review code for performance bottlenecks and suggest measured optimizations.",
        "description_zh": "评审代码性能瓶颈并提出可测量的优化建议。",
        "inputs": [
            {"name": "code", "type": "string", "required": True, "description": "Code snippet or function to review"},
            {"name": "constraints", "type": "string", "required": False, "description": "Latency, memory, or throughput targets"},
        ],
        "output": {"format": "markdown", "description": "Bottleneck analysis with profiling suggestions and optimized code."},
        "when_to_use": "Hot path review, latency regression investigation, or before scaling a service.",
        "inputs_body": "Provide the code and any performance constraints.",
        "output_body": "A review with identified bottlenecks, measurement strategy, and suggested code changes.",
        "prompt": """Review the provided code for performance issues.

For each issue:
1. Identify the bottleneck (algorithmic, I/O, memory, concurrency)
2. Estimate impact in Big-O or approximate latency/memory terms
3. Suggest a measured optimization
4. Provide a code snippet if the change is local

Also include:
- How to profile/measure before and after
- When NOT to optimize (e.g., clarity trade-off, non-hot path)
- Risk of premature optimization

Output:

## Bottlenecks
...

## Recommendations
...

## Measurement Plan
...
""",
        "when_not_to_use": [
            "One-off scripts or background jobs without latency requirements",
            "Code that is already fast enough per the agreed SLO",
            "Prototype code where readability matters more than throughput",
        ],
        "example_input": "code: 'def find_duplicates(items): return [x for x in items if items.count(x) > 1]'\nconstraints: 'List up to 1M items, must complete under 500ms'",
        "example_output": "## Bottlenecks\n`items.count(x)` inside a list comprehension is O(n²).\n\n## Recommendations\nUse a Counter:\n```python\nfrom collections import Counter\ncounts = Counter(items)\nreturn [x for x, c in counts.items() if c > 1]\n```\n\n## Measurement\nProfile with `timeit` on a 1M-item list; target <100ms.",
    },
    {
        "slug": "accessibility-audit",
        "name": "Accessibility Audit",
        "name_zh": "可访问性审计",
        "category": "dev-tools",
        "tags": ["a11y", "accessibility", "wcag", "frontend"],
        "description": "Audit a UI or component for accessibility issues and fixes.",
        "description_zh": "审计 UI 或组件的可访问性问题并给出修复方案。",
        "inputs": [
            {"name": "ui_description", "type": "string", "required": True, "description": "Description or markup of the UI"},
            {"name": "wcag_level", "type": "enum", "required": False, "values": ["A", "AA", "AAA"], "default": "AA", "description": "Target WCAG conformance level"},
        ],
        "output": {"format": "markdown", "description": "Accessibility findings mapped to WCAG criteria with fix examples."},
        "when_to_use": "Before shipping a new UI, reviewing a component library, or responding to an a11y bug.",
        "inputs_body": "Describe the UI and target WCAG level.",
        "output_body": "Findings mapped to WCAG criteria with severity and example fixes.",
        "prompt": """Audit the described UI for accessibility against the target WCAG level.

Check:
1. Keyboard navigation: tab order, focus indicators, trap avoidance
2. Screen readers: labels, headings, landmarks, live regions
3. Color: contrast ratios, not color-only information
4. Motion: reduced-motion support, no auto-playing content
5. Forms: labels, error association, required field indication
6. Touch/target sizes for mobile

Output:

## Findings
- **[Severity] WCAG X.X.X**: issue + fix example

## Manual Tests
List 3-5 manual checks a human should perform.

## Tools
Suggest automated tools appropriate for the UI stack.
""",
        "when_not_to_use": [
            "Backend-only services with no user interface",
            "Internal admin tools with a known narrow user base and separate audit process",
            "PDFs or documents where the audit scope is document remediation, not UI",
        ],
        "example_input": "ui_description: 'A modal dialog with a form, opened by a button. The close button is an icon only.'\nwcag_level: AA",
        "example_output": "## Findings\n- **[HIGH] WCAG 4.1.2**: icon-only close button lacks accessible name. Fix: `aria-label=\"Close\"`.\n- **[MED] WCAG 2.4.3**: focus should move to the modal heading on open.\n- **[MED] WCAG 2.4.7**: ensure visible focus ring on all interactive elements.",
    },
    {
        "slug": "data-migration-plan",
        "name": "Data Migration Plan",
        "name_zh": "数据迁移方案",
        "category": "dev-tools",
        "tags": ["migration", "database", "data", "planning"],
        "description": "Plan a safe data migration between schemas, formats, or systems.",
        "description_zh": "规划schema、格式或系统之间的安全数据迁移。",
        "inputs": [
            {"name": "source_target", "type": "string", "required": True, "description": "Source and target systems/schemas"},
            {"name": "volume", "type": "string", "required": False, "description": "Data volume and downtime tolerance"},
        ],
        "output": {"format": "markdown", "description": "Migration plan with phases, rollback, and validation."},
        "when_to_use": "Changing a database schema, moving to a new store, or merging datasets.",
        "inputs_body": "Describe source/target systems and data volume/downtime constraints.",
        "output_body": "A phased migration plan with rollback and validation steps.",
        "prompt": """Create a data migration plan.

Sections:
1. Overview: source, target, volume, downtime tolerance
2. Migration strategy: big-bang vs incremental vs dual-write vs backfill
3. Phases: schema changes, code changes, data copy, verification, cutover
4. Validation: row counts, checksums, sample comparisons, query parity
5. Rollback: how to revert at each phase
6. Risk mitigation: locks, batch sizes, observability, communication plan

Keep it practical. Include example SQL or pseudo-code only if it clarifies the plan.
""",
        "when_not_to_use": [
            "Migrations handled by managed services with zero-downtime guarantees and their own runbooks",
            "Small config or metadata changes that do not move user data",
            "Data deletion requests governed by privacy policy rather than migration process",
        ],
        "example_input": "source_target: 'PostgreSQL orders table v1 -> v2 with denormalized total'\nvolume: '50M rows, downtime tolerance 5 minutes'",
        "example_output": "## Strategy\nIncremental backfill with dual-write: new writes go to both schemas, backfill in batches.\n\n## Phases\n1. Add v2 columns and triggers for dual-write.\n2. Backfill existing rows in 100k-row batches during low traffic.\n3. Validate row counts and checksums per batch.\n4. Switch reads to v2, monitor for 24h.\n5. Remove v1 columns in a follow-up deploy.",
    },
    {
        "slug": "feature-flag-strategy",
        "name": "Feature Flag Strategy",
        "name_zh": "功能开关策略",
        "category": "dev-tools",
        "tags": ["feature-flags", "release", "testing", "rollback"],
        "description": "Design a feature-flag rollout strategy for a new feature.",
        "description_zh": "为新功能设计功能开关发布策略。",
        "inputs": [
            {"name": "feature", "type": "string", "required": True, "description": "Feature to roll out"},
            {"name": "audiences", "type": "string", "required": False, "description": "Target audiences or segments"},
        ],
        "output": {"format": "markdown", "description": "Rollout plan with flag taxonomy, stages, and cleanup."},
        "when_to_use": "Shipping a risky feature, doing a canary release, or enabling gradual rollout.",
        "inputs_body": "Describe the feature and target audiences.",
        "output_body": "A flag strategy with taxonomy, rollout stages, and cleanup checklist.",
        "prompt": """Design a feature-flag rollout strategy.

Output:
1. Flag taxonomy: release flag, experiment flag, ops flag, kill switch
2. Rollout stages: dev, internal, beta, percentage, general availability
3. Targeting rules: user segments, regions, subscription tiers
4. Metrics: success criteria and guardrail metrics
5. Rollback: kill-switch procedure and rollback criteria
6. Cleanup: when to remove the flag and associated dead code
7. Naming convention for the flag

Avoid vendor-specific SDK syntax unless necessary.
""",
        "when_not_to_use": [
            "Static configuration that never changes at runtime",
            "Features that must be globally on or off with no middle state",
            "Teams without a flag-management service or database-backed config",
        ],
        "example_input": "feature: new checkout page\naudiences: 'internal employees, 5% beta users, all users'",
        "example_output": "## Flag Taxonomy\n`checkout_v2` is a release flag; `checkout_v2_experiment` is an experiment flag.\n\n## Stages\n1. Dev: flag on for team only\n2. Internal: employees for 1 week\n3. Beta: 5% of users, watch conversion and error rate\n4. GA: 100% rollout\n\n## Cleanup\nRemove flag and old checkout code 2 weeks after GA.",
    },
    {
        "slug": "monitoring-setup",
        "name": "Monitoring Setup",
        "name_zh": "监控搭建",
        "category": "dev-tools",
        "tags": ["monitoring", "observability", "metrics", "alerts"],
        "description": "Define metrics, dashboards, and alerts for a service.",
        "description_zh": "为服务定义指标、仪表盘和告警。",
        "inputs": [
            {"name": "service", "type": "string", "required": True, "description": "Service or component to monitor"},
            {"name": "slos", "type": "string", "required": False, "description": "SLOs or user-facing goals"},
        ],
        "output": {"format": "markdown", "description": "Monitoring plan with SLIs, dashboards, and alert rules."},
        "when_to_use": "Launching a new service, revising on-call coverage, or refining alert fatigue.",
        "inputs_body": "Describe the service and any SLOs.",
        "output_body": "A monitoring plan with SLIs, dashboards, and alert rules.",
        "prompt": """Define monitoring for the given service.

Output:
1. SLIs: request latency, error rate, throughput, saturation
2. Dashboards: key panels and why they matter
3. Alerts: symptom-based vs cause-based, thresholds, runbook links
4. Log-based metrics: what to count or trace
5. On-call expectations: page vs ticket, escalation

Use generic metric names; avoid vendor query languages unless asked.
""",
        "when_not_to_use": [
            "Batch jobs where the right signal is completion notifications, not real-time dashboards",
            "Third-party SaaS services the team cannot instrument",
            "Services already fully covered by a platform team’s golden signals",
        ],
        "example_input": "service: payment webhook processor\nslos: '99.9% delivery within 30s, <0.1% error rate'",
        "example_output": "## SLIs\n- `webhook_latency_p99` < 30s\n- `webhook_error_rate` < 0.1%\n- `webhook_queue_depth` for saturation\n\n## Alerts\n- PAGE: error rate > 0.5% for 5 minutes\n- TICKET: p99 latency > 20s for 10 minutes\n- PAGE: queue depth > 10k for 5 minutes",
    },
    {
        "slug": "backup-recovery-checklist",
        "name": "Backup Recovery Checklist",
        "name_zh": "备份恢复清单",
        "category": "dev-tools",
        "tags": ["backup", "recovery", "disaster-recovery", "reliability"],
        "description": "Create a backup and recovery checklist for a datastore or service.",
        "description_zh": "为数据存储或服务创建备份与恢复清单。",
        "inputs": [
            {"name": "datastore", "type": "string", "required": True, "description": "Database, object store, or service"},
            {"name": "rto_rpo", "type": "string", "required": False, "description": "Recovery time and point objectives"},
        ],
        "output": {"format": "markdown", "description": "Backup strategy and step-by-step recovery runbook."},
        "when_to_use": "Productionizing a datastore, preparing for compliance, or before a disaster-recovery drill.",
        "inputs_body": "Describe the datastore and RTO/RPO targets.",
        "output_body": "A checklist covering backup schedule, retention, encryption, testing, and recovery steps.",
        "prompt": """Create a backup and recovery checklist.

Output:
1. Backup scope: what to back up and what to exclude
2. Schedule and retention: frequency, lifecycle, off-site copies
3. Encryption and access control
4. Monitoring: verify backup success and freshness
5. Recovery runbook: step-by-step restore procedure
6. Testing schedule: how often to run a restore drill
7. Escalation: who to contact if restore fails

Do not include actual credentials or keys.
""",
        "when_not_to_use": [
            "Stateless services with no persistent data",
            "Data fully managed by a cloud provider with built-in point-in-time recovery",
            "Short-lived caches that can be rebuilt from source",
        ],
        "example_input": "datastore: PostgreSQL primary\nrto_rpo: 'RTO 1h, RPO 15min'",
        "example_output": "## Backup Schedule\n- Continuous WAL archiving to object storage\n- Full base backup nightly, retained for 30 days\n\n## Recovery Runbook\n1. Provision new instance from latest base backup.\n2. Replay WAL to desired point in time.\n3. Verify data checksums and run smoke queries.\n4. Redirect application DNS/connection string.\n\n## Testing\nRun restore drill monthly in staging.",
    },
    {
        "slug": "dependency-vulnerability-response",
        "name": "Dependency Vulnerability Response",
        "name_zh": "依赖漏洞响应",
        "category": "guardrails",
        "tags": ["security", "vulnerability", "dependencies", "cve"],
        "description": "Respond to a reported CVE in a project dependency.",
        "description_zh": "响应项目依赖中报告的 CVE。",
        "inputs": [
            {"name": "cve", "type": "string", "required": True, "description": "CVE identifier and dependency"},
            {"name": "exposure", "type": "string", "required": True, "description": "How the dependency is used"},
        ],
        "output": {"format": "markdown", "description": "Response plan with triage, mitigation options, and verification."},
        "when_to_use": "A scanner reports a CVE, a security advisory is published, or during a security review.",
        "inputs_body": "Provide the CVE/dependency and how the project uses it.",
        "output_body": "A triage and mitigation plan with verification steps.",
        "prompt": """Respond to a dependency vulnerability.

Output:
1. Triage: severity, exploitability in this project's usage, affected versions
2. Options: upgrade, patch, remove, workaround, accept risk
3. Decision: recommended path with rationale
4. Verification: how to confirm the fix (scanner output, test, code review)
5. Communication: who to notify and timeline
6. Prevention: how to catch similar issues earlier

Do not download or execute exploit code.
""",
        "when_not_to_use": [
            "Vulnerabilities in development-only tools with no production exposure",
            "False positives from scanners without a published advisory",
            "Issues already tracked by a dedicated security team with an existing runbook",
        ],
        "example_input": "cve: 'CVE-2024-1234 in lodash < 4.17.21'\nexposure: 'Used for object merging in request handlers'",
        "example_output": "## Triage\nSeverity: HIGH. Affects deep merge in request parsing; exploitable if user input reaches merge.\n\n## Options\n1. Upgrade to lodash 4.17.21 (preferred).\n2. Replace with native structuredClone where applicable.\n\n## Verification\nRun `npm audit`; confirm lodash version in lockfile. Add a test with a malicious payload shape.",
    },
    {
        "slug": "api-versioning",
        "name": "API Versioning",
        "name_zh": "API 版本控制",
        "category": "dev-tools",
        "tags": ["api", "versioning", "backward-compatibility", "design"],
        "description": "Design a versioning and deprecation strategy for an API.",
        "description_zh": "为 API 设计版本控制和弃用策略。",
        "inputs": [
            {"name": "api_type", "type": "string", "required": True, "description": "REST, GraphQL, gRPC, etc."},
            {"name": "breaking_changes", "type": "string", "required": False, "description": "Known or anticipated breaking changes"},
        ],
        "output": {"format": "markdown", "description": "Versioning strategy with URL/header design and deprecation policy."},
        "when_to_use": "Launching a public API, planning a breaking change, or standardizing versioning.",
        "inputs_body": "Describe the API type and any breaking changes.",
        "output_body": "A versioning strategy with mechanism, deprecation policy, and migration guide outline.",
        "prompt": """Design an API versioning strategy.

Cover:
1. Versioning mechanism: URL path, header, query param, or content negotiation
2. Version lifecycle: current, deprecated, sunset
3. Breaking-change policy: what counts as breaking
4. Deprecation communication: headers, docs, emails, SDK changelogs
5. Migration guide template
6. Exception handling: when to allow unversioned requests

Output in a format ready for an API design doc.
""",
        "when_not_to_use": [
            "Internal-only APIs where client and server are always deployed together",
            "GraphQL APIs that prefer schema evolution over versioning",
            " APIs with a single client controlled by the same team and no public consumers",
        ],
        "example_input": "api_type: REST\nbreaking_changes: 'Removing enum values, changing field semantics'",
        "example_output": "## Mechanism\nURL path: `/v1/resources`, `/v2/resources`.\n\n## Lifecycle\n- Current: latest stable version\n- Deprecated: 6-month notice, `Sunset` header in responses\n- Sunset: returns 410 Gone with migration link\n\n## Breaking Changes\nRequire a new major version: removing fields, changing types, removing enum values.",
    },
    {
        "slug": "database-index-review",
        "name": "Database Index Review",
        "name_zh": "数据库索引评审",
        "category": "dev-tools",
        "tags": ["database", "index", "performance", "sql"],
        "description": "Review a query or schema for missing, redundant, or misused indexes.",
        "description_zh": "评审查询或 schema 中缺失、冗余或误用的索引。",
        "inputs": [
            {"name": "query", "type": "string", "required": True, "description": "SQL query or schema snippet"},
            {"name": "dbms", "type": "string", "required": True, "description": "PostgreSQL, MySQL, etc."},
        ],
        "output": {"format": "markdown", "description": "Index recommendations with rationale and trade-offs."},
        "when_to_use": "Slow query investigation, schema design review, or before adding an index.",
        "inputs_body": "Provide the query/schema and the database system.",
        "output_body": "Index recommendations with rationale, trade-offs, and example DDL.",
        "prompt": """Review the query/schema for index opportunities.

For each recommendation:
1. Identify the access pattern
2. Recommend an index type (B-tree, partial, covering, composite)
3. Provide example DDL
4. Note trade-offs: write overhead, storage, lock impact
5. Flag redundant or unused indexes if visible

Also warn about common mistakes: indexing low-cardinality columns alone, over-indexing, ignoring sort order.

Output:

## Recommendations
...

## Trade-offs
...
""",
        "when_not_to_use": [
            "Ad-hoc analytics queries on read replicas where sequential scans are acceptable",
            "Tables with fewer than 1,000 rows where indexes add overhead without benefit",
            "NoSQL stores where the access model is fundamentally different",
        ],
        "example_input": "query: 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'\ndbms: PostgreSQL",
        "example_output": "## Recommendations\nCreate a composite index:\n```sql\nCREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);\n```\n\n## Trade-offs\nWrite overhead on inserts/updates to orders table; monitor index bloat monthly.",
    },
    {
        "slug": "microservice-boundary-review",
        "name": "Microservice Boundary Review",
        "name_zh": "微服务边界评审",
        "category": "dev-tools",
        "tags": ["microservices", "architecture", "bounded-context", "design"],
        "description": "Evaluate whether a proposed service boundary is coherent and low-coupling.",
        "description_zh": "评估提议的服务边界是否内聚且低耦合。",
        "inputs": [
            {"name": "proposed_service", "type": "string", "required": True, "description": "Service responsibility and data ownership"},
            {"name": "collaborators", "type": "string", "required": False, "description": "Other services it must call"},
        ],
        "output": {"format": "markdown", "description": "Boundary assessment with coupling risks and alternatives."},
        "when_to_use": "Splitting a monolith, adding a new service, or reviewing a service's scope creep.",
        "inputs_body": "Describe the proposed service and its collaborators.",
        "output_body": "An assessment of cohesion, coupling, data ownership, and suggested alternatives.",
        "prompt": """Evaluate a proposed microservice boundary.

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
""",
        "when_not_to_use": [
            "Small teams where microservices create more overhead than value",
            "Greenfield projects without clear domain boundaries",
            "Temporary integrations that will be replaced within a quarter",
        ],
        "example_input": "proposed_service: 'notification service owning email/sms/push templates and delivery'\ncollaborators: 'user-service, order-service, billing-service'",
        "example_output": "## Verdict\nKeep, but split template management from delivery if scale differs.\n\n## Risks\n- Fan-out to 3 services for personalization data.\n- Delivery retries could saturate user-service during incidents.\n\n## Recommendations\n- Cache user preferences locally.\n- Use async events for order/billing triggers.\n- Keep template CRUD synchronous for authoring UX.",
    },
    {
        "slug": "schema-evolution",
        "name": "Schema Evolution",
        "name_zh": "Schema 演进",
        "category": "dev-tools",
        "tags": ["schema", "evolution", "backward-compatibility", "data"],
        "description": "Plan a backward-compatible schema change for events or APIs.",
        "description_zh": "为事件或 API 规划向后兼容的 schema 变更。",
        "inputs": [
            {"name": "schema_context", "type": "string", "required": True, "description": "Events, API, database, etc."},
            {"name": "change", "type": "string", "required": True, "description": "Proposed schema change"},
        ],
        "output": {"format": "markdown", "description": "Evolution plan with additive-only steps and consumer coordination."},
        "when_to_use": "Changing event schemas, API contracts, or database columns used by multiple consumers.",
        "inputs_body": "Describe the schema context and proposed change.",
        "output_body": "A backward-compatible evolution plan with steps and consumer coordination.",
        "prompt": """Plan a backward-compatible schema evolution.

Output:
1. Current schema and proposed change
2. Compatibility analysis: additive vs breaking
3. Phased rollout: deploy producers first, then consumers
4. Default values and sentinels for optional fields
5. Deprecation: when to remove old fields
6. Consumer communication: schema registry, docs, code review

Avoid breaking changes unless all consumers are known and updated in one deploy.
""",
        "when_not_to_use": [
            "Internal data structures with a single consumer deployed together",
            "Prototypes where schema stability is not expected",
            "Cases requiring a breaking change with coordinated consumer migration — use a migration plan instead",
        ],
        "example_input": "schema_context: Kafka event schema\nchange: 'Add optional priority field, later make it required'",
        "example_output": "## Compatibility\nAdding `priority` as optional with default `normal` is backward-compatible.\n\n## Phased Rollout\n1. Update producer schema to include optional `priority`.\n2. Update consumers to read `priority` with default fallback.\n3. After all consumers are updated, make `priority` required.\n4. Remove default fallback in consumers after 2 weeks.",
    },
    {
        "slug": "rag-retrieval-eval",
        "name": "RAG Retrieval Eval",
        "name_zh": "RAG 检索评估",
        "category": "rag-retrieval",
        "tags": ["rag", "retrieval", "evaluation", "llm"],
        "description": "Design an evaluation for a RAG retrieval component.",
        "description_zh": "为 RAG 检索组件设计评估方案。",
        "inputs": [
            {"name": "corpus", "type": "string", "required": True, "description": "Document corpus description"},
            {"name": "queries", "type": "string", "required": False, "description": "Example user queries"},
        ],
        "output": {"format": "markdown", "description": "Retrieval evaluation plan with metrics and dataset design."},
        "when_to_use": "Building or tuning a RAG system, choosing a retriever, or debugging retrieval quality.",
        "inputs_body": "Describe the corpus and representative queries.",
        "output_body": "An eval plan with metrics, dataset construction, and baseline approach.",
        "prompt": """Design a retrieval evaluation for a RAG system.

Cover:
1. Metrics: recall@k, MRR, NDCG, precision, latency
2. Dataset: golden pairs (query, relevant doc IDs), negative sampling
3. Baseline: keyword/BM25 vs embedding retrieval
4. Failure modes: hallucinated retrieval, duplicates, out-of-domain queries
5. Human evaluation: when and how to spot-check
6. Iteration: chunk size, overlap, embedding model, reranker

Output:

## Metrics
...

## Dataset Construction
...

## Baseline
...
""",
        "when_not_to_use": [
            "Systems where retrieval is deterministic (exact ID lookup)",
            "Very small corpora where manual inspection is sufficient",
            "End-to-end generation eval where retrieval is not the bottleneck",
        ],
        "example_input": "corpus: '10k technical support articles'\nqueries: 'how do I reset password, why is my export failing'",
        "example_output": "## Metrics\n- Recall@5: did the right article appear in top 5?\n- MRR: rank of first relevant article\n- Latency p95 < 200ms\n\n## Dataset\nCreate 200 query/answer pairs with 1-3 relevant article IDs each. Include 50 out-of-domain negatives.",
    },
    {
        "slug": "prompt-injection-guardrails",
        "name": "Prompt Injection Guardrails",
        "name_zh": "提示注入防护",
        "category": "guardrails",
        "tags": ["prompt-injection", "security", "llm", "guardrails"],
        "description": "Add guardrails against direct and indirect prompt injection for an LLM app.",
        "description_zh": "为 LLM 应用添加直接和间接提示注入防护。",
        "inputs": [
            {"name": "app_description", "type": "string", "required": True, "description": "What the LLM app does and who provides input"},
            {"name": "untrusted_sources", "type": "string", "required": False, "description": "Untrusted data sources"},
        ],
        "output": {"format": "markdown", "description": "Defense layers with detection, filtering, and response strategies."},
        "when_to_use": "Building an LLM app that processes untrusted user input or external documents.",
        "inputs_body": "Describe the app and untrusted input sources.",
        "output_body": "A layered defense plan with implementation guidance.",
        "prompt": """Design prompt-injection defenses for the described LLM app.

Layers:
1. Input validation: length limits, allowed formats, sandboxing
2. Instruction hierarchy: system prompt strength, delimiters
3. Output control: constrained generation, tool-call allowlists
4. Detection: heuristic filters, separate classifier model, canary checks
5. Runtime: rate limiting, human-in-the-loop for sensitive actions
6. Response: graceful refusal, logging, alerting

Do not claim any defense is 100% effective. Emphasize defense-in-depth.
""",
        "when_not_to_use": [
            "Fully trusted, closed-user-group internal tools",
            "Applications with no user-provided text or external documents",
            "Cases where the real risk is model hallucination rather than injection",
        ],
        "example_input": "app_description: 'Customer support chatbot that can read user emails and reply'\nuntrusted_sources: 'user chat messages, uploaded email threads'",
        "example_output": "## Defense Layers\n1. Delimit untrusted email content with XML tags; instruct model to treat as data.\n2. Run email text through a prompt-injection classifier before LLM call.\n3. Restrict tools: no send-email without human confirmation.\n4. Add canary: reject if untrusted text contains common instruction-override markers.\n5. Log all model inputs with injection scores for 30 days.",
    },
    {
        "slug": "eval-suite-bootstrap",
        "name": "Eval Suite Bootstrap",
        "name_zh": "评估套件启动",
        "category": "evaluation",
        "tags": ["evals", "llm", "testing", "benchmark"],
        "description": "Bootstrap a minimal evaluation suite for an LLM-powered feature.",
        "description_zh": "为 LLM 功能启动最小可运行的评估套件。",
        "inputs": [
            {"name": "feature", "type": "string", "required": True, "description": "LLM feature to evaluate"},
            {"name": "criteria", "type": "string", "required": False, "description": "What good output looks like"},
        ],
        "output": {"format": "markdown", "description": "Eval suite structure with dataset, judges, and CI integration."},
        "when_to_use": "Shipping an LLM feature, moving from prototype to production, or standardizing evals.",
        "inputs_body": "Describe the feature and quality criteria.",
        "output_body": "A bootstrap eval suite plan with examples.",
        "prompt": """Bootstrap an LLM evaluation suite.

Output:
1. Evaluation types: unit, pairwise, human-in-the-loop
2. Dataset: 20-50 examples covering happy path, edge cases, regressions
3. Judges: deterministic assertions, LLM-as-judge rubrics, human labels
4. Metrics: accuracy, relevance, safety, latency, cost
5. CI integration: when to run evals, gating criteria
6. Example eval case with input, expected behavior, and rubric

Keep it minimal but production-ready.
""",
        "when_not_to_use": [
            "Experiments that will be discarded within a week",
            "Features where ground truth is undefined or subjective without human review",
            "Teams without access to model outputs in a reproducible environment",
        ],
        "example_input": "feature: 'support ticket auto-reply'\ncriteria: 'accurate, empathetic, does not promise refunds'",
        "example_output": "## Eval Types\n- Unit: deterministic checks (reply contains ticket ID, no refund promise).\n- LLM-as-judge: rate empathy and accuracy 1-5.\n\n## Dataset\n30 tickets across refund, bug, account categories.\n\n## CI\nRun on every prompt change; fail if accuracy < 85% or safety violations > 0.",
    },
]


def render(skill: dict) -> str:
    def input_lines(i: dict) -> str:
        base = f"  - name: {i['name']}\n    type: {i['type']}\n    required: {str(i['required']).lower()}\n    description: {i['description']}"
        if i["type"] == "enum":
            values = ", ".join(f'"{v}"' for v in i["values"])
            base += f"\n    values: [{values}]"
            if "default" in i:
                base += f"\n    default: {i['default']}"
        return base

    inputs_yaml = "\n".join(input_lines(i) for i in skill["inputs"])
    return f"""---
slug: {skill['slug']}
name: {skill['name']}
name_zh: {skill['name_zh']}
version: 0.1.0
description: {skill['description']}
description_zh: {skill['description_zh']}
category: {skill['category']}
tags: {skill['tags']}
inputs:
{inputs_yaml}
output:
  format: markdown
  description: {skill['output']['description']}
author: badhope
license: MIT
created: {TODAY}
updated: {TODAY}
---

# When to use

{skill['when_to_use']}

# Inputs

{skill['inputs_body']}

# Output

{skill['output_body']}

# Prompt

```prompt
{skill['prompt']}
```

# When NOT to use

{chr(10).join('- ' + x for x in skill['when_not_to_use'])}

# Example

**Input:**

```
{skill['example_input']}
```

**Output:**

```markdown
{skill['example_output']}
```
"""


def main() -> int:
    created = 0
    for skill in SKILLS:
        out_dir = SKILLS_DIR / skill["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "SKILL.md"
        if out_path.exists():
            print(f"skip existing: {out_path.relative_to(REPO)}")
            continue
        out_path.write_text(render(skill), encoding="utf-8")
        created += 1
    print(f"created {created} new skill(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
