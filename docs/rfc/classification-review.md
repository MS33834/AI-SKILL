> 本文件为 RFC 草案，用于发起 I5「分类体系 review」任务。定稿后应提交为 GitHub / GitCode issue（标签 `rfc` + `index`），并根据社区反馈投票或拆分/合并分类。

# RFC：外部索引分类体系 review（49 分类是否够用）

## Summary

当前 `external-index/skills.yaml` 定义了 49 个分类，覆盖从底层训练到上层应用的 AI 生态。随着索引规模从数百增长到近 1000 个仓库，部分分类出现过度集中、部分分类长期冷清、少数分类边界模糊的问题。本 RFC 建议对分类体系进行一次系统性 review，目标是：

1. 让用户在 3 次点击内找到目标仓库。
2. 降低维护者新增分类时的决策成本。
3. 为后续「按分类推荐 skill」和「分类热度榜单」打好基础。

## Motivation

基于当前索引的统计数据：

- 总收录仓库：928 个
- 已使用分类：49 / 49（无空分类）
- 头部 10 个分类集中了 52% 的仓库
- 尾部 10 个分类仅占总数的 4%

具体表现为：

- **过度集中**：`vector-databases`（56）、`agent-frameworks`（48）、`official-cookbooks`（44）等分类下卡片过多，用户滚动成本高。
- **过于冷清**：`customer-support`（3）、`legal`（4）、`video-generation`（6）等分类内容稀缺，单独展示价值低。
- **边界模糊**：
  - `dev-tools` vs `code-assistants` vs `terminal-cli`
  - `safety-alignment` vs `guardrails`
  - `multimodal` vs `image-generation` / `video-generation` / `audio-speech`
  - `applications` vs `chat-uikits`
- **层级扁平**：所有分类处于同一层级，缺少「基础模型 / infra / 应用」等更高层聚合。

## Detailed proposal

### 方案 A：保守调整（推荐作为第一步）

只对明显问题分类做合并/拆分，不引入层级。

#### 合并（低活跃 → 并入相邻分类）

| 原分类 | 目标分类 | 理由 |
| ------ | -------- | ---- |
| `customer-support` | `applications` | 客服应用本质上是终端应用 |
| `legal` | `applications` 或新增 `enterprise-ai` | 当前样本太少，暂不独立 |
| `video-generation` | `multimodal` | 与图像/音频同属生成式多模态 |
| `case-studies` | `awesome-lists` | 两者都是索引/资源型内容 |

#### 拆分（高活跃 → 增加子分类）

| 原分类 | 拆分建议 | 触发条件 |
| ------ | -------- | -------- |
| `agent-frameworks` | `agent-frameworks` + `agent-orchestration` | 当该分类超过 60 个仓库时 |
| `vector-databases` | `vector-databases` + `search-engines` | 当向量库与通用搜索引擎混排过多时 |
| `official-cookbooks` | 保留，但增加 `vendor` 筛选维度 | 避免按厂商分类膨胀 |

#### 重命名/澄清

| 原分类 | 建议名 | 说明 |
| ------ | ------ | ---- |
| `dev-tools` | `ai-dev-tools` | 已经是 slug，但描述应强调「面向开发者」 |
| `code-assistants` | `coding-assistants` | 避免与 `code-llms` 混淆 |

### 方案 B：引入两层分类（长期方向）

在保守调整基础上，引入 `group`（大类）+ `category`（子类）两层结构：

```yaml
groups:
  - slug: foundation
    name: Foundation Models
    categories: [llm-serving, fine-tuning, distributed-training, quantization, model-merging]
  - slug: data-infra
    name: Data & Infra
    categories: [rag-retrieval, vector-databases, embeddings, knowledge-graphs, data-pipelines, synthetic-data]
  - slug: agent-systems
    name: Agents & Tooling
    categories: [agent-frameworks, tool-use, mcp-protocol, memory, browser-automation, computer-use]
  - slug: apps
    name: Applications
    categories: [applications, chat-uikits, documentation, text-to-sql, education, finance, medical-bio, scientific-ml]
  - slug: trust-safety
    name: Trust & Safety
    categories: [guardrails, safety-alignment, privacy-federated, observability]
  - slug: dev-experience
    name: Developer Experience
    categories: [dev-tools, code-llms, code-assistants, terminal-cli]
  - slug: content
    name: Content & Media
    categories: [multimodal, image-generation, audio-speech, video-generation, translation]
  - slug: resources
    name: Resources
    categories: [official-cookbooks, prompt-libraries, awesome-lists, case-studies]
```

该方案需要：

1. 在 `external-index/skills.yaml` 中新增 `groups` 字段。
2. 在 `frontend/src/pages/external.ts` 中支持「先选大类、再选子类」的筛选交互。
3. 保持现有 `category` slug 不变，确保 URL 和 bookmark 向后兼容。

## Alternatives considered

- **完全自由标签（tags-only）**：放弃分类，只用 tags 搜索。 rejected：新用户需要分类作为导航入口，纯标签对冷启动不友好。
- **按厂商/组织分类**：例如 `google`、`microsoft`、`openai`。 rejected：与「能力」维度冲突，且同一厂商跨多个技术栈。
- **维持现状 49 分类**：rejected：头部过载、尾部冷清问题会随索引增长恶化。

## Impact

- **数据迁移**：合并分类时需要批量修改 `external-index/skills.yaml` 中对应仓库的 `category`。
- **前端改动**：保守方案只需更新 UI 分类列表；两层方案需新增 group 筛选器。
- **向后兼容**：`category` slug 尽量保留；若必须改名，提供 301 映射或保留旧 slug 作为 alias。
- **文档更新**：`docs/schema.md`、`CONTRIBUTING.md` 中分类说明需要同步。

## Open questions

1. 是否接受「两层分类」方案，还是先做保守调整？
2. `official-cookbooks` 是否应拆分为 `vendor-cookbooks` + `community-cookbooks`？
3. `multimodal` 作为大杂烩分类是否合理，还是应拆分为 `vision-language`、`image-generation`、`video-generation`、`audio-speech` 四个独立分类？
4. 是否需要为每个分类设置「最小仓库数」准入门槛（例如低于 5 个仓库不单独成类）？
5. 分类 review 的投票周期：2 周是否足够？

## Recommended next steps

1. 由 Index / Data maintainer 发布本 RFC issue，并置顶 2 周。
2. 收集社区反馈后，由 maintainer 在 issue 中发布最终决策表。
3. 按决策表执行分类调整，并更新 `docs/tasks.md` 中 I5 状态为「已完成」。

## Appendix：当前分类分布（快照）

基于索引 928 个仓库的统计：

| 分类 | 仓库数 | 分类 | 仓库数 |
| ---- | ------ | ---- | ------ |
| vector-databases | 56 | reasoning-models | 8 |
| agent-frameworks | 48 | code-llms | 8 |
| official-cookbooks | 44 | memory | 8 |
| rag-retrieval | 34 | safety-alignment | 8 |
| llm-serving | 34 | customer-support | 3 |
| applications | 34 | legal | 4 |
| prompt-libraries | 33 | code-assistants | 5 |
| evaluation | 30 | video-generation | 6 |
| terminal-cli | 29 | model-merging | 7 |
| data-pipelines | 26 | awesome-lists | 7 |

完整分布可通过以下命令生成：

```bash
python3 -c "
import re
from collections import Counter
from pathlib import Path
text = Path('external-index/skills.yaml').read_text()
cats = re.findall(r'^\s+category:\s*(\S+)', text, re.MULTILINE)
for cat, n in Counter(cats).most_common():
    print(f'{cat}: {n}')
"
```
