**语言:** [English](README.md) | **简体中文** | [繁體中文](docs/zh-TW/README.md)

# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![Forks](https://img.shields.io/github/forks/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/network/members)
[![Contributors](https://img.shields.io/github/contributors/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/graphs/contributors)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> **50K+ stars** | **6K+ forks** | **30 contributors** | **6 种语言支持** | **Anthropic 黑客松获胜者**

---

<div align="center">

**🌐 Language / 语言 / 語言**

[**English**](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](docs/zh-TW/README.md) | [日本語](docs/ja-JP/README.md)

</div>

---

**为 AI 智能体（Agent）框架打造的性能优化系统。源自 Anthropic 黑客松获胜作品。**

这不仅仅是配置文件。它是一个完整的系统：包含技能（Skills）、本能（Instincts）、内存优化、持续学习、安全扫描以及研究优先的开发模式。这些生产级的智能体（Agents）、钩子（Hooks）、命令（Commands）、规则（Rules）以及 MCP 配置，是在构建真实产品的 10 个多月高强度日常使用中演化而来的。

适用于 **Claude Code**, **Codex**, **Cowork** 以及其他 AI 智能体框架。

---

## 指南 (The Guides)

本仓库仅包含原始代码。指南部分解释了所有细节。

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="Everything Claude Code 简明指南" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="Everything Claude Code 详细指南" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>简明指南 (Shorthand Guide)</b><br/>设置、基础知识、哲学。<b>请先阅读此篇。</b></td>
<td align="center"><b>详细指南 (Longform Guide)</b><br/>令牌（Token）优化、内存持久化、评测（Evals）、并行化。</td>
</tr>
</table>

| 主题 | 你将学到什么 |
|-------|-------------------|
| 令牌（Token）优化 | 模型选择、系统提示词瘦身、后台进程 |
| 内存持久化 | 跨会话自动保存/加载上下文的钩子 (Hooks) |
| 持续学习 | 自动将会话模式提取为可重用的技能 (Skills) |
| 验证循环 | 检查点 vs 持续评测、评分器类型、pass@k 指标 |
| 并行化 | Git worktrees、级联方法、何时扩展实例 |
| 子智能体编排 | 上下文问题、迭代检索模式 |

---

## 更新内容 (What's New)

### v1.7.0 — 跨平台扩展与演示文稿生成器 (2026年2月)

- **Codex 应用 + CLI 支持** — 直接支持基于 `AGENTS.md` 的 Codex，安装器目标定位及 Codex 文档
- **`frontend-slides` 技能 (Skill)** — 无依赖的 HTML 演示文稿生成器，包含 PPTX 转换指南和严格的视口自适应规则
- **5 个新型通用业务/内容技能** — `article-writing`（文章写作）、`content-engine`（内容引擎）、`market-research`（市场研究）、`investor-materials`（融资材料）、`investor-outreach`（投资者对接）
- **更广的工具覆盖** — 强化了 Cursor、Codex 和 OpenCode 的支持，使同一仓库能在所有主流框架中无缝运行
- **992 项内部测试** — 扩展了插件、钩子 (Hooks)、技能 (Skills) 及打包的验证与回归覆盖率

### v1.6.0 — Codex CLI, AgentShield & 市场 (2026年2月)

- **Codex CLI 支持** — 新增 `/codex-setup` 命令，生成用于 OpenAI Codex CLI 兼容的 `codex.md`
- **7 个新技能** — `search-first`、`swift-actor-persistence`、`swift-protocol-di-testing`、`regex-vs-llm-structured-text`、`content-hash-cache-pattern`、`cost-aware-llm-pipeline`、`skill-stocktake`
- **AgentShield 集成** — `/security-scan` 技能可直接从 Claude Code 运行 AgentShield；包含 1282 项测试，102 条规则
- **GitHub 市场 (Marketplace)** — ECC Tools GitHub 应用已在 [github.com/marketplace/ecc-tools](https://github.com/marketplace/ecc-tools) 上线，提供免费/专业/企业版
- **合并 30+ 社区 PR** — 来自 6 种语言的 30 位贡献者的贡献
- **978 项内部测试** — 扩展了涵盖智能体、技能、命令、钩子和规则的验证套件

### v1.4.1 — Bug 修复 (2026年2月)

- **修复本能 (Instinct) 导入内容丢失问题** — `parse_instinct_file()` 在执行 `/instinct-import` 时会静默丢弃 Frontmatter 之后的所有内容（Action、Evidence、Examples 部分）。由社区贡献者 @ericcai0814 修复 ([#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161))

### v1.4.0 — 多语言规则、安装向导与 PM2 (2026年2月)

- **交互式安装向导** — 新增 `configure-ecc` 技能，提供带合并/覆盖检测的引导式设置
- **PM2 与多智能体编排** — 6 个新命令（`/pm2`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, `/multi-workflow`）用于管理复杂的多服务工作流
- **多语言规则架构** — 规则从扁平文件重构为 `common/` + `typescript/` + `python/` + `golang/` 目录。仅安装你需要的语言
- **中文 (zh-CN) 翻译** — 完成了所有智能体、命令、技能和规则（80+ 文件）的完整翻译
- **GitHub Sponsors 支持** — 可以通过 GitHub Sponsors 资助本项目
- **增强的 CONTRIBUTING.md** — 为每种贡献类型提供了详细的 PR 模板

### v1.3.0 — OpenCode 插件支持 (2026年2月)

- **全面集成 OpenCode** — 12 个智能体、24 个命令、16 个技能，通过 OpenCode 的插件系统（20+ 事件类型）支持钩子
- **3 个原生自定义工具** — run-tests（运行测试）、check-coverage（检查覆盖率）、security-audit（安全审计）
- **LLM 文档** — 提供 `llms.txt` 以获取全面的 OpenCode 文档

### v1.2.0 — 统一命令与技能 (2026年2月)

- **Python/Django 支持** — Django 模式、安全、TDD 和验证技能
- **Java Spring Boot 技能** — Spring Boot 的模式、安全、TDD 和验证
- **会话管理** — `/sessions` 命令用于查看会话历史
- **持续学习 v2** — 基于本能的带置信评分、导入/导出、进化的学习系统

在 [Releases](https://github.com/affaan-m/everything-claude-code/releases) 中查看完整变更日志。

---

## 🚀 快速开始 (Quick Start)

在 2 分钟内启动并运行：

### 步骤 1：安装插件 (Plugin)

```bash
# 添加市场
/plugin marketplace add affaan-m/everything-claude-code

# 安装插件
/plugin install everything-claude-code@everything-claude-code
```

### 步骤 2：安装规则 (Rules)（必选）

> ⚠️ **重要提示：** Claude Code 插件无法自动分发 `rules`（规则）。请手动安装：

```bash
# 首先克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code

# 推荐：使用安装脚本（安全处理通用规则和语言规则）
./install.sh typescript    # 或 python 或 golang
# 你可以传递多种语言：
# ./install.sh typescript python golang
# 或者针对 cursor 安装：
# ./install.sh --target cursor typescript
```

有关手动安装的说明，请参阅 `rules/` 文件夹中的 README。

### 步骤 3：开始使用

```bash
# 尝试一个命令（插件安装使用命名空间形式）
/everything-claude-code:plan "添加用户身份验证"

# 手动安装（选项 2）使用简短形式：
# /plan "添加用户身份验证"

# 查看可用命令
/plugin list everything-claude-code@everything-claude-code
```

✨ **完成！** 你现在可以访问 13 个智能体（Agents）、56 个技能（Skills）和 32 个命令（Commands）。

---

## 🌐 跨平台支持 (Cross-Platform Support)

该插件现已全面支持 **Windows, macOS 和 Linux**。所有钩子和脚本已使用 Node.js 重写，以实现最大兼容性。

### 包管理器检测 (Package Manager Detection)

插件会自动检测你首选的包管理器（npm, pnpm, yarn 或 bun），优先级如下：

1. **环境变量**: `CLAUDE_PACKAGE_MANAGER`
2. **项目配置**: `.claude/package-manager.json`
3. **package.json**: `packageManager` 字段
4. **锁文件**: 从 package-lock.json, yarn.lock, pnpm-lock.yaml 或 bun.lockb 检测
5. **全局配置**: `~/.claude/package-manager.json`
6. **备选方案**: 首个可用的包管理器

设置你首选的包管理器：

```bash
# 通过环境变量
export CLAUDE_PACKAGE_MANAGER=pnpm

# 通过全局配置
node scripts/setup-package-manager.js --global pnpm

# 通过项目配置
node scripts/setup-package-manager.js --project bun

# 检测当前设置
node scripts/setup-package-manager.js --detect
```

或者在 Claude Code 中使用 `/setup-pm` 命令。

---

## 📦 包含内容 (What's Inside)

本仓库是一个 **Claude Code 插件** —— 你可以直接安装，也可以手动复制组件。

```
everything-claude-code/
|-- .claude-plugin/   # 插件与市场清单文件
|   |-- plugin.json         # 插件元数据与组件路径
|   |-- marketplace.json    # 用于 /plugin marketplace add 的市场目录
|
|-- agents/           # 专门用于任务委派的子智能体 (Subagents)
|   |-- planner.md           # 功能实现规划
|   |-- architect.md         # 系统设计决策
|   |-- tdd-guide.md         # 测试驱动开发 (TDD)
|   |-- code-reviewer.md     # 质量与安全审查
|   |-- security-reviewer.md # 漏洞分析
|   |-- build-error-resolver.md # 构建错误修复
|   |-- e2e-runner.md        # Playwright E2E 测试
|   |-- refactor-cleaner.md  # 废弃代码清理
|   |-- doc-updater.md       # 文档同步更新
|   |-- go-reviewer.md       # Go 代码审查
|   |-- go-build-resolver.md # Go 构建错误修复
|   |-- python-reviewer.md   # Python 代码审查 (新增)
|   |-- database-reviewer.md # 数据库/Supabase 审查 (新增)
|
|-- skills/           # 工作流定义与领域知识
|   |-- coding-standards/           # 语言最佳实践
|   |-- clickhouse-io/              # ClickHouse 分析、查询、数据工程
|   |-- backend-patterns/           # API、数据库、缓存模式
|   |-- frontend-patterns/          # React, Next.js 模式
|   |-- frontend-slides/            # HTML 幻灯片与 PPTX 转网页演示工作流 (新增)
|   |-- article-writing/            # 使用指定语气进行长文写作，无 AI 腔 (新增)
|   |-- content-engine/             # 多平台社交内容与重用工作流 (新增)
|   |-- market-research/            # 带源码引用的市场、竞对和投资者研究 (新增)
|   |-- investor-materials/         # 商业计划书、一页纸介绍、备忘录和财务模型 (新增)
|   |-- investor-outreach/          # 个性化融资对接与后续跟进 (新增)
|   |-- continuous-learning/        # 从会话中自动提取模式 (详细指南)
|   |-- continuous-learning-v2/     # 基于本能的带置信评分的学习系统
|   |-- iterative-retrieval/        # 为子智能体提供的渐进式上下文精炼
|   |-- strategic-compact/          # 手动压缩建议 (详细指南)
|   |-- tdd-workflow/               # TDD 方法论
|   |-- security-review/            # 安全自查表
|   |-- eval-harness/               # 验证循环评测 (详细指南)
|   |-- verification-loop/          # 持续验证 (详细指南)
|   |-- golang-patterns/            # Go 惯用法与最佳实践
|   |-- golang-testing/             # Go 测试模式、TDD、基准测试
|   |-- cpp-coding-standards/         # 源自 C++ Core Guidelines 的 C++ 编码标准 (新增)
|   |-- cpp-testing/                # 使用 GoogleTest, CMake/CTest 的 C++ 测试 (新增)
|   |-- django-patterns/            # Django 模式、模型、视图 (新增)
|   |-- django-security/            # Django 安全最佳实践 (新增)
|   |-- django-tdd/                 # Django TDD 工作流 (新增)
|   |-- django-verification/        # Django 验证循环 (新增)
|   |-- python-patterns/            # Python 惯用法与最佳实践 (新增)
|   |-- python-testing/             # 使用 pytest 的 Python 测试 (新增)
|   |-- springboot-patterns/        # Java Spring Boot 模式 (新增)
|   |-- springboot-security/        # Spring Boot 安全 (新增)
|   |-- springboot-tdd/             # Spring Boot TDD (新增)
|   |-- springboot-verification/    # Spring Boot 验证 (新增)
|   |-- configure-ecc/              # 交互式安装向导 (新增)
|   |-- security-scan/              # AgentShield 安全审计集成 (新增)
|   |-- java-coding-standards/     # Java 编码标准 (新增)
|   |-- jpa-patterns/              # JPA/Hibernate 模式 (新增)
|   |-- postgres-patterns/         # PostgreSQL 优化模式 (新增)
|   |-- nutrient-document-processing/ # 使用 Nutrient API 处理文档 (新增)
|   |-- project-guidelines-example/   # 项目特定技能模板
|   |-- database-migrations/         # 迁移模式 (Prisma, Drizzle, Django, Go) (新增)
|   |-- api-design/                  # REST API 设计、分页、错误响应 (新增)
|   |-- deployment-patterns/         # CI/CD, Docker, 健康检查, 回滚 (新增)
|   |-- docker-patterns/            # Docker Compose, 网络, 卷, 容器安全 (新增)
|   |-- e2e-testing/                 # Playwright E2E 模式与页面对象模型 (POM) (新增)
|   |-- content-hash-cache-pattern/  # 用于文件处理的 SHA-256 内容哈希缓存 (新增)
|   |-- cost-aware-llm-pipeline/     # LLM 成本优化、模型路由、预算追踪 (新增)
|   |-- regex-vs-llm-structured-text/ # 决策框架：正则 vs LLM 解析文本 (新增)
|   |-- swift-actor-persistence/     # 使用 Actor 的线程安全 Swift 数据持久化 (新增)
|   |-- swift-protocol-di-testing/   # 基于协议的 DI 用于可测试的 Swift 代码 (新增)
|   |-- search-first/               # 编码前研究工作流 (新增)
|   |-- skill-stocktake/            # 审核技能与命令的质量 (新增)
|   |-- liquid-glass-design/         # iOS 26 Liquid Glass 设计系统 (新增)
|   |-- foundation-models-on-device/ # 使用 FoundationModels 的 Apple 端侧 LLM (新增)
|   |-- swift-concurrency-6-2/       # Swift 6.2 易用并发 (新增)
|   |-- autonomous-loops/           # 自主循环模式：顺序流水线、PR 循环、DAG 编排 (新增)
|   |-- plankton-code-quality/      # 使用 Plankton 钩子在编写时强制执行代码质量 (新增)
|
|-- commands/         # 用于快速执行的斜杠命令 (Slash commands)
|   |-- tdd.md              # /tdd - 测试驱动开发
|   |-- plan.md             # /plan - 实现规划
|   |-- e2e.md              # /e2e - E2E 测试生成
|   |-- code-review.md      # /code-review - 质量审查
|   |-- build-fix.md        # /build-fix - 修复构建错误
|   |-- refactor-clean.md   # /refactor-clean - 废弃代码移除
|   |-- learn.md            # /learn - 会话中提取模式 (详细指南)
|   |-- learn-eval.md       # /learn-eval - 提取、评测并保存模式 (新增)
|   |-- checkpoint.md       # /checkpoint - 保存验证状态 (详细指南)
|   |-- verify.md           # /verify - 运行验证循环 (详细指南)
|   |-- setup-pm.md         # /setup-pm - 配置包管理器
|   |-- go-review.md        # /go-review - Go 代码审查 (新增)
|   |-- go-test.md          # /go-test - Go TDD 工作流 (新增)
|   |-- go-build.md         # /go-build - 修复 Go 构建错误 (新增)
|   |-- skill-create.md     # /skill-create - 从 git 历史生成技能 (新增)
|   |-- instinct-status.md  # /instinct-status - 查看已学本能 (新增)
|   |-- instinct-import.md  # /instinct-import - 导入本能 (新增)
|   |-- instinct-export.md  # /instinct-export - 导出本能 (新增)
|   |-- evolve.md           # /evolve - 将相关本能聚类为技能
|   |-- pm2.md              # /pm2 - PM2 服务生命周期管理 (新增)
|   |-- multi-plan.md       # /multi-plan - 多智能体任务分解 (新增)
|   |-- multi-execute.md    # /multi-execute - 编排的多智能体工作流 (新增)
|   |-- multi-backend.md    # /multi-backend - 后端多服务编排 (新增)
|   |-- multi-frontend.md   # /multi-frontend - 前端多服务编排 (新增)
|   |-- multi-workflow.md   # /multi-workflow - 通用多服务工作流 (新增)
|   |-- orchestrate.md      # /orchestrate - 多智能体协调
|   |-- sessions.md         # /sessions - 会话历史管理
|   |-- eval.md             # /eval - 根据准则评测
|   |-- test-coverage.md    # /test-coverage - 测试覆盖率分析
|   |-- update-docs.md      # /update-docs - 更新文档
|   |-- update-codemaps.md  # /update-codemaps - 更新代码映射 (codemaps)
|   |-- python-review.md    # /python-review - Python 代码审查 (新增)
|
|-- rules/            # 必须遵守的准则 (复制到 ~/.claude/rules/)
|   |-- README.md            # 结构概览与安装指南
|   |-- common/              # 语言无关原则
|   |   |-- coding-style.md    # 不变性、文件组织
|   |   |-- git-workflow.md    # 提交格式、PR 流程
|   |   |-- testing.md         # TDD, 80% 覆盖率要求
|   |   |-- performance.md     # 模型选择、上下文管理
|   |   |-- patterns.md        # 设计模式、骨架项目
|   |   |-- hooks.md           # 钩子架构、TodoWrite
|   |   |-- agents.md          # 何时委派给子智能体
|   |   |-- security.md        # 强制性安全检查
|   |-- typescript/          # TypeScript/JavaScript 特定
|   |-- python/              # Python 特定
|   |-- golang/              # Go 特定
|
|-- hooks/            # 基于触发器的自动化
|   |-- README.md                 # 钩子文档、配方与自定义指南
|   |-- hooks.json                # 所有钩子配置 (PreToolUse, PostToolUse, Stop 等)
|   |-- memory-persistence/       # 会话生命周期钩子 (详细指南)
|   |-- strategic-compact/        # 压缩建议 (详细指南)
|
|-- scripts/          # 跨平台 Node.js 脚本 (新增)
|   |-- lib/                     # 共享实用工具
|   |   |-- utils.js             # 跨平台文件/路径/系统实用程序
|   |   |-- package-manager.js   # 包管理器检测与选择
|   |-- hooks/                   # 钩子实现
|   |   |-- session-start.js     # 会话开始时加载上下文
|   |   |-- session-end.js       # 会话结束时保存状态
|   |   |-- pre-compact.js       # 压缩前状态保存
|   |   |-- suggest-compact.js   # 策略性压缩建议
|   |   |-- evaluate-session.js  # 从会话中提取模式
|   |-- setup-package-manager.js # 交互式 PM 设置
|
|-- tests/            # 测试套件 (新增)
|   |-- lib/                     # 库测试
|   |-- hooks/                   # 钩子测试
|   |-- run-all.js               # 运行所有测试
|
|-- contexts/         # 动态系统提示词注入上下文 (详细指南)
|   |-- dev.md              # 开发模式上下文
|   |-- review.md           # 代码审查模式上下文
|   |-- research.md         # 研究/探索模式上下文
|
|-- examples/         # 示例配置与会话
|   |-- CLAUDE.md             # 示例项目级配置
|   |-- user-CLAUDE.md        # 示例用户级配置
|   |-- saas-nextjs-CLAUDE.md   # 真实 SaaS (Next.js + Supabase + Stripe)
|   |-- go-microservice-CLAUDE.md # 真实 Go 微服务 (gRPC + PostgreSQL)
|   |-- django-api-CLAUDE.md      # 真实 Django REST API (DRF + Celery)
|   |-- rust-api-CLAUDE.md        # 真实 Rust API (Axum + SQLx + PostgreSQL) (新增)
|
|-- mcp-configs/      # MCP 服务器配置
|   |-- mcp-servers.json    # GitHub, Supabase, Vercel, Railway 等
|
|-- marketplace.json  # 自托管市场配置 (用于 /plugin marketplace add)
```

---

## 🛠️ 生态工具 (Ecosystem Tools)

### 技能生成器 (Skill Creator)

有两种方法可以从你的仓库生成 Claude Code 技能 (Skills)：

#### 选项 A：本地分析（内置）

使用 `/skill-create` 命令进行本地分析，无需外部服务：

```bash
/skill-create                    # 分析当前仓库
/skill-create --instincts        # 同时生成用于持续学习的本能 (instincts)
```

这将本地分析你的 git 历史并生成 SKILL.md 文件。

#### 选项 B：GitHub 应用（高级）

适用于高级功能（10k+ 提交、自动 PR、团队共享）：

[安装 GitHub App](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# 在任何 issue 下留言：
/skill-creator analyze

# 或者在推送到默认分支时自动触发
```

两个选项都会创建：
- **SKILL.md 文件** - 可供 Claude Code 直接使用的技能
- **本能集合 (Instinct collections)** - 适用于 continuous-learning-v2
- **模式提取 (Pattern extraction)** - 从你的提交历史中学习

### AgentShield — 安全审计器 (Security Auditor)

> 在 Claude Code 黑客松（Cerebral Valley x Anthropic, 2026年2月）中构建。包含 1282 项测试，98% 覆盖率，102 条静态分析规则。

扫描你的 Claude Code 配置是否存在漏洞、错误配置和注入风险。

```bash
# 快速扫描（无需安装）
npx ecc-agentshield scan

# 自动修复安全问题
npx ecc-agentshield scan --fix

# 使用三个 Opus 4.6 智能体进行深度分析
npx ecc-agentshield scan --opus --stream

# 从头开始生成安全配置
npx ecc-agentshield init
```

**扫描范围：** CLAUDE.md, settings.json, MCP 配置, 钩子 (Hooks), 智能体定义以及 5 个类别的技能 —— 密钥检测（14 种模式）、权限审计、钩子注入分析、MCP 服务器风险分析以及智能体配置审查。

**`--opus` 标志** 在红队/蓝队/审计员流水线中运行三个 Claude Opus 4.6 智能体。攻击者寻找攻击链，防御者评估防护措施，审计员将两者整合为优先排序的风险评估。这是对抗性推理，而非简单的模式匹配。

**输出格式：** 终端（彩色分级 A-F）、JSON（CI 流水线）、Markdown、HTML。发现严重问题时退出代码为 2，用于构建门禁。

在 Claude Code 中使用 `/security-scan` 运行，或通过 [GitHub Action](https://github.com/affaan-m/agentshield) 添加到 CI。

[GitHub](https://github.com/affaan-m/agentshield) | [npm](https://www.npmjs.com/package/ecc-agentshield)

### 🔬 Plankton — 编写时代码质量强制执行

Plankton（鸣谢：@alxfazio）是推荐的代码编写时质量强制执行伙伴。它通过 PostToolUse 钩子在每次文件编辑时运行格式化程序和 20+ 个 linter，然后产生 Claude 子进程（根据违规复杂程度路由至 Haiku/Sonnet/Opus）来修复主智能体遗漏的问题。三阶段架构：静默自动格式化（解决 40-50% 的问题）、收集剩余违规为结构化 JSON、将修复委派给子进程。包含配置保护钩子，防止智能体为了通过检查而修改 linter 配置。支持 Python, TypeScript, Shell, YAML, JSON, TOML, Markdown 和 Dockerfile。配合 AgentShield 使用，可实现安全 + 质量覆盖。完整集成指南请见 `skills/plankton-code-quality/`。

### 🧠 持续学习 v2 (Continuous Learning v2)

基于本能的学习系统会自动学习你的模式：

```bash
/instinct-status        # 显示已学习的本能及其置信度
/instinct-import <file> # 导入他人的本能
/instinct-export        # 导出你的本能进行分享
/evolve                 # 将相关本能聚类为技能 (Skills)
```

完整文档请见 `skills/continuous-learning-v2/`。

---

## 📋 要求 (Requirements)

### Claude Code CLI 版本

**最低版本：v2.1.0 或更高**

由于插件系统处理钩子 (Hooks) 方式的变更，该插件需要 Claude Code CLI v2.1.0+。

检查你的版本：
```bash
claude --version
```

### 重要提示：钩子自动加载行为

> ⚠️ **致贡献者：** 请勿在 `.claude-plugin/plugin.json` 中添加 `"hooks"` 字段。这已通过回归测试强制执行。

Claude Code v2.1+ 会按约定从任何已安装的插件中**自动加载** `hooks/hooks.json`。在 `plugin.json` 中显式声明会导致重复检测错误：

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**历史背景：** 这在该仓库中曾导致反复的修复/回滚循环（[#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103)）。由于 Claude Code 版本间的行为变更导致了混淆。我们现在已加入回归测试以防此类问题再次出现。

---

## 📥 安装 (Installation)

### 选项 1：作为插件安装（推荐）

使用本仓库最简单的方法 —— 作为 Claude Code 插件安装：

```bash
# 将本仓库添加为市场
/plugin marketplace add affaan-m/everything-claude-code

# 安装插件
/plugin install everything-claude-code@everything-claude-code
```

或者直接添加到你的 `~/.claude/settings.json`：

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": {
        "source": "github",
        "repo": "affaan-m/everything-claude-code"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

这将使你立即获得对所有命令、智能体、技能和钩子的访问权限。

> **注意：** Claude Code 插件系统目前不支持通过插件分发 `rules`（规则）（[上游限制](https://code.claude.com/docs/en/plugins-reference)）。你需要手动安装规则：
>
> ```bash
> # 首先克隆仓库
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # 选项 A：用户级规则（适用于所有项目）
> mkdir -p ~/.claude/rules
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # 选择你的技术栈
> cp -r everything-claude-code/rules/python/* ~/.claude/rules/
> cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
>
> # 选项 B：项目级规则（仅适用于当前项目）
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common/* .claude/rules/
> cp -r everything-claude-code/rules/typescript/* .claude/rules/     # 选择你的技术栈
> ```

---

### 🔧 选项 2：手动安装

如果你更喜欢手动控制安装内容：

```bash
# 克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git

# 将智能体复制到你的 Claude 配置目录
cp everything-claude-code/agents/*.md ~/.claude/agents/

# 复制规则（通用规则 + 特定语言规则）
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # 选择你的技术栈
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/

# 复制命令
cp everything-claude-code/commands/*.md ~/.claude/commands/

# 复制技能（核心 vs 细分领域）
# 推荐（新用户）：仅安装核心/通用技能
cp -r everything-claude-code/.agents/skills/* ~/.claude/skills/
cp -r everything-claude-code/skills/search-first ~/.claude/skills/

# 可选：仅在需要时添加细分/框架特定技能
# for s in django-patterns django-tdd springboot-patterns; do
#   cp -r everything-claude-code/skills/$s ~/.claude/skills/
# done
```

#### 将钩子添加到 settings.json

将 `hooks/hooks.json` 中的钩子复制到你的 `~/.claude/settings.json` 中。

#### 配置 MCPs

将 `mcp-configs/mcp-servers.json` 中所需的 MCP 服务器复制到你的 `~/.claude.json` 中。

**重要提示：** 请将 `YOUR_*_HERE` 占位符替换为你真实的 API 密钥。

---

## 🎯 核心概念 (Key Concepts)

### 智能体 (Agents)

子智能体 (Subagents) 处理范围内受限的委派任务。示例：

```markdown
---
name: code-reviewer
description: 审查代码的质量、安全性和可维护性
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

你是一名资深代码审查员...
```

### 技能 (Skills)

技能是由命令或智能体调用的工作流定义：

```markdown
# TDD 工作流

1. 先定义接口
2. 编写失败的测试 (RED)
3. 实现最简代码 (GREEN)
4. 重构 (IMPROVE)
5. 验证 80%+ 的覆盖率
```

### 钩子 (Hooks)

钩子在工具事件上触发。示例 —— 警告 console.log：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### 规则 (Rules)

规则是必须遵守的准则，组织在 `common/`（语言无关）+ 特定语言目录中：

```
rules/
  common/          # 通用原则（始终安装）
  typescript/      # TS/JS 特定模式与工具
  python/          # Python 特定模式与工具
  golang/          # Go 特定模式与工具
```

安装和结构细节请参见 [`rules/README.md`](rules/README.md)。

---

## 🗺️ 我该使用哪个智能体 (Agent)？

不确定从哪里开始？请参考此快速指南：

| 我想... | 使用此命令 | 使用的智能体 (Agent) |
|--------------|-----------------|------------|
| 规划新功能 | `/everything-claude-code:plan "添加认证"` | planner |
| 设计系统架构 | `/everything-claude-code:plan` + architect 智能体 | architect |
| 先写测试再写代码 | `/tdd` | tdd-guide |
| 审查我刚写的代码 | `/code-review` | code-reviewer |
| 修复构建失败 | `/build-fix` | build-error-resolver |
| 运行端到端 (E2E) 测试 | `/e2e` | e2e-runner |
| 查找安全漏洞 | `/security-scan` | security-reviewer |
| 移除废弃代码 | `/refactor-clean` | refactor-cleaner |
| 更新文档 | `/update-docs` | doc-updater |
| 审查 Go 代码 | `/go-review` | go-reviewer |
| 审查 Python 代码 | `/python-review` | python-reviewer |
| 审计数据库查询 | *(自动委派)* | database-reviewer |

### 常见工作流 (Common Workflows)

**开始新功能：**
```
/everything-claude-code:plan "使用 OAuth 添加用户身份验证"
                                              → planner 创建实现蓝图
/tdd                                          → tdd-guide 强制执行先写测试
/code-review                                  → code-reviewer 检查你的工作
```

**修复 Bug：**
```
/tdd                                          → tdd-guide: 编写一个复现问题的失败测试
                                              → 实现修复，验证测试通过
/code-review                                  → code-reviewer: 捕捉回归问题
```

**准备生产发布：**
```
/security-scan                                → security-reviewer: OWASP Top 10 审计
/e2e                                          → e2e-runner: 关键用户流程测试
/test-coverage                                → 验证 80%+ 覆盖率
```

---

## ❓ 常见问题 (FAQ)

<details>
<summary><b>如何检查安装了哪些智能体/命令？</b></summary>

```bash
/plugin list everything-claude-code@everything-claude-code
```

这将显示插件中所有可用的智能体、命令和技能。
</details>

<details>
<summary><b>我的钩子 (Hooks) 没生效 / 我看到了 "Duplicate hooks file" 错误</b></summary>

这是最常见的问题。**请勿在 `.claude-plugin/plugin.json` 中添加 `"hooks"` 字段。** Claude Code v2.1+ 会自动从已安装的插件中加载 `hooks/hooks.json`。显式声明会导致重复检测错误。参见 [#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103)。
</details>

<details>
<summary><b>我的上下文窗口正在缩小 / Claude 耗尽了上下文</b></summary>

过多的 MCP 服务器会消耗你的上下文。每个 MCP 工具描述都会从你 200k 的窗口中消耗令牌，可能会将其减少到 ~70k。

**解决方法：** 按项目禁用不使用的 MCP：
```json
// 在项目的 .claude/settings.json 中
{
  "disabledMcpServers": ["supabase", "railway", "vercel"]
}
```

保持启用少于 10 个 MCP，且活动工具少于 80 个。
</details>

<details>
<summary><b>我能只使用部分组件吗（例如只用智能体）？</b></summary>

可以。使用选项 2（手动安装）并仅复制你需要的部分：

```bash
# 仅智能体
cp everything-claude-code/agents/*.md ~/.claude/agents/

# 仅规则
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
```

每个组件都是完全独立的。
</details>

<details>
<summary><b>这是否适用于 Cursor / OpenCode / Codex？</b></summary>

是的。ECC 是跨平台的：
- **Cursor**: 预翻译的配置位于 `.cursor/`。参见 [Cursor IDE 支持](#cursor-ide-支持)。
- **OpenCode**: 完整的插件支持位于 `.opencode/`。参见 [OpenCode 支持](#-opencode-支持)。
- **Codex**: 具有适配器偏移保护和 SessionStart 降级的一流支持。参见 PR [#257](https://github.com/affaan-m/everything-claude-code/pull/257)。
- **Claude Code**: 原生支持 —— 这是主要目标。
</details>

<details>
<summary><b>如何贡献新的技能或智能体？</b></summary>

参见 [CONTRIBUTING.md](CONTRIBUTING.md)。简短版本：
1. Fork 本仓库
2. 在 `skills/your-skill-name/SKILL.md`（带 YAML Frontmatter）中创建你的技能
3. 或在 `agents/your-agent.md` 中创建智能体
4. 提交 PR，并清晰描述其功能及使用场景
</details>

---

## 🧪 运行测试 (Running Tests)

插件包含一个全面的测试套件：

```bash
# 运行所有测试
node tests/run-all.js

# 运行单个测试文件
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## 🤝 贡献 (Contributing)

**欢迎并鼓励各类贡献。**

本仓库旨在成为社区资源。如果你有：
- 有用的智能体 (Agents) 或技能 (Skills)
- 巧妙的钩子 (Hooks)
- 更好的 MCP 配置
- 改进的规则 (Rules)

请贡献出来！准则请参见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 贡献想法

- 特定语言技能（Rust, C#, Swift, Kotlin）—— 已包含 Go, Python, Java
- 特定框架配置（Rails, Laravel, FastAPI, NestJS）—— 已包含 Django, Spring Boot
- DevOps 智能体（Kubernetes, Terraform, AWS, Docker）
- 测试策略（不同框架、视觉回归）
- 特定领域知识（机器学习、数据工程、移动端）

---

## Cursor IDE 支持 (Cursor IDE Support)

ECC 提供了**完整的 Cursor IDE 支持**，包含适配 Cursor 原生格式的钩子、规则、智能体、技能、命令和 MCP 配置。

### 快速开始 (Cursor)

```bash
# 为你的语言安装
./install.sh --target cursor typescript
./install.sh --target cursor python golang swift
```

### 包含内容

| 组件 | 数量 | 详情 |
|-----------|-------|---------|
| 钩子事件 | 15 | sessionStart, beforeShellExecution, afterFileEdit, beforeMCPExecution, beforeSubmitPrompt, 以及另外 10 个 |
| 钩子脚本 | 16 | 极简 Node.js 脚本，通过共享适配器委派给 `scripts/hooks/` |
| 规则 (Rules) | 29 | 9 条通用规则 (alwaysApply) + 20 条语言特定规则 (TypeScript, Python, Go, Swift) |
| 智能体 (Agents) | 共享 | 通过根目录的 AGENTS.md（被 Cursor 原生读取） |
| 技能 (Skills) | 共享 + 打包 | 通过根目录的 AGENTS.md 以及 `.cursor/skills/` 中翻译的补充内容 |
| 命令 (Commands) | 共享 | 如果安装，位于 `.cursor/commands/` |
| MCP 配置 | 共享 | 如果安装，位于 `.cursor/mcp.json` |

### 钩子架构（DRY 适配器模式）

Cursor 拥有的**钩子事件比 Claude Code 更多**（20 个 vs 8 个）。`.cursor/hooks/adapter.js` 模块将 Cursor 的 stdin JSON 转换为 Claude Code 的格式，从而允许重用现有的 `scripts/hooks/*.js` 而无需重复。

```
Cursor stdin JSON → adapter.js → 转换 → scripts/hooks/*.js
                                         (与 Claude Code 共享)
```

关键钩子：
- **beforeShellExecution** —— 阻止 tmux 之外的开发服务器运行 (exit 2)，审查 git push
- **afterFileEdit** —— 自动格式化 + TypeScript 检查 + console.log 警告
- **beforeSubmitPrompt** —— 在提示词中检测密钥（sk-, ghp_, AKIA 等模式）
- **beforeTabFileRead** —— 阻止 Tab 读取 .env, .key, .pem 文件 (exit 2)
- **beforeMCPExecution / afterMCPExecution** —— MCP 审计日志记录

### 规则格式 (Rules Format)

Cursor 规则使用带有 `description`, `globs` 和 `alwaysApply` 的 YAML Frontmatter：

```yaml
---
description: "扩展通用规则的 TypeScript 编码风格"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: false
---
```

---

## Codex CLI 支持 (Codex CLI Support)

ECC 提供了**一流的 Codex CLI 支持**，包含参考配置、Codex 特定的 AGENTS.md 补充以及 16 个移植的技能。

### 快速开始 (Codex)

```bash
# 将参考配置复制到你的用户目录
cp .codex/config.toml ~/.codex/config.toml

# 在仓库中运行 Codex —— 将自动检测 AGENTS.md
codex
```

### 包含内容

| 组件 | 数量 | 详情 |
|-----------|-------|---------|
| 配置 | 1 | `.codex/config.toml` —— 模型、权限、MCP 服务器、持久化指令 |
| AGENTS.md | 2 | 根目录（通用）+ `.codex/AGENTS.md`（Codex 特定补充） |
| 技能 (Skills) | 16 | `.agents/skills/` —— 每个技能包含 SKILL.md + agents/openai.yaml |
| MCP 服务器 | 4 | GitHub, Context7, Memory, Sequential Thinking (基于命令) |
| 配置文件 (Profiles) | 2 | `strict`（只读沙箱）和 `yolo`（全自动确认） |

### 技能 (Skills)

`.agents/skills/` 下的技能会被 Codex 自动加载：

| 技能 | 描述 |
|-------|-------------|
| tdd-workflow | 80%+ 覆盖率的测试驱动开发 |
| security-review | 全面的安全自查表 |
| coding-standards | 通用编码标准 |
| frontend-patterns | React/Next.js 模式 |
| frontend-slides | HTML 幻灯片、PPTX 转换、视觉风格探索 |
| article-writing | 基于笔记和语音参考的长文写作 |
| content-engine | 平台原生的社交内容与重用 |
| market-research | 带源码引用的市场与竞对研究 |
| investor-materials | 商业计划书、备忘录、模型和一页纸介绍 |
| investor-outreach | 个性化对接、后续跟进和介绍短文 |
| backend-patterns | API 设计、数据库、缓存 |
| e2e-testing | Playwright E2E 测试 |
| eval-harness | 评测驱动开发 |
| strategic-compact | 上下文管理 |
| api-design | REST API 设计模式 |
| verification-loop | 构建、测试、lint、类型检查、安全 |

### 关键限制

Codex CLI **目前尚不支持钩子** (OpenAI Codex Issue #2109, 430+ 赞)。安全强制执行是通过 config.toml 中的 `persistent_instructions` 以及沙箱权限系统基于指令实现的。

---

## 🔌 OpenCode 支持 (OpenCode Support)

ECC 提供了**完整的 OpenCode 支持**，包括插件和钩子 (Hooks)。

### 快速开始

```bash
# 安装 OpenCode
npm install -g opencode

# 在仓库根目录运行
opencode
```

配置将自动从 `.opencode/opencode.json` 检测。

### 功能对齐 (Feature Parity)

| 功能 | Claude Code | OpenCode | 状态 |
|---------|-------------|----------|--------|
| 智能体 (Agents) | ✅ 13 个 | ✅ 12 个 | **Claude Code 领先** |
| 命令 (Commands) | ✅ 33 个 | ✅ 24 个 | **Claude Code 领先** |
| 技能 (Skills) | ✅ 50+ 个 | ✅ 37 个 | **Claude Code 领先** |
| 钩子 (Hooks) | ✅ 8 种事件类型 | ✅ 11 个事件 | **OpenCode 更多！** |
| 规则 (Rules) | ✅ 29 条规则 | ✅ 13 条指令 | **Claude Code 领先** |
| MCP 服务器 | ✅ 14 个 | ✅ 完整支持 | **功能持平** |
| 自定义工具 | ✅ 通过钩子实现 | ✅ 6 个原生工具 | **OpenCode 更好** |

### 通过插件支持钩子

OpenCode 的插件系统比 Claude Code 更复杂，拥有 20 多种事件类型：

| Claude Code 钩子 | OpenCode 插件事件 |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**额外的 OpenCode 事件**：`file.edited`, `file.watcher.updated`, `message.updated`, `lsp.client.diagnostics`, `tui.toast.show` 等。

### 可用命令 (32 个)

| 命令 | 描述 |
|---------|-------------|
| `/plan` | 创建实现计划 |
| `/tdd` | 强制执行 TDD 工作流 |
| `/code-review` | 审查代码变更 |
| `/build-fix` | 修复构建错误 |
| `/e2e` | 生成 E2E 测试 |
| `/refactor-clean` | 移除废弃代码 |
| `/orchestrate` | 多智能体工作流 |
| `/learn` | 从会话中提取模式 |
| `/checkpoint` | 保存验证状态 |
| `/verify` | 运行验证循环 |
| `/eval` | 根据准则评测 |
| `/update-docs` | 更新文档 |
| `/update-codemaps` | 更新代码映射 (codemaps) |
| `/test-coverage` | 分析覆盖率 |
| `/go-review` | Go 代码审查 |
| `/go-test` | Go TDD 工作流 |
| `/go-build` | 修复 Go 构建错误 |
| `/python-review` | Python 代码审查 (PEP 8, 类型提示, 安全) |
| `/multi-plan` | 多模型协同规划 |
| `/multi-execute` | 多模型协同执行 |
| `/multi-backend` | 侧重后端的多模型工作流 |
| `/multi-frontend` | 侧重前端的多模型工作流 |
| `/multi-workflow` | 全面的多模型开发工作流 |
| `/pm2` | 自动生成 PM2 服务命令 |
| `/sessions` | 管理会话历史 |
| `/skill-create` | 从 git 生成技能 |
| `/instinct-status` | 查看已学本能 (instincts) |
| `/instinct-import` | 导入本能 |
| `/instinct-export` | 导出本能 |
| `/evolve` | 将本能聚类为技能 |
| `/promote` | 将项目本能提升至全局范围 |
| `/projects` | 列出已知项目及本能统计 |
| `/learn-eval` | 在保存前提取并评测模式 |
| `/setup-pm` | 配置包管理器 |

### 插件安装

**选项 1：直接使用**
```bash
cd everything-claude-code
opencode
```

**选项 2：作为 npm 包安装**
```bash
npm install ecc-universal
```

然后添加到你的 `opencode.json`：
```json
{
  "plugin": ["ecc-universal"]
}
```

### 文档

- **迁移指南**: `.opencode/MIGRATION.md`
- **OpenCode 插件 README**: `.opencode/README.md`
- **整合规则**: `.opencode/instructions/INSTRUCTIONS.md`
- **LLM 文档**: `llms.txt`（为 LLM 提供的完整 OpenCode 文档）

---

## 跨工具功能对齐 (Cross-Tool Feature Parity)

ECC 是**首个最大化利用各大主要 AI 编程工具的插件**。以下是各框架的对比：

| 功能 | Claude Code | Cursor IDE | Codex CLI | OpenCode |
|---------|------------|------------|-----------|----------|
| **智能体 (Agents)** | 13 | 共享 (AGENTS.md) | 共享 (AGENTS.md) | 12 |
| **命令 (Commands)** | 33 | 共享 | 基于指令 | 24 |
| **技能 (Skills)** | 50+ | 共享 | 10 (原生格式) | 37 |
| **钩子事件** | 8 种类型 | 15 种类型 | 尚无 | 11 种类型 |
| **钩子脚本** | 9 个脚本 | 16 个脚本 (DRY 适配器) | N/A | 插件钩子 |
| **规则 (Rules)** | 29 (通用+语言) | 29 (YAML Frontmatter) | 基于指令 | 13 条指令 |
| **自定义工具** | 通过钩子实现 | 通过钩子实现 | N/A | 6 个原生工具 |
| **MCP 服务器** | 14 | 共享 (mcp.json) | 4 (基于命令) | 完整支持 |
| **配置格式** | settings.json | hooks.json + rules/ | config.toml | opencode.json |
| **上下文文件** | CLAUDE.md + AGENTS.md | AGENTS.md | AGENTS.md | AGENTS.md |
| **密钥检测** | 基于钩子 | beforeSubmitPrompt 钩子 | 基于沙箱 | 基于钩子 |
| **自动格式化** | PostToolUse 钩子 | afterFileEdit 钩子 | N/A | file.edited 钩子 |
| **版本** | 插件 | 插件 | 参考配置 | 1.6.0 |

**关键架构决策：**
- 根目录下的 **AGENTS.md** 是通用的跨工具文件（被所有 4 种工具读取）
- **DRY 适配器模式** 让 Cursor 能够重用 Claude Code 的钩子脚本而无需重复
- **技能格式**（带 YAML Frontmatter 的 SKILL.md）可跨 Claude Code, Codex 和 OpenCode 使用
- Codex 缺乏钩子的弱点通过 `persistent_instructions` 和沙箱权限得到了弥补

---

## 📖 背景 (Background)

我从实验性发布阶段就开始使用 Claude Code。在 2025 年 9 月与 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起，完全使用 Claude Code 开发了 [zenith.chat](https://zenith.chat)，并赢得了 Anthropic x Forum Ventures 黑客松。

这些配置在多个生产级应用中经过了实战测试。

---

## 令牌（Token）优化

如果你不管理令牌消耗，使用 Claude Code 可能会很昂贵。以下设置可以在不牺牲质量的前提下显著降低成本。

### 推荐设置

添加到 `~/.claude/settings.json`：

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| 设置 | 默认值 | 推荐值 | 影响 |
|---------|---------|-------------|--------|
| `model` | opus | **sonnet** | 约 60% 成本降低；可处理 80%+ 的编程任务 |
| `MAX_THINKING_TOKENS` | 31,999 | **10,000** | 每次请求的隐藏思考成本降低约 70% |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 95 | **50** | 更早进行压缩 —— 在长会话中保持更好质量 |

仅在需要深度架构推理时切换到 Opus：
```
/model opus
```

### 日常工作流命令

| 命令 | 何时使用 |
|---------|-------------|
| `/model sonnet` | 大多数任务的默认选择 |
| `/model opus` | 复杂架构、调试、深度推理 |
| `/clear` | 在无关任务之间（免费、即时重置） |
| `/compact` | 在逻辑任务断点（研究完成、里程碑达成） |
| `/cost` | 监控会话期间的令牌支出 |

### 策略性压缩 (Strategic Compaction)

本插件包含的 `strategic-compact` 技能建议在逻辑断点处执行 `/compact`，而不是依赖 95% 上下文时的自动压缩。完整决策指南请参见 `skills/strategic-compact/SKILL.md`。

**何时进行压缩：**
- 研究/探索后，实现代码前
- 完成一个里程碑后，开始下一个前
- 调试完成后，继续功能开发前
- 方案失败后，尝试新方案前

**何时不要压缩：**
- 实现过程中（你会丢失变量名、文件路径、部分状态）

### 上下文窗口管理

**至关重要：** 不要一次性启用所有 MCP。每个 MCP 工具描述都会从你 200k 的窗口中消耗令牌，可能会将其减少到 ~70k。

- 每个项目保持启用少于 10 个 MCP
- 保持活动工具少于 80 个
- 在项目配置中使用 `disabledMcpServers` 来禁用不使用的服务

### 智能体团队 (Agent Teams) 成本警告

智能体团队会产生多个上下文窗口。每个团队成员独立消耗令牌。仅在并行化能带来明显价值的任务中使用（多模块工作、并行审查）。对于简单的顺序任务，子智能体 (Subagents) 更节省令牌。

---

## ⚠️ 重要注意事项

### 令牌（Token）优化

达到每日限额了？请参阅 **[令牌优化指南](docs/token-optimization.md)** 以获取推荐设置和工作流建议。

快速见效方案：

```json
// ~/.claude/settings.json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

在无关任务间使用 `/clear`，在逻辑断点使用 `/compact`，并使用 `/cost` 监控支出。

### 自定义

这些配置适用于我的工作流。你应该：
1. 从产生共鸣的部分开始
2. 根据你的技术栈进行修改
3. 移除不使用的部分
4. 添加你自己的模式

---

## 💜 赞助者 (Sponsors)

本项目免费且开源。赞助者的支持有助于维持其维护和成长。

[**成为赞助者**](https://github.com/sponsors/affaan-m) | [赞助等级](SPONSORS.md)

---

## 🌟 星标历史 (Star History)

[![星标历史图表](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## 🔗 链接 (Links)

- **简明指南（从这里开始）：** [Everything Claude Code 简明指南](https://x.com/affaanmustafa/status/2012378465664745795)
- **详细指南（高级）：** [Everything Claude Code 详细指南](https://x.com/affaanmustafa/status/2014040193557471352)
- **关注：** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat:** [zenith.chat](https://zenith.chat)
- **技能目录：** awesome-agent-skills（社区维护的智能体技能目录）
- **可视化工具书：** [Vexilo · Claude Code 工具书](https://vexilo.app/?lang=en) — 31 agents / 99 commands / 123 skills / 13 rules 的可视化索引，按 5 步工作流组织。一键"Teach Claude this handbook"30 秒把整本工具书喂给本地 Claude。([companion repo](https://github.com/lilhawk7077/claude-code-resources))

---

## 📄 许可证 (License)

MIT - 自由使用，根据需要修改，如果可以请回馈贡献。

---

**如果本项目对你有帮助，请点亮 Star。阅读两份指南。构建伟大的产品。**
