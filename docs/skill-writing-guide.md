# Skill 编写最佳实践

本指南帮助贡献者写出一致、可维护、平台中立的 SKILL.md。完整 schema 定义见 [`schema.md`](schema.md)，通用化改造清单见 [`generalization-checklist.md`](generalization-checklist.md)。

---

## 1. Frontmatter 必须完整

`validate-skill.py --strict` 会检查以下字段：

| 字段                             | 注意点                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| `slug`                           | kebab-case，与目录名一致，全局唯一                                        |
| `name` / `name_zh`               | sentence case，中文名可选但建议加                                         |
| `version`                        | semver `MAJOR.MINOR.PATCH`                                                |
| `description` / `description_zh` | 一句话，**不超过 100 字**                                                 |
| `category`                       | 必须是 `external-index/skills.yaml` 中已有的 49 个分类之一                |
| `tags`                           | 2–5 个小写标签，不要和 category 完全重复                                  |
| `platforms`                      | 只有确实依赖某个平台特性时才写，默认留空表示通用                          |
| `inputs`                         | 每个输入字段都要有 `name`、`type`、`required`、`description`              |
| `output`                         | 写明 `format`（markdown / json / text / code），json/code 最好带 `schema` |
| `author`                         | GitHub handle，或 `Name <email>`                                          |
| `license`                        | SPDX ID，例如 `MIT`                                                       |
| `created` / `updated`            | `YYYY-MM-DD`；prompt 改了要升版本号并更新 `updated`                       |

如果某个字段是你猜的，标 `needs_review: true` 并在 PR 里说明。

---

## 2. Prompt 结构清晰

建议按以下顺序组织 `# Prompt`：

1. **Role / Goal** —— 让模型知道自己是谁、要做什么。
2. **Inputs** —— 把 frontmatter 里的输入再用自然语言讲一遍。
3. **Process** —— 分步骤说明，用有序列表。
4. **Output format** —— 给出具体的格式模板，必要时用 fenced code block。
5. **Constraints / Tone** —— 长度、风格、禁止做的事。

不要用单个超长的段落。步骤越清晰，模型越稳定。

---

## 3. inputs / output JSON schema

`inputs` 是数组，每个字段描述一个参数：

```yaml
inputs:
  - name: repo_path
    type: path
    required: true
    description: 本地仓库根目录，必须包含 .git
  - name: depth
    type: integer
    required: false
    default: 3
    constraints:
      min: 1
      max: 10
    description: 分析最近几次提交
```

`output` 如果是 `json` 或 `code`，请给出可解析的 `schema`：

```yaml
output:
  format: json
  schema:
    type: object
    required: [summary, action_items]
    properties:
      summary:
        type: string
      action_items:
        type: array
        items: { type: string }
  description: 一段总结 + 待办事项列表
```

---

## 4. 一定要有 "When NOT to use"

每个 skill 都必须说明边界。要求：

- 至少 3 条具体反例。
- 越具体越好，不要写“可能不适用”这种空话。
- 如果 skill 是某个平台特性的薄封装，必须在这里说明。

示例：

```markdown
# When NOT to use

- 输入文档不到 2 页 —— 直接阅读比调用 skill 更快。
- 需要原文逐字引用 —— 请使用 `pdf-extractor`。
- 需要 OCR 识别扫描件 —— 本 skill 只处理纯文本 PDF。
```

---

## 5. 通用化 / vendor 中立

AI-SKILL 的技能默认应能在任何能读 Markdown 的 agent 上运行。编写时：

- 不要调用 `claude.messages.create(...)`、`openai.chat.completions.create(...)` 等平台 SDK。
- 不要使用 `tool_use`、`<function=...>` 等专有工具调用方言。
- 用占位符替代具体路径、模型名、API key：`<your_model>`、`<your_api_key>`、`<your_project_root>`。
- 如果确实需要平台特性，在 frontmatter 标 `platforms: [claude]`，并在正文开头加一行提示，例如：

```markdown
> **Claude-only** — 下面这段假设 Claude 的 `tool_use` 格式
```

---

## 6. 示例要完整

`# Example` 强烈建议包含：

- 一段代表性输入（YAML 或纯文本）。
- 期望输出（用 fenced code block 标明格式）。
- 必要时一句话说明为什么这个输入能触发该输出。

示例能让 reviewer 快速理解技能行为，也能作为回归测试的参考。

---

## 7. 提交前测试清单

在提交 PR 前确认：

- [ ] `python scripts/validate-skill.py --strict skills/<slug>/SKILL.md` 通过。
- [ ] 如从上游搬运，已按 [`generalization-checklist.md`](generalization-checklist.md) 检查。
- [ ] `needs_review` 为 `false`，除非有字段是猜测的。
- [ ] `updated` 日期已更新；prompt 修改导致输出变化时 `version` 已升级。
- [ ] `# When NOT to use` 不少于 3 条。
- [ ] `# Example` 至少 1 个。
- [ ] 没有提交 token、key、生成产物或大文件。
- [ ] 一个 PR 只改一个 skill。

---

## 8. Before / After 示例

### Before：平台相关

```markdown
Use the Anthropic API to call `claude-3-5-sonnet-20241022` with `tool_use` enabled.
```

### After：通用化

```markdown
Use the agent's standard tool-calling capability. If your platform requires a
model name, substitute `<your_model>`.
```

### Before：内部路径

```markdown
Read `packages/shared/prompts/system.txt`.
```

### After：占位符

```markdown
Read `<your_project_root>/prompts/system.txt`.
```

---

写好一个 skill 的关键是：**把平台细节留在 frontmatter，把可复用的工作流留在 prompt。**
