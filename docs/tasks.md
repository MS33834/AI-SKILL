# AI-SKILL 任务总览与分工

> 本文档把 [`plan.md`](plan.md) 里的战略拆成可执行、可认领、可验收的任务。
> 目标：让不同角色的人随时能加入，并且一眼知道自己该做什么。

---

## 1. 角色地图

| 角色                   | 主要职责                                 | 适合什么样的人                          | 当前状态  |
| ---------------------- | ---------------------------------------- | --------------------------------------- | --------- |
| **Project Lead**       | 定方向、拍板争议、任命维护者             | 项目发起人                              | `badhope` |
| **Content / Curation** | 审核本地 skill、frontmatter、通用化改造  | 熟悉 prompt engineering、愿意审稿       | 招募中    |
| **Index / Data**       | 维护外部索引、分类体系、元数据刷新       | 熟悉 YAML / 数据清洗、能写 Python       | 招募中    |
| **Frontend & Tooling** | 前端、CI、脚本、性能、构建               | 熟悉 TypeScript / Vite / GitHub Actions | 招募中    |
| **Design / UX**        | 视觉系统、响应式、动效、空状态、品牌素材 | 有设计系统或前端审美经验                | **急需**  |
| **Community / Ops**    | 贡献者 onboarding、上游关系、发布说明    | 喜欢沟通、会写文档                      | 招募中    |
| **Security / QA**      | 安全扫描规则、测试覆盖、死链监控         | 有安全或测试意识                        | 招募中    |
| **Docs / i18n**        | 中文/英文文档、教程、错误提示本地化      | 中英文表达清晰                          | 招募中    |
| **Contributor**        | 提交 skill、修 bug、提 issue、review PR  | 任何想参与的人                          | 开放      |

---

## 2. 任务看板

### 2.1 内容 / Content

| #   | 任务                                      | 优先级 | 负责角色               | 状态   | 验收标准                                                           |
| --- | ----------------------------------------- | ------ | ---------------------- | ------ | ------------------------------------------------------------------ |
| C1  | 建立 skill 复审流程                       | 高     | Content + Project Lead | 待认领 | GOVERNANCE 里写明 stable 准入流程；首批 5 个 skill 通过复审        |
| C2  | 把现有 `needs_review: true` 的技能清零    | 高     | Content                | 已完成 | 38 个本地 skill 全部 `needs_review: false`（模板除外）             |
| C3  | 首批 10 个 skill 标记为 `quality: stable` | 高     | Content + Security/QA  | 待认领 | 通过 `validate-skill.py --strict` + `security-scan.py` 无 HIGH/MED |
| C4  | 从上游仓库再通用化 20 个 skill            | 中     | Content                | 待认领 | 每个都有完整 frontmatter、example、When NOT to use                 |
| C5  | 完善中文翻译（name_zh / description_zh）  | 中     | Docs / i18n            | 待认领 | 80% 本地 skill 有中文名和中文描述                                  |
| C6  | 撰写 skill 编写最佳实践指南               | 低     | Content + Docs         | 待认领 | docs/skill-writing-guide.md 合并                                   |

### 2.2 索引 / Index

| #   | 任务                                                         | 优先级 | 负责角色               | 状态   | 验收标准                                                   |
| --- | ------------------------------------------------------------ | ------ | ---------------------- | ------ | ---------------------------------------------------------- |
| I1  | 外部索引支持自动加载 / 虚拟滚动                              | 高     | Frontend               | 已完成 | 首屏 60 条，滚动加载，无卡顿                               |
| I2  | 索引元数据定时刷新（stars / license / pushed_at / archived） | 高     | Index / Data + Tooling | 待认领 | `.github/workflows/scheduled-sync.yml` 每周运行并自动提 PR |
| I3  | 死链自动检测与告警                                           | 高     | Index / Data + Tooling | 待认领 | 每周 `check-links.py` 跑一遍，失败开 issue                 |
| I4  | 外部仓库 `skills` 字段补全与质量校验                         | 中     | Index / Data           | 待认领 | 80% 仓库有非空 `skills` 列表；CI 校验非空                  |
| I5  | 分类体系review（49 个子分类是否够用）                        | 中     | Content + Index        | 待认领 | 开 RFC issue 收集反馈，必要时拆分/合并                     |
| I6  | 外部索引搜索支持拼写建议                                     | 低     | Frontend               | 待认领 | 搜索无结果时给出 "Did you mean"                            |

### 2.3 前端 / Frontend

