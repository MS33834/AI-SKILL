# Plan

## 写在前面的废话

这个仓库一开始是个 link list —— 收集 agent 相关的 GitHub
项目，然后 fork 别人抄一抄就叫"comprehensive curated index"。

这种 awesome-list 全网有八百个，没一个能用的：
点进去是个 GitHub 链接，链接里有个子目录，子目录里有个
SKILL.md，SKILL.md 写着"summarise a PDF"，没有 prompt
没有 example 没有任何能跑的东西。

我们要做的是把这些技能**全部下载下来，落盘到本地**，改到
能用的程度。

就这样。

## 这个仓库是干嘛的

一个本地技能保险柜。`skills/` 下面全是真东西，clone
下来就能用，不需要再去 GitHub 找。

外部项目的链接列表（`external-index/`）是顺带的，
留作发现入口，主要产品是 `skills/` 本身。

## 设计原则

能用就行，别装。

- **完全本地** —— 抓下来的技能是文件，不是 URL。删掉
  源仓库也不影响使用
- **平台中立** —— 默认所有技能在 Claude / Codex / Cursor
  / Continue / 任何能读 Markdown 的地方都能跑。
  哪个真做不到，在 frontmatter 里老实标 `platforms: [claude]`
- **可直接读源码** —— 不要在 prompt 外面包 JSON 包 YAML
  包 XML 包三层
- **脚本不要玄学** —— 全部 Python 标准库 + pyyaml +
  ruamel，不引外部依赖，不引 web 框架

## 目录结构

```
.
├── skills/                  # 主体：本地技能
│   ├── _index.yaml          # 机读索引
│   ├── _TEMPLATE.md         # frontmatter 模板
│   ├── pdf-summarizer/
│   │   ├── SKILL.md
│   │   └── assets/          # 可选
│   └── ...
│
├── external-index/          # 外部项目链接列表（旧功能保留）
│   ├── skills.yaml
│   └── health.json
│
├── frontend/                # 静态站点
│   ├── src/
│   ├── public/              # skills.json 快照
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts       # 详细设计见 docs/frontend-design.md
│
├── scripts/                 # 全部 Python
│   ├── fetch-skill.py       # 从上游抓 SKILL.md 落到本地
│   ├── validate-skill.py    # 校验 frontmatter + body
│   ├── install-skill.py     # 装到本地 agent 技能目录
│   ├── bundle-skill.py      # 打包 ZIP
│   ├── sync-external-index.py # skills.yaml → frontend 数据
│   ├── sync-github.py       # 刷 external-index 元数据（GitHub 源）
│   └── check-links.py       # 检查 external-index 死链
│
├── bundles/                 # bundle-skill.py 输出，gitignore
│
├── .github/                 # ISSUE_TEMPLATE / PR_TEMPLATE
│
├── docs/
│   ├── plan.md              # 本文件
│   ├── schema.md            # frontmatter 字段说明
│   └── frontend-design.md   # 前端设计
│
├── README.md
├── README.zh.md             # 中文版
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── SOURCE.md                # 仓库里技能的来源声明
```

## 怎么用

### 我想用某个技能

```bash
git clone https://gitcode.com/badhope/AI-SKILL
ls skills/                            # 看看有什么
cat skills/pdf-summarizer/SKILL.md    # 读一下
```

或者直接装到本地 agent：

```bash
python scripts/install-skill.py pdf-summarizer --target claude
# → ~/.claude/skills/pdf-summarizer/SKILL.md
```

或者打个包带走：

```bash
python scripts/bundle-skill.py --all -o skills-v1.zip
```

### 我想加新技能

1. 把源文件丢到 `skills/<your-slug>/SKILL.md`
2. 写好 frontmatter（看 `docs/schema.md`）
3. `python scripts/validate-skill.py` 跑一遍
4. 开 PR

### 我想批量抓别人的技能

```bash
# 单个
python scripts/fetch-skill.py \
  --source anthropics/anthropic-skills \
  --path skills/pdf \
  --out skills/pdf-summarizer

# 批量，自己准备一个 JSON 源列表
python scripts/fetch-skill.py --all --sources my-sources.json
```

抓下来之后按 `docs/schema.md` 整理 frontmatter，
再跑 `validate-skill.py` 校验一遍。

## 脚本

| 脚本 | 干啥 |
|---|---|
| `fetch-skill.py` | 从上游抓 SKILL.md 落到本地，连同 `SOURCE.md` 写明来源 |
| `validate-skill.py` | 校验 frontmatter + body 结构 |
| `install-skill.py` | `cp -r skills/<slug> ~/.claude/skills/`，就这样 |
| `bundle-skill.py` | `zip` 一下，结构跟 `skills/` 一致，解压即用 |
| `sync-external-index.py` | `external-index/skills.yaml` → `frontend/public/external-repos.json` |
| `sync-github.py` | 刷 `external-index/skills.yaml` 的 stars / license（GitHub 源） |
| `check-links.py` | ping `external-index` 里所有 source_url |

