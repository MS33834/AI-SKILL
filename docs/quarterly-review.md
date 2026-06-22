# 季度 Skill 复审机制（Q4）

本机制用于每季度批量检查标记为 `quality: stable` 的本地 skill，确保它们仍然符合 [`docs/stable-checklist.md`](stable-checklist.md) 的准入标准。质量下滑、过期或失效的 skill 会被建议降级为 `beta` 或 `experimental`。

## 触发时机

- **固定周期**：每季度第一个工作日（1 月、4 月、7 月、10 月）。
- **发布前**：重大版本发布前，由 Release Manager 手动触发一次。
- **异常时**：当 CI 安全扫描、死链检查或用户反馈发现 stable skill 存在问题时，随时触发。

## 运行方式

```bash
# 基础复审
python scripts/quarterly-review.py

# 输出 Markdown 报告到文件
python scripts/quarterly-review.py --output docs/reports/quarterly-review-2026Q3.md

# 同时打印建议降级列表
python scripts/quarterly-review.py --demote-preview

# 使用自定义过期阈值（例如 60 天）
python scripts/quarterly-review.py --stale-days 60
```

## 复审内容

脚本会对每个 stable skill 检查以下项目：

1. **时效性**：`updated` 日期是否存在，且距离复审日期不超过 90 天。
2. **结构完整性**：必须包含 `# When to use`、`# Inputs`、`# Output`、`# Prompt` 四个 H1 段落，且顺序正确。
3. **占位符**：正文中不能残留 `<TODO>`、`<FIXME>`、`<your_api_key>` 等占位符。
4. **校验通过**：`validate-skill.py --strict` 全库无错误。
5. **安全扫描**：`security-scan.py --strict` 无 HIGH / MEDIUM 级别告警。

## 输出结果

脚本会生成一份 Markdown 报告，包含：

- 复审 skill 总数、通过数、需关注数。
- 每个需关注 skill 的具体发现项（分类、说明）。
- 建议操作：修复问题或降级 `quality`。

## 降级决策流程

1. **自动报告**：脚本输出后，由 Content / QA maintainer 创建季度复审跟踪 issue（使用 `.github/ISSUE_TEMPLATE/quarterly-review.yml`）。
2. **人工复核**：对报告中的每个 skill，判断：
   - 是否可以通过小修快速恢复？
   - 是否已过时、与当前最佳实践冲突、或长期无人维护？
3. **执行降级**：对于确认质量下滑的 skill，将其 `quality` 改为 `beta` 或 `experimental`，并在 PR 中引用复审 issue。
4. **更新日期**：只有发生实质性修改时才更新 `updated` 字段；单纯复审不更新。

## 跟踪 Issue 模板

使用 GitHub / GitCode issue 模板 `Quarterly skill review` 创建跟踪单，模板会自动填充：

- 复审季度与日期
- 脚本输出的发现摘要
- 待处理 skill 清单
- 降级/修复决策记录

## 与 CI 的关系

季度复审脚本**不阻塞**日常 PR 合并，但建议在以下 workflow 中调用：

- `.github/workflows/scheduled-sync.yml`：每季度固定日期生成报告并自动开 issue。
- Release workflow：发布前检查，阻止存在未处理 stable 降级项的版本发布。

## 相关文档

- [`docs/stable-checklist.md`](stable-checklist.md) — stable 准入检查清单
- [`docs/tasks.md`](tasks.md) — 项目任务总览
- [`scripts/validate-skill.py`](../scripts/validate-skill.py) — skill 校验脚本
- [`scripts/security-scan.py`](../scripts/security-scan.py) — 安全扫描脚本