| #   | 任务                               | 优先级 | 负责角色                  | 状态   | 验收标准                                                        |
| --- | ---------------------------------- | ------ | ------------------------- | ------ | --------------------------------------------------------------- |
| F1  | 修复动画卡顿与循环问题             | 高     | Frontend                  | 已完成 | 过滤时动画不重新播放；卡片 stagger 只限前 16 个                 |
| F2  | 外部索引分页 / 虚拟滚动            | 高     | Frontend                  | 已完成 | IntersectionObserver 自动加载 + Load More 按钮                  |
| F3  | 复制按钮快速点击状态一致           | 中     | Frontend                  | 已完成 | 多次点击不会错位恢复                                            |
| F4  | 自托管字体替代 Google Fonts        | 中     | Frontend                  | 已完成 | 使用 `@fontsource` 包，无外部 CDN 请求                          |
| F5  | 前端单元测试覆盖共享工具函数       | 中     | Frontend                  | 已完成 | `shared.test.ts` 覆盖 escHtml、escAttr、stableHue、debounce 等  |
| F6  | 详情页输出 schema 折叠展示         | 中     | Frontend                  | 已完成 | `details__schema` 可折叠 JSON                                   |
| F7  | Bundle 选择器显示平台/质量标签     | 中     | Frontend                  | 已完成 | 列表项带 platform + quality chip                                |
| F8  | 响应式再打磨（移动端 320px–768px） | 高     | Design / UX + Frontend    | 待认领 | 主要页面在 DevTools 各尺寸无横向滚动、不重叠                    |
| F9  | 暗色模式对比度与焦点状态审计       | 中     | Design / UX + Security/QA | 待认领 | a11y 颜色对比度 WCAG AA；所有交互元素可见 focus                 |
| F10 | 空状态 / 错误状态插画与文案        | 中     | Design / UX + Docs        | 待认领 | 404、无结果、加载失败都有统一视觉                               |
| F11 | 性能审计与优化（Lighthouse 90+）   | 中     | Frontend                  | 待认领 | Lighthouse Performance / Accessibility / Best Practices 均 ≥ 90 |
| F12 | PWA 离线缓存（可选）               | 低     | Frontend                  | 待认领 | 可安装、离线能浏览已访问过的技能                                |

### 2.4 自动化 / Automation

| #   | 任务                                      | 优先级 | 负责角色                | 状态   | 验收标准                                                 |
| --- | ----------------------------------------- | ------ | ----------------------- | ------ | -------------------------------------------------------- |
| A1  | CI 集成 Python 校验 + 安全扫描 + 前端检查 | 高     | Tooling / Ops           | 已完成 | `.github/workflows/ci.yml` 阻塞合并                      |
| A2  | 安全扫描 HIGH 级别告警阻塞合并            | 高     | Security / QA + Tooling | 待认领 | CI 中 `security-scan.py` 遇到 HIGH 时 exit 1             |
| A3  | Release Notes 自动生成                    | 中     | Tooling / Ops           | 已完成 | `.github/release.yml` 分类配置                           |
| A4  | 定时 sync + link-check workflow           | 高     | Index / Data + Tooling  | 待认领 | 每周自动提 PR 更新 `external-index/health.json` 和元数据 |
| A5  | 前端构建产物部署到 Pages                  | 中     | Tooling / Ops           | 待认领 | push 到 main 自动部署 GitHub Pages 与 GitCode Pages      |
| A6  | 依赖自动更新（Dependabot）                | 低     | Tooling / Ops           | 待认领 | 启用 Dependabot，自动提 minor/patch 更新 PR              |

### 2.5 社区 / Community

| #   | 任务                                                  | 优先级 | 负责角色                 | 状态     | 验收标准                                       |
| --- | ----------------------------------------------------- | ------ | ------------------------ | -------- | ---------------------------------------------- |
| O1  | 招募首批 Maintainer（Content / Frontend / Community） | 高     | Project Lead + Community | 进行中   | 至少 3 位 maintainer 完成任命                  |
| O2  | 招募 Design / UX 贡献者                               | 高     | Project Lead + Community | **急需** | 至少 1 位设计师加入并产出 1 套改进             |
| O3  | 贡献者 onboarding 流程跑通                            | 高     | Community                | 待认领   | 外部贡献者的第一个 PR 能在 7 天内被合并        |
| O4  | 上游仓库作者认领机制                                  | 中     | Community + Content      | 待认领   | 给 10 个上游仓库发邀请 issue/PR，至少 2 个回应 |
| O5  | 每月社区更新（newsletter / release notes）            | 中     | Community                | 待认领   | 连续 3 个月发布月度更新                        |
| O6  | 行为准则（CODE_OF_CONDUCT.md）落地                    | 低     | Project Lead + Community | 待认领   | 明确举报渠道与处理流程                         |

