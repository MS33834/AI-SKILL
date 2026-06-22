#!/usr/bin/env python3
"""Apply the conservative category merge decisions from I5 RFC.

Merges:
  - customer-support -> applications
  - legal            -> applications
  - video-generation -> multimodal
  - case-studies     -> awesome-lists

This script uses regex replacements to preserve the original YAML formatting.

Usage:
    python scripts/merge-categories.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SKILLS_YAML = REPO / "external-index" / "skills.yaml"

MERGES = {
    "customer-support": "applications",
    "legal": "applications",
    "video-generation": "multimodal",
    "case-studies": "awesome-lists",
}


def _remove_category_blocks(text: str, slugs: set[str]) -> str:
    """Remove category definition blocks for merged slugs.

    Category definitions are top-level list items before the ``skills:``
    section; each block starts with ``- slug: <slug>`` followed by
    indented fields.
    """
    pattern = re.compile(
        r"^- slug: (" + "|".join(re.escape(s) for s in slugs) + r")\n"
        r"(?:  .*\n?)+",
        re.MULTILINE,
    )
    return pattern.sub("", text)


def _rewrite_repo_categories(text: str, merges: dict[str, str]) -> tuple[str, int]:
    """Rewrite category fields in repo blocks."""
    changed = 0

    def replacer(match: re.Match[str]) -> str:
        nonlocal changed
        changed += 1
        key = match.group(1)
        return f"  category: {merges[key]}"

    pattern = re.compile(
        r"^  category: (" + "|".join(re.escape(s) for s in merges.keys()) + r")$",
        re.MULTILINE,
    )
    return pattern.sub(replacer, text), changed


def _count_category_definitions(text: str) -> int:
    """Count top-level category definition blocks (before ``skills:``)."""
    # Split at the skills section so we only count categories.
    categories_part = text.split("\nskills:\n", 1)[0]
    return len(re.findall(r"^- slug:", categories_part, re.MULTILINE))


def main() -> int:
    if not SKILLS_YAML.exists():
        print(f"ERROR: {SKILLS_YAML} not found", file=sys.stderr)
        return 1

    text = SKILLS_YAML.read_text(encoding="utf-8")
    original_count = _count_category_definitions(text)

    text = _remove_category_blocks(text, set(MERGES.keys()))
    text, changed = _rewrite_repo_categories(text, MERGES)

    new_count = _count_category_definitions(text)
    removed = original_count - new_count

    SKILLS_YAML.write_text(text, encoding="utf-8")

    print(f"Removed {removed} category definitions")
    print(f"Rewrote {changed} repo categories")
    print(f"Total category definitions now: {new_count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
