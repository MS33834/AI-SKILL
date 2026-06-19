# Licensing Guide for Contributors

This guide explains how AI-SKILL handles licenses when you add a local skill or an external repository entry.

## Default project license

All code and documentation in this repository is licensed under [MIT](../LICENSE).
By contributing, you agree to license your contribution under MIT.

## Local skills (`skills/`)

### Original skills

If you wrote the skill yourself and did not copy from another source, you can submit it under MIT.

### Skills ported from upstream repositories

If you adapted a skill from another repository, you **must**:

1. Fill in the `source` block in the frontmatter:
   - `url`: upstream repository URL
   - `commit`: the exact commit SHA you copied from
   - `license`: the upstream license SPDX identifier
2. Make sure the upstream license allows redistribution and modification.
3. Record the modifications you made in the PR description.

### License compatibility

The most common upstream licenses we encounter:

| Upstream license | Can we redistribute adapted skill under MIT? | Notes |
|---|---|---|
| MIT | ✅ Yes | Keep copyright notice in `source` block. |
| Apache-2.0 | ✅ Yes | Keep attribution and NOTICE file references. |
| BSD-2-Clause / BSD-3-Clause | ✅ Yes | Keep copyright notice. |
| CC0 / Public domain | ✅ Yes | No attribution required, but link back as a courtesy. |
| CC-BY-4.0 | ✅ Yes | Keep attribution. |
| GPL-3.0 | ⚠️ No | GPL requires derivative works to be GPL. Do not port into our MIT repo without explicit permission. |
| Proprietary / no license | ❌ No | Do not submit. |

If you are unsure, open a discussion issue before submitting.

## External repositories (`external-index/skills.yaml`)

Linking to an external repository is generally fine, but the linked repository must:

- Be publicly accessible.
- Have a clear license or terms of use.
- Not host malware, illegal content, or materials that violate our [Code of Conduct](../CODE_OF_CONDUCT.md).

## Attribution requirements

- Do not remove upstream copyright notices.
- Do not strip the `source` block from a ported skill.
- If an upstream project asks to be removed or unlinked, follow the process in [GOVERNANCE.md](../GOVERNANCE.md).

## Takedown requests

If you believe content in this repository infringes your rights:

1. Open a private issue or contact the Project Lead directly.
2. Provide the exact file/path and the basis for the request.
3. The Project Lead will review and respond within 14 days.
