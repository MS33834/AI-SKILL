# 快速上手指南录制说明（T5）

本文件说明如何为 [`docs/quickstart.md`](quickstart.md) 生成真实的截图与 GIF 动图，以替换目前的 AI 生成示意图。

## 推荐工具

- **静态截图**：浏览器 DevTools 截图、Playwright、`scripts/capture-screenshots.py`
- **GIF / 视频**：Screen Studio、LICEcap、Kap、FFmpeg + browser automation
- **终端录屏**：asciinema（适合展示安装命令）

## 录制清单

| 编号 | 场景 | 建议时长 | 输出文件 |
| ---- | ---- | -------- | -------- |
| 1 | 首页滚动：Hero → Featured → 统计条 | 3-5 秒 | `docs/assets/quickstart/homepage.gif` |
| 2 | 外部索引搜索 `rag` 并切换 Category 视角 | 5-8 秒 | `docs/assets/quickstart/search-rag.gif` |
| 3 | 点开 `code-review` skill，滚动并点击复制 | 5-8 秒 | `docs/assets/quickstart/skill-detail.gif` |
| 4 | Bundle 页面勾选 3 个 skill 并下载 | 5-8 秒 | `docs/assets/quickstart/bundle-download.gif` |
| 5 | 安装命令终端演示 | 5-10 秒 | `docs/assets/quickstart/install-cli.cast` 或 `.gif` |

## 本地预览环境

录制前请确保本地构建产物是最新的：

```bash
cd frontend
npm run build
npm run preview -- --port 4173
```

然后打开 `http://localhost:4173/` 开始录制。

## 自动化截图脚本

项目提供 `scripts/capture-screenshots.py`，用于在 Playwright 可用时批量捕获关键页面截图：

```bash
# 安装依赖（首次）
pip install playwright
playwright install chromium

# 启动预览服务器后运行
python scripts/capture-screenshots.py
```

脚本会输出到 `docs/assets/quickstart/screenshots/`。若环境无法安装浏览器，脚本会打印手动录制步骤。

## GIF 压缩建议

- 分辨率：1280×720 或 1440×900
- 帧率：10-15 fps
- 色彩：256 色，单文件控制在 2 MB 以内
- 工具示例（FFmpeg）：

```bash
ffmpeg -i input.mov -vf "fps=10,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" output.gif
```

## 替换占位图

生成真实素材后，修改 [`docs/quickstart.md`](quickstart.md) 中的图片链接。当前已生成的素材：

| 场景 | 文件 |
| ---- | ---- |
| 首页 Hero / Featured / 统计条 | `docs/assets/quickstart/homepage.gif` |
| 外部索引搜索 `rag` | `docs/assets/quickstart/search-rag.gif` |
| `code-review` skill 详情 | `docs/assets/quickstart/skill-detail.gif` |
| Bundle 下载 | `docs/assets/quickstart/bundle-download.gif` |

```markdown
![homepage-hero](../assets/quickstart/homepage.gif)
```

## 无障碍与国际化

- 录制时保持界面语言为中文（`?lang=zh`）或英文，与 quickstart.md 当前语言一致。
- 避免展示真实 API key、token 或个人仓库信息。
- 鼠标移动保持匀速，关键点击处可稍作停顿。

## 验收标准

- [x] 至少 4 张 GIF 覆盖首页、搜索、skill 详情、Bundle 下载
- [x] 单张 GIF 不超过 2 MB
- [x] quickstart.md 中所有占位图已替换为真实素材
- [x] 在 GitHub / GitCode Release 中可同时使用这些素材作为 feature showcase
