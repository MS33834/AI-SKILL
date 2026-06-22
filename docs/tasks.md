# AI-SKILL 任务总览与分工

> 本文档把 [`plan.md`](plan.md) 里的战略拆成可执行、可认领、可验收的任务。
> 所有计划任务由内部核心团队（见 [`docs/core-team.md`](core-team.md)）主导完成；外部贡献者可以参与，但不阻塞项目进度。

---

## 1. 角色地图

| 角色                   | 主要职责                                 | 适合什么样的人                          | 当前状态  |
| ---------------------- | ---------------------------------------- | --------------------------------------- | --------- |
| **Project Lead**       | 定方向、拍板争议、任命维护者             | 项目发起人                              | `badhope` |
| **Content / Curation** | 审核本地 skill、frontmatter、通用化改造  | 内部专家 `core-content`                | 内部负责  |
| **Index / Data**       | 维护外部索引、分类体系、元数据刷新       | 内部专家 `core-data`                   | 内部负责  |
| **Frontend & Tooling** | 前端、CI、脚本、性能、构建               | 内部专家 `core-frontend` + `core-ops`  | 内部负责  |
| **Design / UX**        | 视觉系统、响应式、动效、空状态、品牌素材 | 内部专家 `core-design`                 | 内部负责  |
| **Community / Ops**    | 贡献者 onboarding、上游关系、发布说明    | 内部专家 `core-content`                | 内部负责  |
| **Security / QA**      | 安全扫描规则、测试覆盖、死链监控         | 内部专家 `core-qa`                     | 内部负责  |
| **Docs / i18n**        | 中文/英文文档、教程、错误提示本地化      | 内部专家 `core-content`                | 内部负责  |
| **Contributor**        | 外部可提交 skill、修 bug、提 issue、review PR | 任何想参与的人                    | 开放参与  |

---

## 2. 任务看板

### 2.1 内容 / Content

| #   | 任务                                      | 优先级 | 负责角色               | 状态   | 验收标准                                                           |
| --- | ----------------------------------------- | ------ | ---------------------- | ------ | ------------------------------------------------------------------ |
| C1  | 建立 skill 复审流程                       | 高     | Content + Project Lead | 已完成 | GOVERNANCE 里写明 stable 准入流程；首批 5 个 skill 通过复审        |
| C2  | 把现有 `needs_review: true` 的技能清零    | 高     | Content                | 已完成 | 38 个本地 skill 全部 `needs_review: false`（模板除外）             |
| C3  | 首批 10 个 skill 标记为 `quality: stable` | 高     | Content + Security/QA  | 已完成 | 通过 `validate-skill.py --strict` + `security-scan.py` 无 HIGH/MED |
| C4  | 从上游仓库再通用化 20 个 skill            | 中     | Content                | 已完成 | 已新增 23 个 vendor-neutral skill；本地 skill 总数 61             |
| C5  | 完善中文翻译（name_zh / description_zh）  | 中     | Docs / i18n            | 已完成 | 100% 本地 skill 有中文名和中文描述                                 |
| C6  | 撰写 skill 编写最佳实践指南               | 低     | Content + Docs         | 已完成 | docs/skill-writing-guide.md 合并                                   |

### 2.2 索引 / Index

| #   | 任务                                                         | 优先级 | 负责角色               | 状态   | 验收标准                                                   |
| --- | ------------------------------------------------------------ | ------ | ---------------------- | ------ | ---------------------------------------------------------- |
| I1  | 外部索引支持自动加载 / 虚拟滚动                              | 高     | Frontend               | 已完成 | 首屏 60 条，滚动加载，无卡顿                               |
| I2  | 索引元数据定时刷新（stars / license / pushed_at / archived） | 高     | Index / Data + Tooling | 已完成 | `.github/workflows/scheduled-sync.yml` 每周运行并自动提 PR |
| I3  | 死链自动检测与告警                                           | 高     | Index / Data + Tooling | 已完成 | 每周 `check-links.py` 跑一遍，失败自动开 issue             |
| I4  | 外部仓库 `skills` 字段补全与质量校验                         | 中     | Index / Data           | 已完成 | 100% 仓库有非空 `skills` 列表；已移除未使用的 `subgroup` 字段 |
| I5  | 分类体系review（49 个子分类是否够用）                        | 中     | Content + Index        | 已完成 | 已合并 4 个低活跃分类（customer-support→applications、legal→applications、video-generation→multimodal、case-studies→awesome-lists），分类数从 49 降至 45；脚本 `scripts/merge-categories.py` 已更新并同步 `frontend/public/external-repos.json` |
| I6  | 外部索引搜索支持拼写建议                                     | 低     | Frontend               | 已完成 | 搜索无结果时给出 "Did you mean"；基于 Levenshtein 距离      |

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
| F8  | 响应式再打磨（移动端 320px–768px） | 高     | Design / UX + Frontend    | 已完成 | 主要页面在 DevTools 各尺寸无横向滚动、不重叠                    |
| F9  | 暗色模式对比度与焦点状态审计       | 中     | Design / UX + Security/QA | 已完成 | 焦点环可见；对比度待后续设计系统迭代                            |
| F10 | 空状态 / 错误状态插画与文案        | 中     | Design / UX + Docs        | 已完成 | 404、无结果、加载失败统一使用 `.empty-state` / `.error-state`   |
| F11 | 性能审计与优化（Lighthouse 90+）   | 中     | Frontend                  | 已完成 | JSON 压缩 30%+；字体 preload；404 页移除 Google Fonts；preconnect 已加 |
| F12 | PWA 离线缓存（可选）               | 低     | Frontend                  | 已完成 | manifest + Service Worker；离线可浏览已缓存外壳与静态资源      |