### 2.6 质量 / Quality

| #   | 任务                             | 优先级 | 负责角色              | 状态   | 验收标准                                    |
| --- | -------------------------------- | ------ | --------------------- | ------ | ------------------------------------------- |
| Q1  | `quality` 字段在 UI 展示         | 高     | Frontend              | 已完成 | 列表、详情、bundle 均显示 quality chip      |
| Q2  | 安全扫描分级（HIGH / MED / LOW） | 高     | Security / QA         | 已完成 | `security-scan.py` 输出分级结果             |
| Q3  | stable 准入检查清单              | 中     | Content + Security/QA | 待认领 | docs/stable-checklist.md 合并               |
| Q4  | 季度 skill 复审机制              | 低     | Content               | 待认领 | 每季度批量检查 stable skill，失效降级       |
| Q5  | 输入输出 schema 校验增强         | 低     | Tooling / Ops         | 待认领 | `validate-skill.py` 校验 JSON schema 可解析 |

### 2.7 设计 / Design & UX

| #   | 任务                                   | 优先级 | 负责角色               | 状态   | 验收标准                                 |
| --- | -------------------------------------- | ------ | ---------------------- | ------ | ---------------------------------------- |
| D1  | 设计系统文档（颜色、字体、间距、组件） | 高     | Design / UX            | 待认领 | docs/design-system.md，与 style.css 对齐 |
| D2  | 品牌标识与 favicon                     | 中     | Design / UX            | 待认领 | 提供 SVG/PNG favicon 与社交媒体封面      |
| D3  | 空状态 / 错误页视觉统一                | 中     | Design / UX + Frontend | 待认领 | 404、empty、error 使用统一插画/图标风格  |
| D4  | 卡片 hover / focus 动效精调            | 中     | Design / UX + Frontend | 待认领 | 动效不卡顿、不闪烁、偏好减少动画时禁用   |
| D5  | 中文排版优化（行高、字重、标点）       | 中     | Design / UX + Docs     | 待认领 | 中文模式下阅读舒适，无 overly bold 标题  |
| D6  | 图标系统（统一使用 SVG 或 icon font）  | 低     | Design / UX + Frontend | 待认领 | 替换纯文本箭头/符号为可访问图标          |

### 2.8 文档 / Docs & i18n

| #   | 任务                                    | 优先级 | 负责角色                  | 状态   | 验收标准                                     |
| --- | --------------------------------------- | ------ | ------------------------- | ------ | -------------------------------------------- |
| T1  | 扩展项目计划书                          | 高     | Project Lead + Docs       | 已完成 | plan.md 增加架构/社区/自动化/质量四附录      |
| T2  | README 补充质量与自动化说明             | 中     | Docs                      | 已完成 | README 增加“质量与自动化”章节                |
| T3  | 贡献者指南更新（加入 Design / UX 路径） | 中     | Community + Docs          | 待认领 | CONTRIBUTING.md 里写明设计稿如何提交         |
| T4  | 错误提示与 aria 标签全量 review         | 中     | Docs / i18n + Security/QA | 待认领 | 所有用户可见错误都有中英文，且带 `aria-live` |
| T5  | 视频/动图快速上手指南                   | 低     | Docs / Community          | 待认领 | README 或 docs/quickstart.md 嵌入 GIF/截图   |

---

## 3. 如何进行

1. **认领任务**：在对应任务旁加上 `@github-username`，并在本文件里把状态改成 `进行中`。
2. **开子任务**：大任务拆成 issue，标题前缀用 `[content]` `[frontend]` `[design]` 等。
3. **提交 PR**：小改动直接 PR；架构/流程改动先开 [RFC issue](../.github/ISSUE_TEMPLATE/rfc.yml)。
4. **验收合并**：由对应 area maintainer review，CI 全绿后合并。
5. **更新清单**：合并后把本文件对应行状态改为 `已完成`。

---

## 4. 本周推荐优先级

如果你是新加入的贡献者，建议从以下任务开始：

1. **Design / UX**：D1 设计系统文档，或 D3 空状态视觉（对项目气质影响最大）。
2. **Frontend**：F8 响应式再打磨，或 F11 Lighthouse 性能审计。
3. **Content**：C2 清零 `needs_review` 的技能，或 C3 首批 stable 技能复审。
4. **Automation**：A2 让 HIGH 级别安全扫描阻塞合并，或 A4 定时 sync workflow。
5. **Community**：O3 跑通第一个外部贡献者 PR，或 O2 帮助招募设计师。