## Frontmatter 是关键

详细规则看 `docs/schema.md`。这里只说最重要的一点：

**frontmatter 不绑死平台**。一个技能默认在所有
agent 上都能跑。如果有部分内容只对 Claude 有效，
那一段开头写：

```markdown
> **Claude-only** — 下面这段假设 Claude 的 tool_use 格式
```

就这样，标一行，不要把所有内容都包在某种 vendor SDK 里。

## 我们**不**做的事

明确写出来：

- **不**做 marketplace / 评论 / 评分 / 收藏
- **不**执行 prompt（我们是数据仓库，不是 runtime）
- **不**做服务端（前端纯静态）
- **不**搞 per-skill 版本号，仓库级别 tag 够用
- **不**做 vendor 锁定。某天所有 agent 都换实现了，
  这些文件还能读

## 怎么算做完了

- [x] `git clone` 下来断网也能用
- [x] `validate-skill.py` 0 错误 0 warning
- [x] `npm run build` 成功
- [x] 装一个技能 = 一条命令
- [x] 不存在 `needs_review: true` 的技能
- [x] 站点 UI 国际化（EN / 中文可切）
- [x] 外部索引支持搜索 / 分组 / 分页 / 自动加载
- [x] CI 覆盖校验、安全扫描、Lint、测试、构建
- [x] 社区贡献流程跑通（外部 PR 可合并）：`CONTRIBUTING.md` + `GOVERNANCE.md` + issue/PR 模板 + `docs/core-team.md` 已落地
- [x] 索引自动化定时刷新（stars / license / 死链）：`.github/workflows/scheduled-sync.yml` 每周日运行，自动提 PR
- [x] 首批 `quality: stable` 技能通过复审：首批 10 个 skill 已标记 stable，季度复审机制已建立

---

## 附录一：AI 索引展示架构

我们把这个项目当成一个**“可读、可搜索、可落地”的技能索引**，而不是一个链接列表。架构分成两条轨道：

### 1. 本地 Vault：`skills/`

这是主产品。每个技能是一份独立的 `SKILL.md`，带完整 frontmatter：

```
skills/<slug>/
├── SKILL.md       # 技能主体：prompt、输入输出、示例
└── assets/        # 可选：示例图、模板文件
```

数据流：

```
SKILL.md
  → validate-skill.py 校验 frontmatter / body
  → skills/_index.yaml 机读索引
  → frontend/public/skills.json + skills/<slug>.json
  → 前端列表页 / 详情页 / 合集打包页
```

要点：

- 所有内容落盘到 Git，clone 后断网可用。
- 前端是静态站点，没有服务端、没有数据库、没有用户追踪。
- 支持中英双语切换，frontmatter 里的 `name_zh` / `description_zh` 会被优先展示。

### 2. 外部索引：`external-index/`

这是发现入口。收录上游仓库，每张卡片告诉用户“这个仓库提供哪些具体技能”，并直达源地址：

```
external-index/skills.yaml
  → sync-external-index.py
  → frontend/public/external-repos.json
  → /#/external 搜索页
```

前端能力：

- 按领域 / 厂商类型 / 分类 / 星标分组
- 按名称、厂商、标签、技能关键字搜索
- 首屏 60 张卡片 + 滚动自动加载（IntersectionObserver），避免一次性渲染 900+ 卡片卡顿
- 卡片展示仓库提供的具体 `skills` 列表，而不是只给一个链接

### 3. 为什么用静态站点

- **隐私**：不记录用户搜了什么、点了什么。
- **离线**：构建产物可以丢到任意静态托管，甚至本地 `file://` 打开。
- **长寿**：十年后只要 Git 仓库还在，站点就能重新 build。
- **性能**：没有 API 延迟，所有数据是本地 JSON，搜索和过滤在浏览器里完成。

---

## 附录二：社区开放化策略

这个仓库能不能活，不靠一个人维护，靠**足够低的贡献门槛 + 足够清晰的角色分工**。

### 角色

| 角色 | 职责 |
|---|---|
| User | 用技能、提 issue、反馈链接失效 |
| Contributor | 提交新技能、修正文档、修 bug |
| Reviewer | 审 PR，确认 frontmatter 和示例正确 |
| Maintainer | 合并 PR、维护 CI、决定发布节奏 |
| Project Lead | 定方向、处理争议、对外沟通 |