### 2.4 自动化 / Automation

| #   | 任务                                      | 优先级 | 负责角色                | 状态   | 验收标准                                                    |
| --- | ----------------------------------------- | ------ | ----------------------- | ------ | ----------------------------------------------------------- |
| A1  | CI 集成 Python 校验 + 安全扫描 + 前端检查 | 高     | Tooling / Ops           | 已完成 | `.github/workflows/ci.yml` 阻塞合并                         |
| A2  | 安全扫描 HIGH 级别告警阻塞合并            | 高     | Security / QA + Tooling | 已完成 | CI 中 `security-scan.py --fail-on-high` 遇到 HIGH 时 exit 1 |
| A3  | Release Notes 自动生成                    | 中     | Tooling / Ops           | 已完成 | `.github/release.yml` 分类配置                              |
| A4  | 定时 sync + link-check workflow           | 高     | Index / Data + Tooling  | 已完成 | `.github/workflows/scheduled-sync.yml` 每周运行并自动提 PR  |
| A5  | 前端构建产物部署到 Pages                  | 中     | Tooling / Ops           | 已完成 | GitHub Pages 自动部署；GitCode Pages 需平台侧单独配置       |
| A6  | 依赖自动更新（Dependabot）                | 低     | Tooling / Ops           | 已完成 | `.github/dependabot.yml` 启用 npm/pip 每周更新              |

### 2.5 社区 / Community

| #   | 任务                                                  | 优先级 | 负责角色                 | 状态     | 验收标准                                       |
| --- | ----------------------------------------------------- | ------ | ------------------------ | -------- | ---------------------------------------------- |
| O1  | 任命首批内部 Maintainer（Content / Frontend / Community） | 高     | Project Lead | 已完成   | 内部核心团队 7 个 area maintainer 写入 `docs/core-team.md` + `GOVERNANCE.md` |
| O2  | Design / UX 内部负责人任命并产出设计规范             | 高     | Project Lead + core-design | 已完成   | `core-design` 负责设计系统、动效、品牌素材；D4 / T5 由其验收 |
| O3  | 贡献者 onboarding 流程跑通                            | 高     | core-content | 已完成   | `docs/onboarding-walkthrough.md` + README 链接；内部验证通过 |
| O4  | 上游仓库作者认领机制                                  | 中     | Community + Content      | 已完成   | 新增 upstream-claim.yml 与 docs/upstream-claim.md；含 10 个首批目标与邀请模板 |
| O5  | 每月发布项目更新（newsletter / release notes）        | 中     | core-content | 已完成   | 首份月度更新 `docs/updates/2026-06.md` 已发布；后续由内部团队持续执行 |
| O6  | 行为准则（CODE_OF_CONDUCT.md）落地                    | 低     | Project Lead + Community | 已完成   | 明确举报渠道与处理流程                         |

### 2.6 质量 / Quality

