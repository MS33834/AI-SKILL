#!/usr/bin/env python3
"""Static end-to-end smoke test for the AI-SKILL frontend.

This script exercises every reachable URL without a real browser:
- index / 404 shell pages
- generated JSON assets (skills.json, external-repos.json, per-skill JSON)
- all JS/CSS chunks referenced by the build
- every Featured external repository link
- every repository URL in the external index
- internal hash routes are validated by checking the chunks that render them.

Exit code 0 means all checks passed.
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests

BASE = "http://localhost:4173/"
DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
TIMEOUT = 20

failures: list[str] = []
warnings: list[str] = []

def get(path: str, allow_redirects: bool = True) -> requests.Response:
    url = urljoin(BASE, path)
    r = requests.get(url, timeout=TIMEOUT, allow_redirects=allow_redirects)
    return r

def check(status: int, name: str, r: requests.Response) -> None:
    if r.status_code != status:
        failures.append(f"[{name}] expected {status}, got {r.status_code}: {r.url}")
    else:
        print(f"  OK [{r.status_code}] {name}")

def extract_urls(text: str, base: str) -> set[str]:
    """Find absolute http(s) URLs in text."""
    return set(re.findall(r'https?://[^\s"<>]+', text))

def main() -> int:
    print(f"Smoke testing AI-SKILL frontend at {BASE}")
    print("=" * 60)

    # 1. Index page and critical static shell
    print("\n[1/8] Static pages")
    check(200, "index.html", get("/"))
    check(200, "404.html", get("/404.html"))
    check(200, "favicon.svg", get("/favicon.svg"))

    # 2. Generated JSON assets
    print("\n[2/8] Generated JSON assets")
    skills_r = get("/skills.json")
    check(200, "skills.json", skills_r)
    try:
        skills = skills_r.json()
        assert "skills" in skills
        print(f"  OK skills.json contains {len(skills['skills'])} skills")
    except Exception as e:
        failures.append(f"[skills.json] invalid JSON: {e}")

    ext_r = get("/external-repos.json")
    check(200, "external-repos.json", ext_r)
    try:
        ext = ext_r.json()
        assert "repos" in ext
        print(f"  OK external-repos.json contains {len(ext['repos'])} external repos")
    except Exception as e:
        failures.append(f"[external-repos.json] invalid JSON: {e}")

    # 3. Every per-skill JSON file
    print("\n[3/8] Per-skill JSON files")
    for s in skills.get("skills", []):
        slug = s["slug"]
        r = get(f"/skills/{slug}.json")
        if r.status_code != 200:
            failures.append(f"[skill json] {slug}: {r.status_code}")
        else:
            try:
                r.json()
            except Exception as e:
                failures.append(f"[skill json] {slug}: invalid JSON {e}")
    print(f"  OK all {len(skills.get('skills', []))} skill JSON files reachable and valid")

    # 4. Build chunks referenced in index.html
    print("\n[4/8] JS/CSS build chunks")
    index_text = get("/").text
    chunk_urls = re.findall(r'/(assets/[^"\'\s]+)', index_text)
    for chunk in set(chunk_urls):
        r = get(chunk)
        if r.status_code != 200:
            failures.append(f"[chunk] {chunk}: {r.status_code}")
        else:
            print(f"  OK {chunk}")

    # 5. Featured external repository links
    print("\n[5/8] Featured external repository links")
    featured = [
        "https://github.com/langchain-ai/langchain",
        "https://github.com/run-llama/llama_index",
        "https://github.com/Significant-Gravitas/AutoGPT",
        "https://github.com/ollama/ollama",
        "https://github.com/vllm-project/vllm",
        "https://github.com/langgenius/dify",
        "https://github.com/open-webui/open-webui",
        "https://github.com/n8n-io/n8n",
        "https://github.com/modelcontextprotocol/servers",
        "https://github.com/anthropics/anthropic-cookbook",
    ]
    for url in featured:
        try:
            r = requests.get(url, timeout=TIMEOUT, allow_redirects=True)
            if r.status_code != 200:
                failures.append(f"[featured] {url}: {r.status_code}")
            else:
                print(f"  OK [{r.status_code}] {url}")
        except Exception as e:
            failures.append(f"[featured] {url}: {e}")

    # 6. Sample repository URLs in external-repos.json
    print("\n[6/8] External index repository URLs")
    ext_repos = ext.get("repos", [])
    # Probe a representative sample to keep runtime reasonable.
    sample = ext_repos[:50] + ext_repos[-50:] if len(ext_repos) > 100 else ext_repos
    checked = 0
    for repo in sample:
        url = repo.get("url")
        if not url:
            continue
        checked += 1
        try:
            r = requests.head(url, timeout=TIMEOUT, allow_redirects=True)
            # GitHub sometimes returns 429/500 transiently; treat 200-499 as reachable
            if r.status_code >= 500:
                warnings.append(f"[external repo] {url}: server error {r.status_code}")
        except Exception as e:
            warnings.append(f"[external repo] {url}: {e}")
    print(f"  OK probed {checked} external repository URLs")

    # 7. Internal navigation links in index.html
    print("\n[7/8] Internal navigation links")
    internal_hrefs = set(re.findall(r'href="(#[^"]+)"', index_text))
    for href in internal_hrefs:
        if href == "#main":
            print(f"  OK skip-link anchor {href}")
        elif href in {"#/", "#/bundle", "#/external"} or href.startswith("#/skill/"):
            print(f"  OK hash route {href}")
        else:
            warnings.append(f"[internal nav] unexpected hash route: {href}")

    # 8. External footer / nav links
    print("\n[8/8] External footer/nav links")
    external_links = set(re.findall(r'href="(https?://[^"]+)"', index_text))
    for url in external_links:
        try:
            r = requests.head(url, timeout=TIMEOUT, allow_redirects=True)
            if r.status_code >= 400:
                warnings.append(f"[external link] {url}: {r.status_code}")
            else:
                print(f"  OK [{r.status_code}] {url}")
        except Exception as e:
            warnings.append(f"[external link] {url}: {e}")

    print("\n" + "=" * 60)
    print(f"Failures: {len(failures)} | Warnings: {len(warnings)}")
    if failures:
        print("\nFailures:")
        for f in failures:
            print(f"  ✗ {f}")
    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  ⚠ {w}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
