# 贡献者 Onboarding 走通记录（O3）

> 本文件由内部团队 `core-content` 模拟一次完整贡献者 PR 流程后整理，用于证明 onboarding 流程可跑通，并作为后续真实贡献者的参考。

## 原则

- 社区贡献者可以参与，但项目**不依赖**外部贡献者完成里程碑。
- 内部核心团队会先按本流程自测一遍，确保每个环节文档正确、脚本可用、CI 可过。

## 模拟场景

本次模拟的贡献者改动：在 `README.md` 的「贡献」段落增加指向 `docs/core-team.md` 的链接，帮助新贡献者了解内部团队分工。

## 完整流程

### 1. Fork / 克隆仓库

```bash
git clone https://github.com/badhope/AI-SKILL.git
# 或 git clone https://gitcode.com/badhope/AI-SKILL.git
cd AI-SKILL
```

### 2. 创建功能分支

```bash
git checkout -b docs/add-core-team-link
```

### 3. 修改文件

编辑 `README.md`，在「贡献」段落加入：

```markdown
项目由内部核心团队主导，分工见 [`docs/core-team.md`](docs/core-team.md)。
```

### 4. 本地验证

```bash
# Python 环境
pip install ruamel.yaml requests

# 校验本地 skill（修改 docs 时也会触发，确保没破坏数据）
python scripts/validate-skill.py

# 安全扫描
python scripts/security-scan.py --fail-on-high

# 前端检查（若改动了 frontend）
cd frontend
npm install
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

### 5. 提交并推送

```bash
git add README.md
git commit -m "docs: link to core-team.md in contribution section"
git push origin docs/add-core-team-link
```

### 6. 开 PR

- 标题：`docs: link to core-team.md in contribution section`
- 描述：说明改动原因、验证结果。
- 指派人：`@badhope`（Project Lead）
- 标签：`docs`

### 7. CI 检查

PR 触发 `.github/workflows/ci.yml`，必须全部通过：

- `validate-skill.py`
- `security-scan.py --fail-on-high`
- 前端 format / typecheck / lint / test / build

### 8. Review & 合并

- `core-content` 自查文档正确性。
- `core-frontend` 确认无前端破坏（本例无前端改动）。
- `@badhope` 终审并 squash merge。

### 9. 同步双远程

合并后，立即推送 GitHub 与 GitCode：

```bash
git push github main
git push gitcode main
```

## 验收标准

- [x] 存在一份可复现的 onboarding 文档
- [x] 内部团队按该文档走完一次真实提交
- [x] 所有 CI 脚本在提交前本地通过
- [x] 合并后双远程保持一致

## 结论

贡献者 onboarding 流程已跑通，不依赖外部志愿者。真实外部贡献者可按本流程和 [`CONTRIBUTING.md`](../CONTRIBUTING.md) 提交 PR。
