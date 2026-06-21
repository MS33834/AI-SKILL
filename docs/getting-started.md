# AI-SKILL 上手指南

> 5 分钟搞懂 AI-SKILL 是什么、怎么用、以及怎么找到适合自己的技能。

## 1. AI-SKILL 是什么？

AI-SKILL 是一个**开源、社区驱动的 AI 智能体技能索引**，包含两部分：

- **本地技能库（Local Skills）**：`skills/` 目录下经过人工编写的 `SKILL.md` 文件，每个文件都是一段可直接喂给 AI 智能体的结构化提示词。
- **外部仓库索引（External Index）**：从 GitHub 上抓取的 928+ 个公开 AI 技能仓库的元数据索引，按领域、厂商类型、星标等维度可搜索。

我们不是又一个 awesome-list，而是把“技能”作为最小单位，让你能按**能力**找工具、按**场景**找提示词。

## 2. 我该先看什么？

如果你是第一次来，推荐按这个顺序：

1. **首页** —— 看精选推荐和分类统计。
2. **技能库（本地）** —— 直接可用的 `SKILL.md`，适合复制进 Claude、Cursor、Codex、Continue 等 agent。
3. **仓库索引（外部）** —— 发现更大的上游仓库，按 `RAG`、`MCP`、`agent-frameworks` 等分类浏览。
4. **合集（Bundle）** —— 勾选多个本地 skill，一键打包成 zip 下载。

## 3. 首页精选怎么用？

首页的 **Featured** 区块会展示 10+ 个高价值仓库/技能，分为几类：

| 分类 | 适合谁 | 例子 |
|------|--------|------|
| 官方 Cookbook | 想学习厂商最佳实践 | Anthropic Cookbook、OpenAI Cookbook、DeepSeek |
| Agent 框架 | 想搭建自己的 agent | LangChain、LlamaIndex、AutoGPT |
| 推理与部署 | 想私有化部署 LLM | Ollama、vLLM |
| 应用与 UI | 想找现成的聊天/工作流 UI | Dify、Open WebUI、n8n |
| MCP 协议 | 想给 agent 接外部工具 | modelcontextprotocol/servers |
| 本地技能 | 想直接复制提示词 | `code-review`、`api-design-review`、`rag-retrieval-eval`、`mcp-builder` |

点击卡片即可跳转到详情或上游仓库。

## 4. 如何把一个 skill 用到我的 agent 里？

每个本地 skill 详情页都有：

- **When to use** —— 什么时候用
- **Inputs** —— 需要给 agent 提供什么
- **Output** —— 期望得到什么
- **Prompt** —— 可直接复制的提示词
- **Example** —— 输入输出示例

使用步骤：

1. 打开任意 skill（如 [`code-review`](https://ms33834.github.io/AI-SKILL/#/code-review)）。
2. 点击 **Copy prompt** 复制完整 prompt。
3. 粘贴到你的 agent 聊天窗口或 system prompt 里。
4. 按 Inputs 要求补充上下文。

如果你需要一次带走多个 skill，去 **Bundle** 页面勾选后下载 zip。

## 5. 如何找到适合自己的仓库？

去 **Index** 页面，可以用这些方式筛选：

- **按领域（Domain）**：RAG、agent-frameworks、llm-serving、chat-uikits 等
- **按厂商类型（Vendor Type）**：big-corp、popular-community、indie 等
- **按子分类（Category）**：更细分的标签，如 `mcp-protocol`、`vector-databases`
- **按星标（Stars）**：快速找到社区认可度高的仓库
- **搜索**：支持仓库名、厂商、标签、具体技能关键词

每张卡片都会列出该仓库包含的技能，方便你判断要不要点进去。

## 6. 我是上游作者，想认领/更新/移除我的仓库

请看 [docs/upstream-claim.md](upstream-claim.md)，使用
[Upstream author claim / removal](../.github/ISSUE_TEMPLATE/upstream-claim.yml)
issue 模板提交请求。

## 7. 我想贡献 skill

请看 [CONTRIBUTING.md](../CONTRIBUTING.md) 和 [docs/skill-writing-guide.md](skill-writing-guide.md)。
简要流程：

1. Fork 仓库
2. 在 `skills/<your-skill-slug>/` 下创建 `SKILL.md`
3. 运行 `python scripts/validate-skill.py --strict`
4. 提交 PR

## 8. 常见疑问

**Q: 本地 skill 和外部索引有什么区别？**
A: 本地 skill 是本项目维护的通用提示词；外部索引是第三方仓库的元数据，点击会跳转到源仓库。

**Q: 收录标准是什么？**
A: 仓库需公开、含 AI skill / prompt / cookbook / agent 相关资产；本地 skill 需通过 `validate-skill.py` 和 `security-scan.py`。

**Q: 支持哪些 agent 平台？**
A: 本地 skill 大部分是 vendor-neutral，可在 Claude、Cursor、Codex、Continue 等支持 system prompt 的平台上使用。部分 skill 会标注 `platform` 字段表示特别适合某个平台。

## 9. 快速链接

- 首页 / 技能库：<https://ms33834.github.io/AI-SKILL/>
- 外部仓库索引：<https://ms33834.github.io/AI-SKILL/#/external>
- 贡献指南：[CONTRIBUTING.md](../CONTRIBUTING.md)
- 任务看板：[docs/tasks.md](tasks.md)
