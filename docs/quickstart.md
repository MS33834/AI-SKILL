# AI-SKILL 30 秒上手指南

> 目标：第一次访问的人能在 30 秒内知道 AI-SKILL 是什么、能找到什么、怎么带走。

---

## 1. 打开首页，看精选

访问 [AI-SKILL 首页](https://badhope.gitcode.host/AI-SKILL/)。

页面顶部是：

- **Hero**：总 skill 数、外部索引仓库数、一句话定位
- **Featured 精选**：4 个本地常用 skill + 10 个高影响力上游仓库
- **统计条**：本地 skill 数、分类数、索引仓库数、领域数

![homepage-hero](../assets/quickstart/homepage.gif)

---

## 2. 按能力找仓库（最常用）

点击 Hero 里的 **Index** 按钮，进入[技能仓库索引](https://badhope.gitcode.host/AI-SKILL/#/external)。

1. **输入关键词**：比如 `RAG`、`agent`、`fine-tuning`
2. **切换视角**：Domain / Vendor Type / Category / Stars
3. **卡片展开**：每张卡列出该仓库提供的具体技能，直接判断是不是你要的
4. **直达源头**：点卡片上的 "在 GitHub 上查看" 跳转上游仓库

![search-rag](../assets/quickstart/search-rag.gif)

小提示：如果输错词，页面会提示 **"你是不是想搜：xxx"**，点击即可自动纠正。

---

## 3. 看本地 skill 详情

回到首页，点任意一张 **本地技能卡片**（如 `code-review`）。

- 左侧/上方是 **SKILL.md** 完整内容
- 顶部有 **复制按钮**，可直接复制整份提示词
- 底部有 **输入输出 schema**，告诉你这个 skill 需要什么、返回什么

![skill-detail](../assets/quickstart/skill-detail.gif)

---

## 4. 带走 skill（三种方式）

### 方式 A：复制粘贴

在 skill 详情页点 **复制**，直接把 Markdown 粘贴进 Claude / Codex / Cursor / Continue 的 system prompt 或 skill 目录。

### 方式 B：安装到 agent 目录

```bash
# 安装到 Claude 默认 skill 目录
python scripts/install-skill.py code-review --target claude

# 安装到 Codex
python scripts/install-skill.py code-review --target codex

# 安装到自定义目录
python scripts/install-skill.py code-review --target /path/to/skills
```

### 方式 C：打包 ZIP（多选）

1. 点击顶部导航 **Bundle**
2. 勾选你需要的 skill
3. 点 **Download ZIP** 下载

![bundle-download](../assets/quickstart/bundle-download.gif)

---

## 5. 切换语言

页面右上角 **EN / 中** 按钮可切换中英文。语言偏好存在浏览器本地，刷新后保留。

URL 加 `?lang=zh` 也能强制切中文，方便分享。

---

## 下一步

- 想了解项目全貌，读 [`docs/getting-started.md`](./getting-started.md)
- 想贡献 skill，看 [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- 想给上游仓库作者认领自己的仓库，看 [`docs/upstream-claim.md`](./upstream-claim.md)

## 维护说明

本页 GIF 素材已替换为真实生成的 UI 示意动图（源文件见 [`docs/assets/quickstart/`](../assets/quickstart/)）。如需重新生成或录制真实浏览器操作，请参考 [`docs/quickstart-recording.md`](./quickstart-recording.md) 与 [`scripts/capture-screenshots.py`](../scripts/capture-screenshots.py)。
