#!/usr/bin/env python3
"""Light-weight content security scan for AI-SKILL skills.

Looks through SKILL.md files and the generated frontend JSON for
patterns that are either:

  - dangerous executable instructions (rm -rf, curl | bash, etc.)
  - common social-engineering / jailbreak markers in prompts
  - hardcoded secrets (AWS keys, GitHub PATs, private tokens)

This is a guard-rail, not a full SAST. It flags *patterns* so a
human reviewer can decide whether the skill legitimately needs them
(e.g. a "terminal-cli" skill may mention shell commands).

Exit codes:

  0  no issues
  1  high-severity findings
  2  invalid arguments / missing dependencies
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

try:
    from ruamel.yaml import YAML
except ImportError:
    print("ruamel.yaml not installed. Run: pip install ruamel.yaml", file=sys.stderr)
    sys.exit(2)

REPO = Path(__file__).resolve().parent.parent
SKILLS_DIR = REPO / "skills"
FRONTEND_SKILLS_DIR = REPO / "frontend" / "public" / "skills"
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)

SEVERITY_HIGH = "HIGH"
SEVERITY_MED = "MEDIUM"
SEVERITY_LOW = "LOW"


@dataclass
class Rule:
    severity: str
    name: str
    pattern: re.Pattern[str]
    note: str


# Patterns are intentionally broad: we want reviewers to see them.
# A skill that legitimately discusses shell usage can be explicitly
# approved by a maintainer.
RULES: list[Rule] = [
    Rule(
        SEVERITY_HIGH,
        "destructive-shell",
        re.compile(r"\brm\s+-rf\b|\brm\s+-fr\b|\bmkfs\.|\bdd\s+if=|\bchmod\s+777\b|\bchmod\s+-R\s+777\b", re.IGNORECASE),
        "destructive or risky shell command",
    ),
    Rule(
        SEVERITY_HIGH,
        "pipe-to-shell",
        re.compile(r"\b(curl|wget)\s+[^|\n]*\|\s*(sh|bash|zsh|fish)\b", re.IGNORECASE),
        "downloading and piping straight to a shell",
    ),
    Rule(
        SEVERITY_HIGH,
        "sudo-elevation",
        re.compile(r"\bsudo\s+", re.IGNORECASE),
        "use of sudo / privilege escalation",
    ),
    Rule(
        SEVERITY_MED,
        "code-execution",
        re.compile(r"\b(eval|exec)\(|\bpython\s+-[ce]\b|\bnode\s+-e\b|\bperl\s+-[ne]\b", re.IGNORECASE),
        "dynamic code execution",
    ),
    Rule(
        SEVERITY_LOW,
        "network-fetch",
        re.compile(r"\b(curl|wget)\s+https?://", re.IGNORECASE),
        "network fetch in example or prompt",
    ),
    Rule(
        SEVERITY_MED,
        "subprocess-spawn",
        re.compile(r"\bos\.system\(|\bsubprocess\.|\bspawn\(|\bchild_process\b", re.IGNORECASE),
        "spawning OS processes from code",
    ),
    Rule(
        SEVERITY_LOW,
        "private-address",
        re.compile(r"\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|0\.0\.0\.0|localhost)\b"),
        "reference to private / loopback network address",
    ),
    Rule(
        SEVERITY_MED,
        "jailbreak-marker",
        re.compile(r"\bignore previous instructions\b|\bDAN\b|\bignore the (?:above|rules)\b|\bdo anything now\b|\bignore your (?:instructions|training)\b", re.IGNORECASE),
        "possible jailbreak / instruction override",
    ),
    Rule(
        SEVERITY_HIGH,
        "secret-token",
        re.compile(r"\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{22,}|glpat-[a-zA-Z0-9\-]{20}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{48}|sk_live_[a-zA-Z0-9]{24,}|sk_test_[a-zA-Z0-9]{24,})\b"),
        "possible hardcoded secret / API token",
    ),
]


@dataclass
class Finding:
    path: Path
    severity: str
    rule: str
    line: int
    snippet: str
    note: str


def _rel(p: Path) -> str:
    try:
        return str(p.relative_to(REPO))
    except ValueError:
        return str(p)


def split_frontmatter(text: str) -> tuple[dict[str, Any] | None, str]:
    m = FRONTMATTER_RE.match(text)
    if not m:
        return None, text
    yaml = YAML(typ="safe")
    try:
        fm = dict(yaml.load(m.group(1)) or {})
    except Exception:
        return None, text
    return fm, m.group(2)


def scan_text(path: Path, text: str) -> list[Finding]:
    findings: list[Finding] = []
    lines = text.splitlines()
    for rule in RULES:
        for i, line in enumerate(lines, start=1):
            if not rule.pattern.search(line):
                continue
            # Ignore matches inside code-block language tags (e.g. ```bash)
            # and in fenced code block markers themselves.
            stripped = line.strip()
            if stripped.startswith("```"):
                continue
            findings.append(
                Finding(
                    path=path,
                    severity=rule.severity,
                    rule=rule.name,
                    line=i,
                    snippet=line.strip()[:120],
                    note=rule.note,
                )
            )
    return findings


def scan_skill_md(path: Path) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)
    # Scan both the raw file (to catch secrets in frontmatter) and
    # the body (prompts/examples).
    findings = scan_text(path, text)
    if fm is not None:
        quality = fm.get("quality")
        if quality in ("experimental", "draft"):
            findings.append(
                Finding(
                    path=path,
                    severity=SEVERITY_LOW,
                    rule="quality-review",
                    line=0,
                    snippet=f"quality: {quality}",
                    note="experimental/draft skill should receive extra review",
                )
            )
    return findings


def scan_json_file(path: Path) -> list[Finding]:
    text = path.read_text(encoding="utf-8")
    findings = scan_text(path, text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return findings
    # Also surface the inferred provenance so reviewers know where
    # the published skill points.
    src = data.get("source") if isinstance(data, dict) else None
    if isinstance(src, dict) and not src.get("url"):
        findings.append(
            Finding(
                path=path,
                severity=SEVERITY_LOW,
                rule="missing-provenance",
                line=0,
                snippet="",
                note="published skill JSON lacks source.url",
            )
        )
    return findings


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n", 1)[0])
    ap.add_argument("--strict", action="store_true", help="treat MEDIUM findings as failures")
    ap.add_argument("--quiet", action="store_true", help="only print findings and summary")
    args = ap.parse_args()

    findings: list[Finding] = []

    md_files = sorted(SKILLS_DIR.rglob("SKILL.md"))
    for p in md_files:
        findings.extend(scan_skill_md(p))

    high = [f for f in findings if f.severity == SEVERITY_HIGH]
    medium = [f for f in findings if f.severity == SEVERITY_MED]
    low = [f for f in findings if f.severity == SEVERITY_LOW]

    for f in findings:
        if args.quiet and f.severity == SEVERITY_LOW:
            continue
        print(f"  {f.severity[:1]}  {_rel(f.path)}:{f.line}  {f.rule}: {f.snippet}")
        print(f"      {f.note}")

    print(f"\n== security scan: {len(high)} high / {len(medium)} medium / {len(low)} low / {len(md_files)} files ==")

    if high:
        return 1
    if args.strict and medium:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
