# 月度社区更新机制（O5）

本机制用于每月向社区同步 AI-SKILL 项目的进展、新收录 skill、质量改进与 upcoming plans。更新以 Release Notes / Newsletter 形式发布，存放在 `docs/updates/` 并由 maintainer 每月月初发布。

## 触发时机

- **固定周期**：每月第一个工作日发布上月更新。
- **重大进展时**：当月新增 skill 数 ≥ 10、完成里程碑、或获得重要贡献者时，可提前发布特刊。
- **责任角色**：Community / Ops maintainer 主笔，Project Lead 审阅。

## 更新内容来源

1. **Git 提交日志**：筛选上月合并的 PR 与提交。
2. **新增 skill**：运行 `python scripts/validate-skill.py` 统计本月新增或升级的 skill。
3. **外部索引变化**：`external-index/health.json` 与 `frontend/public/external-repos.json` 的仓库数变化。
4. **社区动态**：新加入的 maintainer / contributor、解决的 issue、RFC 进展。
5. ** upcoming plans**：下月重点任务与需要社区帮助的岗位。

## 创建步骤

```bash
# 1. 拷贝模板
cp docs/templates/monthly-update.md docs/updates/2026-07.md

# 2. 按当月数据填充模板
# 3. 本地预览
cd frontend && npm run dev

# 4. 提交 PR，由 Project Lead 审阅后合并
# 5. 在 GitHub / GitCode Releases 页面创建 Release，正文粘贴该月度更新
```

## 发布渠道

- GitHub Releases / GitCode Releases
- 项目 README 顶部的「最新动态」徽章或链接
- 可选：邮件列表、Discord / 飞书社区频道

## 模板文件

- [`docs/templates/monthly-update.md`](templates/monthly-update.md) — 月度更新模板

## 跟踪 Issue

每月更新使用 `.github/ISSUE_TEMPLATE/monthly-update.yml` 创建跟踪单，确保连续 3 个月不中断。

## 验收标准

- 连续 3 个月在 GitHub / GitCode 发布月度更新。
- 每篇更新至少包含：新增 skill 数、外部仓库数、已关闭 issue 亮点、下月计划。
- 模板与流程文档合并到主分支。

## 相关文档

- [`docs/tasks.md`](tasks.md) — 项目任务总览
- [`docs/CONTRIBUTING.md`](../CONTRIBUTING.md) — 贡献者指南
