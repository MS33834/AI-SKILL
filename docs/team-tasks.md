# AI-SKILL 开发团队分工与执行计划

> 基于 [`docs/tasks.md`](tasks.md) 中所有未完成任务制定的团队分工与里程碑计划。
> 所有任务由内部核心团队直接执行；社区贡献者开放参与，但不作为交付依赖。

---

## 1. 团队角色定义

| 角色 | 主要职责 | 对应原 Maintainer 角色 |
|------|---------|----------------------|
| **产品经理 (PM)** | 制定优先级、路线图、发布计划；协调跨角色依赖；验收关键里程碑 | Project Lead 代理人 |
| **技术负责人 / 架构师** | 技术决策、schema 与分类体系设计、PR 终审、跨模块方案把关 | Project Lead + Tooling |
| **前端工程师** | `frontend/` 开发、性能优化、交互实现、构建与测试 | Frontend |
| **后端 / 数据工程师** | `scripts/`、索引同步、metadata、YAML/JSON 数据质量 | Index / Data + Tooling |
| **设计师 / UX** | 设计系统、视觉、动效、响应式、空状态、品牌素材 | Design / UX |
| **测试 / QA 工程师** | 安全扫描、校验脚本、死链监控、质量门禁、复审机制 | Security / QA |
| **DevOps / 运维工程师** | CI/CD、GitHub Actions、Pages 部署、性能基准、PWA | Tooling / Ops |
| **内容运营 / 社区经理** | 本地 skill 内容、上游关系、社区 onboarding、文档与月刊 | Content + Community |

---

## 2. 任务分配表

### 2.1 高优先级（立即启动）

| 任务编号 | 任务内容 | 负责角色 | 协助角色 | 目标时间 |
|---------|---------|---------|---------|---------|
| O1 | 任命首批内部 Maintainer（Content / Frontend / Community） | 产品经理 | 内容运营 | 2 周内 |
| O2 | Design / UX 内部负责人任命并产出设计规范 | 设计师 / UX | 产品经理 | 2 周内 |
| O3 | 贡献者 onboarding 流程跑通（内部模拟一次完整 PR） | 内容运营 | 产品经理、技术负责人 | 3 周内 |

### 2.2 中优先级（第一轮迭代）

| 任务编号 | 任务内容 | 负责角色 | 协助角色 | 目标时间 |
|---------|---------|---------|---------|---------|
| C4 | 从上游仓库再通用化 20 个 skill | 内容运营 | 测试 / QA | 4 周内 |
| C5 | 完善中文翻译（`name_zh` / `description_zh`） | 内容运营 | 产品经理 | 4 周内 |
| I4 | 外部索引 `skills` 字段补全与质量校验 | 后端 / 数据 | 测试 / QA | 3 周内 |
| I5 | 分类体系 review（49 个子分类是否够用） | 技术负责人 | 内容运营、后端 / 数据 | 3 周内 |
| F11 | 性能审计与优化（Lighthouse 90+） | 前端工程师 | DevOps / 运维 | 4 周内 |
| D4 | 卡片 hover / focus 动效精调 | 设计师 / UX | 前端工程师 | 3 周内 |
| O4 | 上游仓库作者认领机制 | 内容运营 | 产品经理 | 4 周内 |

### 2.3 低优先级（第二轮迭代）

| 任务编号 | 任务内容 | 负责角色 | 协助角色 | 目标时间 |
|---------|---------|---------|---------|---------|
| I6 | 外部索引搜索支持拼写建议 | 前端工程师 | 后端 / 数据 | 6 周内 ✅ |
| F12 | PWA 离线缓存（可选） | 前端工程师 | DevOps / 运维 | 6 周内 ✅ |
| Q4 | 季度 skill 复审机制 | 测试 / QA | 内容运营 | 持续进行 ✅ |
| O5 | 每月发布项目更新（newsletter / release notes） | 产品经理 | 内容运营 | 持续进行 ✅ |
| T5 | 视频/动图快速上手指南 | 内容运营 | 设计师 / UX | 6 周内 ✅ |

---

## 3. 里程碑规划

### Milestone 1：内部团队组建（第 1–2 周）
- 完成首批内部 Maintainer 任命（O1）
- 完成 Design / UX 内部负责人任命并确认设计规范（O2）
- 更新 [`GOVERNANCE.md`](../GOVERNANCE.md) maintainer 名单
- 更新 [`.github/CODEOWNERS`](../.github/CODEOWNERS)
- 新增 [`docs/core-team.md`](core-team.md) 明确内部主导原则

### Milestone 2：流程与数据基础（第 3–4 周）
- 跑通一次内部贡献者 onboarding PR（O3）
- 外部索引 `skills` 字段补全 ≥ 80%（I4） ✅ 已达 100%
- 分类体系 review 完成并发布结论（I5） ✅ 已合并 4 个低活跃分类，45 分类
- 通用化 20 个 skill（C4） ✅ 已完成 23 个

### Milestone 3：体验与质量提升（第 5–6 周）
- Lighthouse Performance / Accessibility / Best Practices 均 ≥ 90（F11） ✅ 已实施字体 preload / JSON 压缩 / preconnect / 移除外部字体
- 卡片动效精调完成（D4） ✅
- 中文翻译覆盖 ≥ 80% 本地 skill（C5） ✅
- 上游仓库作者认领机制落地（O4） ✅

### Milestone 4：增强功能与运营（第 7–8 周）
- 搜索拼写建议（I6） ✅
- PWA 离线缓存（F12） ✅
- 视频/动图上手指南（T5） ✅ 已嵌入 4 张 GIF
- 建立季度复审机制（Q4）与每月项目更新（O5） ✅

---

## 4. 执行流程

1. **任务认领**：每个角色从本表中领取任务，在 [`docs/tasks.md`](tasks.md) 对应行标注负责人并改为 `进行中`。
2. **方案确认**：中/高复杂度任务先开 issue 或 RFC，由技术负责人 / PM 确认方案后再编码。
3. **开发实现**：按角色负责领域修改代码，确保 CI 脚本在提交前本地通过。
4. **Code Review**：由对应 area maintainer 或技术负责人 review，QA 检查安全与链接。
5. **验收合并**：CI 全绿后合并，更新 [`docs/tasks.md`](tasks.md) 状态为 `已完成`。
6. **同步本文件**：本文件每两周随 milestone review 更新一次进度。

---

## 5. 关键检查点

- 每周五角色负责人向 PM 同步进度与阻塞项。
- 每个 milestone 结束开一次复盘会，调整下一迭代范围。
- 新增任务必须先经 PM 与技术负责人评估，再补充到本表和 [`docs/tasks.md`](tasks.md)。

---

## 6. 与现有治理文档的关系

- 本表是 [`docs/tasks.md`](tasks.md) 的**执行视图**，把任务映射到具体角色和时间线。
- 角色定义与 [`GOVERNANCE.md`](../GOVERNANCE.md) 的 maintainer area 对齐，便于后续任命 area maintainer。
- 贡献流程仍以 [`CONTRIBUTING.md`](../CONTRIBUTING.md) 为准。
