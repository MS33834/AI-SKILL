# Skill Generalization Checklist

This checklist applies when you port a skill from an upstream repository into AI-SKILL's `skills/` directory.

AI-SKILL is **practically vendor-neutral**: we do not require every skill to be written from scratch, but we do require that locally hosted skills can be dropped into any agent that reads Markdown, without forcing the user into a specific platform or SDK.

## When this checklist applies

- You copied a prompt, template, or workflow from an upstream repo (e.g., `anthropics/`, `openai/`, `langchain-ai/`).
- The original content contained platform-specific instructions, SDK calls, internal paths, or product names.

## Checklist

### 1. Remove hard-coded platform invocations

| Must remove or rewrite | Example |
|---|---|
| SDK-specific function calls | `claude.messages.create(...)`, `openai.chat.completions.create(...)` |
| Tool-calling dialect | `tool_use`, `toolu_...`, `<function=...>` |
| Proprietary schema extensions | Anthropic's `thinking` block, OpenAI's `response_format` JSON mode specifics |
| Internal package paths | `from my_org.shared.utils import ...` |

Keep the **concept** (multi-step reasoning, structured output, retrieval) but express it in plain language.

### 2. Replace concrete paths and identifiers with placeholders

Use placeholders that the user fills in:

- `<your_project_root>` instead of `packages/shared/`
- `<your_api_key>` instead of a real key
- `<your_model>` instead of `claude-3-5-sonnet-20241022`

### 3. Keep platform-specific examples only as optional sections

If a skill genuinely works best on a specific platform, you may include a short **"Platform-specific notes"** section, but the main `# Prompt` must work without it.

Tag the skill with the relevant platform(s) in `platforms:` frontmatter.

### 4. Preserve attribution

The `source:` frontmatter must point to the original repository and commit. Do not strip upstream credit.

### 5. Add a clear "When NOT to use" section

Every skill must explain its limits. If the skill is a thin wrapper around a vendor feature, say so.

### 6. Validate before submitting

```bash
python scripts/validate-skill.py --strict
```

## Examples

### Bad: platform-specific prompt

```markdown
Use the Anthropic API to call `claude-3-5-sonnet-20241022` with `tool_use` enabled.
```

### Good: generalized prompt

```markdown
Use the agent's standard tool-calling capability. If your platform requires a model name, substitute `<your_model>`.
```

### Bad: internal path

```markdown
Read `packages/shared/prompts/system.txt`.
```

### Good: placeholder

```markdown
Read `<your_project_root>/prompts/system.txt`.
```

## Exception: vendor-specific example skills

A small number of skills may be intentionally vendor-specific. These must:

1. Be labeled with `platforms: [claude]` or equivalent in frontmatter.
2. Include a disclaimer in `# When NOT to use`.
3. Be justified in the PR description.