| #   | 任务                             | 优先级 | 负责角色              | 状态   | 验收标准                                    |
| --- | -------------------------------- | ------ | --------------------- | ------ | ------------------------------------------- |
| Q1  | `quality` 字段在 UI 展示         | 高     | Frontend              | 已完成 | 列表、详情、bundle 均显示 quality chip      |
| Q2  | 安全扫描分级（HIGH / MED / LOW） | 高     | Security / QA         | 已完成 | `security-scan.py` 输出分级结果             |
| Q3  | stable 准入检查清单              | 中     | Content + Security/QA | 已完成 | docs/stable-checklist.md 合并               |
| Q4  | 季度 skill 复审机制              | 低     | core-qa + core-data   | 已完成 | `scripts/quarterly-review.py` + `docs/reports/quarterly-review-2026Q2.md`；首次复审 10 stable skills 全部通过 |
| Q5  | 输入输出 schema 校验增强         | 低     | Tooling / Ops         | 已完成 | `validate-skill.py` 校验 JSON schema 可解析 |

### 2.7 设计 / Design & UX

| #   | 任务                                   | 优先级 | 负责角色               | 状态   | 验收标准                                                   |
| --- | -------------------------------------- | ------ | ---------------------- | ------ | ---------------------------------------------------------- |
| D1  | 设计系统文档（颜色、字体、间距、组件） | 高     | Design / UX            | 已完成 | docs/design-system.md，与 style.css 对齐                   |
| D2  | 品牌标识与 favicon                     | 中     | Design / UX            | 已完成 | 提供 SVG favicon 与 header inline brand mark               |
| D3  | 空状态 / 错误页视觉统一                | 中     | Design / UX + Frontend | 已完成 | 404、empty、error 使用统一 `.empty-state` / `.error-state` |
| D4  | 卡片 hover / focus 动效精调            | 中     | Design / UX + Frontend | 已完成 | 外部卡片增加 hover 阴影/顶部条加粗；链接与 skill pill 微浮起；CSS 变量统一 |
| D5  | 中文排版优化（行高、字重、标点）       | 中     | Design / UX + Docs     | 已完成 | `:lang(zh)` 调整行高与标题字重，提升中文阅读舒适度         |
| D6  | 图标系统（统一使用 SVG 或 icon font）  | 低     | Design / UX + Frontend | 已完成 | `iconSvg()` 替代纯文本箭头，currentColor 适配深浅模式      |

### 2.8 文档 / Docs & i18n

| #   | 任务                                    | 优先级 | 负责角色                  | 状态   | 验收标准                                            |
| --- | --------------------------------------- | ------ | ------------------------- | ------ | --------------------------------------------------- |
| T1  | 扩展项目计划书                          | 高     | Project Lead + Docs       | 已完成 | plan.md 增加架构/社区/自动化/质量四附录             |
| T2  | README 补充质量与自动化说明             | 中     | Docs                      | 已完成 | README 增加“质量与自动化”章节                       |
| T3  | 贡献者指南更新（加入 Design / UX 路径） | 中     | Community + Docs          | 已完成 | CONTRIBUTING.md 里写明设计稿如何提交                |
| T4  | 错误提示与 aria 标签全量 review         | 中     | Docs / i18n + Security/QA | 已完成 | 列表/外部索引搜索带 `aria-live`，错误提示已中英双语 |
| T5  | 视频/动图快速上手指南                   | 低     | Docs / Community          | 已完成 | docs/quickstart.md 已嵌入 4 张真实生成 GIF（首页、搜索、skill 详情、Bundle 下载），源文件位于 docs/assets/quickstart/；更新 docs/quickstart-recording.md |

---

## 3. 如何进行

1. **认领任务**：在对应任务旁加上 `@github-username`，并在本文件里把状态改成 `进行中`。
2. **开子任务**：大任务拆成 issue，标题前缀用 `[content]` `[frontend]` `[design]` 等。
3. **提交 PR**：小改动直接 PR；架构/流程改动先开 [RFC issue](../.github/ISSUE_TEMPLATE/rfc.yml)。
4. **验收合并**：由对应 area maintainer review，CI 全绿后合并。
5. **更新清单**：合并后把本文件对应行状态改为 `已完成`。

---

## 4. 本周推荐优先级

内部核心团队优先推进以下任务；外部贡献者可作为补充参与：

1. **Design / UX**：D1 设计系统文档，或 D3 空状态视觉（对项目气质影响最大）。
2. **Frontend**：F8 响应式再打磨，或 F11 Lighthouse 性能审计。
3. **Content**：C2 清零 `needs_review` 的技能，或 C3 首批 stable 技能复审。
4. **Automation**：A2 让 HIGH 级别安全扫描阻塞合并，或 A4 定时 sync workflow。
5. **Community / Ops**：O3 内部模拟一次贡献者 PR，O5 发布首份月度更新。
