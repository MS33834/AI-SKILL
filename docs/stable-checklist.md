# Stable 质量检查清单

本清单用于审核一个 skill 是否能从 `beta` / `alpha` / `experimental` / `draft` 标记为 `quality: stable`。只有满足全部条件的 skill 才能进入 stable 池，供用户默认展示和长期维护。

## 适用对象

- 本地 `skills/` 目录下的 `SKILL.md`。
- 通过上游抓取、人工编写或社区贡献提交的技能。

## Stable 准入标准

### 1. Frontmatter 完整且合法

- [ ] `slug` 与所在目录名一致，kebab-case，全仓库唯一。
- [ ] `name`、`description`、`version`、`category`、`tags`、`inputs`、`output`、`author`、`license`、`created`、`updated` 均已填写。
- [ ] `version` 符合 `MAJOR.MINOR.PATCH` 语义化版本。
- [ ] `category` 属于 `external-index/skills.yaml` 中的 49 个分类之一。
- [ ] `tags` 为 2-5 个小写标签，无重复、无空字符串。

### 2. 内容结构与示例

- [ ] 正文包含 `# When to use`、`# Inputs`、`# Output`、`# Prompt` 四个必需 H1 段落，且顺序正确。
- [ ] `# When NOT to use` 至少 3 条具体边界或反例，避免“可能不适用”等空话。
- [ ] `# Example` 至少包含 1 组完整的 input → output 示例。
- [ ] `# Prompt` 中的 prompt 清晰、可执行，无平台专属 SDK 调用。

### 3. 质量与审查标记

- [ ] `needs_review: false`（或省略，默认视为 false）。
- [ ] `quality: stable` 已显式设置。
- [ ] 无临时占位符，如 `<TODO>`、`FIXME`、未替换的 `<your_api_key>` 等。

### 4. 安全扫描干净

- [ ] 运行 `python scripts/security-scan.py --fail-on-high` 无 HIGH 级别告警。
- [ ] 运行 `python scripts/security-scan.py --strict` 无 HIGH / MEDIUM 级别告警（stable 推荐项）。
- [ ] 如确实需要提及 shell 命令、sudo、curl 等，需在 PR 中说明并由维护者人工批准。

### 5. 校验通过

- [ ] `python scripts/validate-skill.py --strict` 通过，无 schema 错误。
- [ ] `python scripts/validate-skill.py` 无文件级错误。

### 6. 平台中立或已声明例外

- [ ] 未使用特定厂商 SDK、模型名或内部路径。
- [ ] 若确需平台特定语法，已设置 `platforms` 并在 `# When NOT to use` 中说明。

### 7. Review 时效

- [ ] 最近 90 天内经过至少 1 次内容 review；超过 90 天未改动的 stable skill 应按季度复审。
- [ ] `updated` 日期已反映最近一次实质性修改。

## 复审流程

1. **提交者自审**：对照本清单逐项勾选，本地跑通 `validate-skill.py --strict` 与 `security-scan.py --fail-on-high`。
2. **Maintainer review**：检查内容通用性、示例质量、`When NOT to use` 是否具体。
3. **CI 检查**：PR 中 `validate` job 与 `frontend` job 全部通过。
4. **合并与标记**：合并后把 `quality` 改为 `stable`，并确保 `updated` 日期为最新。
5. **季度复审**：维护者每季度批量检查 stable skill，对过期、失效或质量下滑的 skill 降级为 `beta` 或 `experimental`。

## 相关脚本

```bash
# 校验 schema 与内容
python scripts/validate-skill.py --strict

# 安全扫描（CI 阻塞 HIGH）
python scripts/security-scan.py --fail-on-high

# 更严格的安全扫描（stable 推荐）
python scripts/security-scan.py --strict
```

## 相关文档

- [`docs/schema.md`](schema.md) — SKILL.md 字段说明与最小示例。
- [`docs/generalization-checklist.md`](generalization-checklist.md) — 从上游仓库通用化移植的检查清单。
- [`docs/tasks.md`](tasks.md) — 项目任务总览与角色分工。