具体定义见 [`GOVERNANCE.md`](file:///workspace/AI-SKILL/GOVERNANCE.md) 和 [`docs/maintainer-onboarding.md`](file:///workspace/AI-SKILL/docs/maintainer-onboarding.md)。

### 贡献入口

1. **加一个本地技能**：丢 `skills/<slug>/SKILL.md` → 跑 `validate-skill.py` → 开 PR。
2. **加一个外部仓库**：在 `external-index/skills.yaml` 填 `source_url` 和分类 → 开 PR。
3. **报 bug / 死链**：用 `.github/ISSUE_TEMPLATE/bug_report.yml` 或 `dead-link.yml`。
4. **大改动**：先开 RFC issue，讨论清楚再写代码。

### 决策方式

- 日常 PR：1 个 maintainer review 通过即可合并。
- 有争议的：RFC issue 里公开讨论，lazy consensus（7 天无反对意见视为通过）。
- -breaking change：需要 Project Lead 拍板。

### 对外姿态

- **我们不是 fork 竞争者**：所有上游技能都写清楚 `source.url` 和 `source.commit`，并在 `SOURCE.md` 致谢。
- **欢迎原仓库作者认领**：如果上游作者愿意，可以直接把他们仓库里的 SKILL.md 同步到这里，并给他们 reviewer 权限。
- **双平台同步**：GitCode 服务国内访问，GitHub 服务国际访问，代码两边一致。

---

## 附录三：索引自动化与可持续

人不能一直手动刷新 928 个仓库的 stars 和 license。自动化是索引“不腐烂”的关键。

### 已有脚本

| 脚本 | 作用 |
|---|---|
| `validate-skill.py --strict` | 校验所有本地技能 frontmatter / body |
| `security-scan.py` | 扫描 SKILL.md 里的危险命令、私钥、越狱提示 |
| `sync-external-index.py` | 把 `external-index/skills.yaml` 转成前端 JSON |
| `sync-github.py` | 刷外部仓库的 stars / license / archived / pushed_at |
| `check-links.py` | 检查 `external-index` 死链 |
| `fetch-skill.py` | 从上游抓 SKILL.md 落到本地 |

### CI 门禁

`.github/workflows/ci.yml` 每次 push / PR 都会跑：

1. Python 校验 + 安全扫描
2. 前端 TypeCheck + ESLint + Prettier 检查 + Vitest 单元测试
3. Vite 生产构建

通过才能合并。

### 未来自动化

- 定时 workflow：每周跑一次 `sync-github.py` + `check-links.py`，自动生成 `external-index/health.json` 更新 PR。
- Release workflow：打 tag 时自动发布 GitHub Release，使用 `.github/release.yml` 分类生成 release notes。
- 安全扫描升级：把 HIGH 级别告警变成合并阻塞项。

### 成本控制

- 所有脚本用 Python 标准库 + `pyyaml` / `ruamel`，不需要服务器。
- 前端纯静态，托管免费（GitHub Pages / GitCode Pages）。
- GitHub API 调用用仓库级缓存，避免超限。

---

## 附录四：质量标准与分级

不是所有技能都一样成熟。我们用 `quality` 字段把状态透明地告诉用户。

### 五级质量标签

| 标签 | 含义 | 用户预期 |
|---|---|---|
| `stable` | 已复审、示例可跑、无已知问题 | 放心用 |
| `beta` | 基本可用，可能在边界场景出错 | 可用，遇到问题请反馈 |
| `alpha` | 功能完整但未经充分测试 | 谨慎用于生产 |
| `experimental` | 新概念或新格式，可能大改 | 看着玩，别依赖 |
| `draft` | 刚落盘，还在整理 | 暂时别用 |

### stable 准入条件

- frontmatter 完整且通过 `validate-skill.py --strict`
- `needs_review: false`
- 包含至少一个可运行的 `example`
- 通过 `security-scan.py`，无 HIGH/MED 级别告警
- 最近一次人工 review 不超过 6 个月

### Review 流程

1. 新技能默认 `quality: draft` 或 `experimental`，可标 `needs_review: true`。
2. PR 由 reviewer 检查 `schema.md` 合规性、示例可复现性、安全性。
3. 合并后如果达到 stable 条件，由 maintainer 在后续 PR 里把 `quality` 改为 `stable`。
4. 每季度批量复审一次 `stable` 技能，失效的降级为 `beta`。

---

## 写在最后

仓库是给真人看的，不是给 AI 看的，也不是给老板看
的。写得清楚点，写得有人味一点，少堆术语。

如果某段文字读起来像"Utilising our robust
leverage of synergies"那种调调，重写。
