# AI-SKILL

一个能直接用的 agent 技能索引 —— 仓库、cookbook、MCP server、生产
案例分析。都是真正上手搭 LLM 项目时会用到的东西。

不是代码库，不是教程站。就是一份 YAML 文件，900+ 条精心挑过的
`source_url` 指针，按 49 个分类排好。读一读，点过去，到上游仓库用
起来。整套就这点事。

[English](./README.md) · [简体中文](./README.zh.md)

## 为什么做这个

agent 生态里有成千上万个好仓库，散在 GitHub、arXiv、各家研究博客
里。直接搜 GitHub 出来一堆噪音。已有的 awesome-list 大多没人维护，
或者夹带私货。

这个仓库就是一份手工维护的 YAML。价值在「挑」：每条都有能访问的
`source_url`、一行中英 `summary`、一个 49 个分类之一的 `category`。
你可以 grep、可以挪走用、可以自己渲染、也可以 clone 当成你自己的
列表起点。

## 里面有什么

- **`catalog/skills.yaml`** —— 索引本体。927 条记录，49 个分类，
  中英双语。每条对应一个上游仓库。
- **`catalog/own_skills.yaml`** —— 我们自己写的、托管在本仓库的
  技能索引（"自营货架"）。现在为空，格式看 `skills/`。
- **`skills/`** —— 自营技能文件（frontmatter + Markdown）的存放目
  录。刻意留空，等有东西再填。

不托管、不镜像、不打包别人的工作。目录指过去，上游交付。

## 49 个分类

完整列表在 `catalog/skills.yaml` 的 `categories:` 下面。挑几条让
你感受一下粒度：

| # | 分类 | 装什么 |
|---:|---|---|
| 01 | 官方 Cookbook | 厂商出的范式合集（Anthropic、OpenAI、Google……）|
| 03 | Agent 框架 | LangChain、AutoGen、CrewAI、smolagents…… |
| 04 | RAG 与检索 | 向量库、retriever、chunking、embedding 管道 |
| 10 | MCP 协议 | Model Context Protocol 的 server、client、gateway |
| 22 | 合成数据 | self-instruct、evol-instruct、蒸馏 |
| 35 | 推理模型 | 思维链、o1 风格、自洽 |
| 49 | 案例 | 生产复盘、行业报告 |

新条目归到已有的分类里。新分类得先开个 issue 说理由。

## 一条记录的格式

`catalog/skills.yaml` 顶层 `skills:` 数组里每条记录的形状：

```yaml
- slug: anthropic-cookbook            # 唯一 id，kebab-case
  title: Claude Cookbook              # 展示名（英）
  title_zh: Claude Cookbook           # 展示名（中）
  source: anthropics/anthropic-cookbook         # GitHub 上 owner/repo
  source_url: https://github.com/anthropics/anthropic-cookbook
  category: official-cookbooks        # 49 个分类之一
  subgroup: us-frontier-labs          # 可选，更细的分组
  tags:                               # 2-5 个小写标签
    - claude
    - anthropic
    - official
    - notebook
  summary: Anthropic's official notebook collection for Claude — tool use, PDF, structured output.
  summary_zh: Anthropic 官方 notebook 合集：工具调用、PDF 理解、结构化输出。
  stars: 22000                        # sync-github 每日刷新
  license: MIT                        # SPDX id，每日刷新
  pushed_at: 2026-06-04               # 上游最近一次提交
  added: 2026-06-04                   # 加进索引的时间
  archived: false                     # 上游 archive 了就 true
```

`source` + `source_url` 是指针，其他都是元数据。`added` 是这条
记录加进索引的日期，**别**跟文件修改时间搞混。

非 GitHub 来源（比如 case-studies 分类下的 arXiv 论文、博客复盘），
`source` 字段写域名（比如 `arxiv.org`），`source_url` 写具体页
面。sync-github 脚本会自动跳过这些。

## 怎么用

仓库本身就是目录。没有文档站、没有 Pages 构建、没有 API。数据
就是产品。

代码读：

```python
import yaml
with open("catalog/skills.yaml") as f:
    data = yaml.safe_load(f)
entry = next(s for s in data["skills"] if s["slug"] == "langchain")
print(entry["source_url"])
```

命令行读（需要 [`yq`](https://github.com/mikefarah/yq)）：

```bash
# RAG 分类下所有条目
yq '.skills[] | select(.category == "rag-retrieval")
    | [.slug, .source_url] | @tsv' catalog/skills.yaml

# 某家 org 的所有条目
yq '.skills[] | select(.source | startswith("openai/"))
    | .slug' catalog/skills.yaml

# 分类及条目数
yq '.skills | group_by(.category) | .[]
    | {cat: .[0].category, n: length}' catalog/skills.yaml
```

## 怎么扩展

**加一条外部技能** —— 一次 PR、一次文件编辑：

1. fork 这个仓库。
2. 在 `catalog/skills.yaml` 的 `skills:` 下追加一条，用上面的格式。
3. 约束：`slug` 唯一、`source_url` 能访问（2xx，不是 404）、
   `summary` 和 `summary_zh` 各一行、`category` 在 49 个里挑。
4. 开 PR。link-check workflow 会 ping 你的 `source_url`。merge
   之后 sync workflow 在一天内把 `stars` / `license` / `pushed_at`
   补上。

**在自营货架发布** —— 用 `skills/` 这个目录：

1. 把 `skills/_TEMPLATE.md` 复制成 `skills/<your-slug>.md`。
2. 在 `catalog/own_skills.yaml` 里加一行，至少有个 `path` 字段
   指回你的文件。
3. 开 PR。

没有审核队列、没有流程卡。条目对、链接通，merge 就完了。

## 两个辅助脚本

都在 `scripts/` 下。除了 `pyyaml` 和 `ruamel.yaml` 都是标准库。
本地和 CI 都能跑。

### `scripts/sync-github.py`

通过 GitHub API 刷新每条 GitHub 托管记录的 `stars` / `license` /
`pushed_at` / `archived`。每天 06:00 UTC 跑一次，开 PR 提差异。

```bash
pip install ruamel.yaml
GITHUB_TOKEN=ghp_xxx python scripts/sync-github.py --dry-run   # 预览
GITHUB_TOKEN=ghp_xxx python scripts/sync-github.py             # 写回
```

不带 token 是 60 次/小时（串行，900 条要 15 小时左右）。带 token
5,000 次/小时，12 个并发 worker，3 分钟左右跑完。

### `scripts/check-links.py`

ping 每个 `source_url`，分类结果，把摘要写到 `data/health.json`。
每周一 04:00 UTC 跑一次。任何 4xx/5xx/timeout 都会让 workflow 失
败，死链是响的。

```bash
pip install pyyaml
python scripts/check-links.py            # 打印摘要
python scripts/check-links.py --fail     # 死链时退出码 1
```

链接死了（仓库搬家、变私有、URL 写错）脚本会指出来，workflow 失败。
你下个 PR 改对 URL，下个周一又绿了。

## 什么时候别用这个

- 要深度对比两个框架的实现细节。本仓库不做 benchmark，只指
  给你上游。
- 要实时 star 数。本仓库每天刷一次，要 live 数直接看 GitHub。
- 想看教程。本仓库链到的仓库里有教程。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。**索引本身**用 MIT 许可，每条指向
的技能保留其上游仓库的许可。
