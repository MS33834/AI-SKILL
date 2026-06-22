#!/usr/bin/env python3
"""Quarterly review for stable local skills.

Scans every skill explicitly marked as `quality: stable` in its SKILL.md
frontmatter and reports whether it still meets the stable checklist. The
script is intended to be run at the start of each quarter, or on demand before
a release.

Exit codes:
    0 - all stable skills pass the review
    1 - one or more stable skills need attention

Typical usage:
    python scripts/quarterly-review.py
    python scripts/quarterly-review.py --demote-preview  # print proposed demotions
    python scripts/quarterly-review.py --output report.md
    python scripts/quarterly-review.py --strict  # also treat MEDIUM findings as failures
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

REPO = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO / "skills"
INDEX_YAML = REPO / "skills" / "_index.yaml"
STALE_DAYS = 90

# Required H1 sections in the recommended order.
REQUIRED_SECTIONS = [
    "# When to use",
    "# Inputs",
    "# Output",
    "# Prompt",
]

SECTION_ORDER_PATTERN = re.compile(
    r"(# When to use).*?(# Inputs).*?(# Output).*?(# Prompt)",
    re.IGNORECASE | re.DOTALL,
)

PLACEHOLDER_PATTERN = re.compile(
    r"<\s*(?:TODO|FIXME|your_api_key|your_key|replace_me|placeholder)\s*>",
    re.IGNORECASE,
)

FRONTMATTER_PATTERN = re.compile(
    r"^---\s*\n(.*?)\n---\s*\n",
    re.DOTALL,
)


def _load_yaml(path: Path) -> dict[str, Any]:
    try:
        from ruamel.yaml import YAML

        yaml = YAML(typ="safe", pure=True)
        return yaml.load(path.read_text(encoding="utf-8")) or {}
    except Exception:
        import yaml

        return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def _parse_frontmatter(text: str) -> dict[str, Any]:
    """Extract YAML frontmatter from a SKILL.md file."""
    match = FRONTMATTER_PATTERN.match(text)
    if not match:
        return {}
    return _load_yaml_from_text(match.group(1))


def _load_yaml_from_text(text: str) -> dict[str, Any]:
    try:
        from ruamel.yaml import YAML

        yaml = YAML(typ="safe", pure=True)
        return yaml.load(text) or {}
    except Exception:
        import yaml

        return yaml.safe_load(text) or {}


@dataclass
class Finding:
    category: str
    message: str


@dataclass
class ReviewResult:
    slug: str
    path: Path
    quality: str
    updated: dt.date | None
    findings: list[Finding] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.findings


def _parse_date(value: str | dt.date | None) -> dt.date | None:
    if not value:
        return None
    if isinstance(value, dt.datetime):
        return value.date()
    if isinstance(value, dt.date):
        return value
    for fmt in ("%Y-%m-%d", "%Y/%m/%d"):
        try:
            return dt.datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def _run_validate(strict: bool) -> list[Finding]:
    cmd = [sys.executable, str(REPO / "scripts" / "validate-skill.py")]
    if strict:
        cmd.append("--strict")
    result = subprocess.run(
        cmd,
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    findings: list[Finding] = []
    if result.returncode != 0:
        findings.append(
            Finding(
                "validate",
                f"validate-skill.py{' --strict' if strict else ''} failed for vault. "
                f"stderr: {result.stderr.strip()[:200]}",
            )
        )
    return findings


def _run_security_scan(strict: bool) -> list[Finding]:
    cmd = [sys.executable, str(REPO / "scripts" / "security-scan.py")]
    if strict:
        cmd.append("--strict")
    else:
        cmd.append("--fail-on-high")
    result = subprocess.run(
        cmd,
        cwd=REPO,
        capture_output=True,
        text=True,
    )
    findings: list[Finding] = []
    if result.returncode != 0:
        scan_mode = "--strict" if strict else "--fail-on-high"
        findings.append(
            Finding(
                "security",
                f"security-scan.py {scan_mode} returned exit code {result.returncode}. "
                f"See output for details.",
            )
        )
    return findings


def _content_findings(slug: str, text: str) -> list[Finding]:
    findings: list[Finding] = []

    if not SECTION_ORDER_PATTERN.search(text):
        missing = [s for s in REQUIRED_SECTIONS if s.lower() not in text.lower()]
        if missing:
            findings.append(
                Finding(
                    "structure",
                    f"Missing required sections: {', '.join(missing)}",
                )
            )
        else:
            findings.append(
                Finding(
                    "structure",
                    "Required sections present but not in recommended order",
                )
            )

    if PLACEHOLDER_PATTERN.search(text):
        findings.append(
            Finding(
                "content",
                "Contains placeholder markers (TODO / FIXME / your_api_key / etc.)",
            )
        )

    return findings


def _review_skill(
    path: Path,
    today: dt.date,
    stale_days: int,
    validate_findings: list[Finding],
    security_findings: list[Finding],
) -> ReviewResult:
    slug = path.parent.name
    text = path.read_text(encoding="utf-8")
    fm = _parse_frontmatter(text)

    result = ReviewResult(
        slug=slug,
        path=path,
        quality=fm.get("quality", "unknown"),
        updated=_parse_date(fm.get("updated")),
    )

    if result.quality != "stable":
        # We only review skills explicitly marked as stable.
        return result

    # 1. Timeliness: updated within the last stale_days days.
    if result.updated is None:
        result.findings.append(
            Finding("metadata", "Missing or unparsable `updated` date")
        )
    elif (today - result.updated).days > stale_days:
        result.findings.append(
            Finding(
                "stale",
                f"Last updated {result.updated} ({(today - result.updated).days} days ago); "
                f"exceeds {stale_days}-day review window",
            )
        )

    # 2. Content structure and placeholder checks.
    result.findings.extend(_content_findings(slug, text))

    # 3. Vault-wide validation and security scan results.
    result.findings.extend(validate_findings)
    result.findings.extend(security_findings)

    return result


def _markdown_report(results: list[ReviewResult], today: dt.date) -> str:
    lines: list[str] = []
    lines.append(f"# Quarterly Stable Skill Review — {today.isoformat()}")
    lines.append("")
    lines.append(
        f"Reviewed {len(results)} stable skill(s). "
        f"Passed: {sum(1 for r in results if r.ok)}. "
        f"Needs attention: {sum(1 for r in results if not r.ok)}."
    )
    lines.append("")

    failing = [r for r in results if not r.ok]
    if failing:
        lines.append("## Skills needing attention")
        lines.append("")
        for r in failing:
            lines.append(f"### `{r.slug}`")
            lines.append(f"- Path: `{r.path.relative_to(REPO)}`")
            lines.append(f"- Quality: `{r.quality}`")
            lines.append(
                f"- Updated: `{r.updated.isoformat() if r.updated else 'unknown'}`"
            )
            lines.append("- Findings:")
            for f in r.findings:
                lines.append(f"  - **{f.category}**: {f.message}")
            lines.append("")

    passing = [r for r in results if r.ok]
    if passing:
        lines.append("## Skills that passed")
        lines.append("")
        for r in passing:
            updated = r.updated.isoformat() if r.updated else "unknown"
            lines.append(f"- `{r.slug}` — updated {updated}")
        lines.append("")

    lines.append("## Suggested actions")
    lines.append("")
    if failing:
        lines.append(
            "1. Open a tracking issue from the `quarterly-review` template."
        )
        lines.append(
            "2. For each failing skill, either fix the findings or demote "
            "`quality` from `stable` to `beta` / `experimental`."
        )
        lines.append(
            "3. Update the `updated` date only when a substantive change is made."
        )
    else:
        lines.append("All stable skills are healthy. No action required.")
    lines.append("")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Quarterly stable skill review")
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        help="Write the Markdown report to this file",
    )
    parser.add_argument(
        "--demote-preview",
        action="store_true",
        help="Print a preview of proposed quality demotions",
    )
    parser.add_argument(
        "--stale-days",
        type=int,
        default=STALE_DAYS,
        help=f"Stale threshold in days (default: {STALE_DAYS})",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat MEDIUM security findings as failures (default: only HIGH fails)",
    )
    args = parser.parse_args()

    stale_days = args.stale_days

    if not INDEX_YAML.exists():
        print(f"ERROR: index not found: {INDEX_YAML}", file=sys.stderr)
        return 1

    skill_paths = sorted(SKILLS_DIR.glob("*/SKILL.md"))
    if not skill_paths:
        print("No skills found.")
        return 0

    today = dt.date.today()

    # Run vault-wide checks once and share the results with every skill.
    # This keeps the quarterly review fast while still catching vault-level issues.
    validate_findings = _run_validate(strict=True)
    security_findings = _run_security_scan(strict=args.strict)

    results = [
        _review_skill(path, today, stale_days, validate_findings, security_findings)
        for path in skill_paths
    ]

    # Filter to only explicit stable skills for reporting.
    stable_results = [r for r in results if r.quality == "stable"]

    report = _markdown_report(stable_results, today)

    if args.output:
        args.output.write_text(report, encoding="utf-8")
        print(f"Report written to {args.output}")

    print(report)

    if args.demote_preview:
        print("\n## Proposed demotions")
        for r in stable_results:
            if not r.ok:
                print(f"- `{r.slug}`: stable -> beta")

    return 0 if all(r.ok for r in stable_results) else 1


if __name__ == "__main__":
    sys.exit(main())
