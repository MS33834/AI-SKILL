#!/usr/bin/env python3
"""Capture quickstart screenshots for docs/quickstart.md.

This script tries to use Playwright to automatically capture key pages. If
Playwright or its browsers are not installed, it prints manual recording
instructions instead of failing.

Prerequisites (for automatic mode):
    pip install playwright
    playwright install chromium

Usage:
    # 1. Start the preview server
    cd frontend && npm run build && npm run preview -- --port 4173

    # 2. Capture screenshots
    python scripts/capture-screenshots.py
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUTPUT_DIR = REPO / "docs" / "assets" / "quickstart" / "screenshots"
BASE_URL = "http://localhost:4173"

SCENARIOS = [
    ("homepage", "/", {"viewport": {"width": 1440, "height": 900}}),
    ("external-search-rag", "/#/external?lang=zh&q=rag", {"wait": 1.5}),
    ("skill-detail-code-review", "/#/skill/code-review?lang=zh", {"wait": 1.0}),
    ("bundle", "/#/bundle?lang=zh", {"wait": 1.0}),
]


def _print_manual() -> None:
    print("Playwright not available. Manual capture steps:")
    print()
    print("1. Build and start the preview server:")
    print("   cd frontend && npm run build && npm run preview -- --port 4173")
    print()
    print("2. Open http://localhost:4173 in a browser.")
    print()
    print("3. Capture the following pages:")
    for name, path, _ in SCENARIOS:
        print(f"   - {name}: {BASE_URL}{path}")
    print()
    print("4. Save PNGs to:", OUTPUT_DIR)
    print()
    print("5. Convert to GIF using FFmpeg or a screen recorder.")


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        _print_manual()
        return 0

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch()
        except Exception as e:
            print(f"Failed to launch Chromium: {e}")
            _print_manual()
            return 0

        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        for name, path, options in SCENARIOS:
            url = f"{BASE_URL}{path}"
            print(f"Capturing {name}: {url}")
            page.goto(url, wait_until="networkidle")
            wait_s = options.get("wait", 0.5)
            if wait_s:
                time.sleep(wait_s)

            screenshot_path = OUTPUT_DIR / f"{name}.png"
            page.screenshot(path=str(screenshot_path), full_page=True)
            print(f"  -> {screenshot_path.relative_to(REPO)}")

        browser.close()

    print()
    print(f"Done. Screenshots saved to {OUTPUT_DIR.relative_to(REPO)}")
    print("Next: convert key flows to GIF and update docs/quickstart.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
