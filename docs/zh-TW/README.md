<div align="center">

<img src="../../assets/brand/backend-craft.png" alt="backend-craft logo" width="200" />

# Backend Craft

### 將後端工程規範與工作流程接入你的 AI 程式設計助手。

[![CI](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bovinphang/backend-craft)](https://www.npmjs.com/package/@bovinphang/backend-craft)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E)

**🌐 Language / 语言 / 語言 / 言語 / 언어**

[English](../../README.md) · [简体中文](../../README.zh-CN.md) · [**繁體中文**](../../docs/zh-TW/README.md) · [日本語](../../docs/ja-JP/README.md) · [한국어](../../docs/ko-KR/README.md)

</div>

Backend Craft 將架構、API、資料、安全、測試與故障診斷工作流接入以下 **15 款 AI 程式設計助手**：

`claude` `codex` `cursor` `windsurf` `opencode`
`kilo` `gemini` `copilot` `antigravity` `augment`
`trae` `codebuddy` `cline` `openclaw` `qoder`

各 Runtime 的路徑與注意事項詳見 [Runtime 指南](../../docs/runtimes/README.zh-CN.md)。

提供 **21 個後端 Skill**、**21 個公共工程 Skill**、**8 個 Agent** 與 **8 個命令工作流**。README 提供五種語言版本；可安裝的 Skill、Agent 和命令工作流提供英文、簡體中文內容。

服務工程覆蓋 Rust、Go、Java、Python、C、C++，提供 Spring Boot、FastAPI、Gin、Axum、Drogon 專項。公共 `cc-*` 底座還覆蓋 TypeScript、Electron、Tauri。

[文件導航](../../docs/README.zh-CN.md) · [示例提示詞](../../docs/example-prompts.zh-CN.md) · [貢獻指南](../../CONTRIBUTING.zh-CN.md) · [變更日誌](../../CHANGELOG.zh-CN.md)

## 核心能力

- 使用架構、API、儲存、快取和交易工作流規劃服務演進。
- 結合公共語言規範與五個框架專項，遵循已有專案約定。
- 使用程式碼、安全、效能、除錯和測試規劃 Agent 處理工程任務。
- 只讀識別專案，預覽驗證計劃，使用現有本地工具執行檢查。
- 為不同助手生成適配資源，跟蹤所有權，並與 Frontend Craft 共享公共內容。

**Skill** 提供特定任務的規範與方法，**Agent** 負責專項工程任務，**命令工作流程**提供宿主支援的快捷入口；它們與終端中的 `bec setup` 等 CLI 命令不同。

## 快速開始

準備 **Node.js 22+**、已安裝的 AI 程式設計助手，以及一個既有後端專案。CLI 支援 Windows、macOS 和 Linux。

### 1. 安裝並接入助手

```sh
npm install -g @bovinphang/backend-craft@latest
cd your-backend-project
bec setup
```

將 `your-backend-project` 替換為實際專案目錄。在互動終端中，`bec setup` 會先讓你選擇一個或多個 AI 執行環境（程式設計助手），再選擇英文或簡體中文資源。使用方向鍵移動、空白鍵勾選或取消、Enter 確認。初始勾選 Claude；只接入其他助手時，先取消該選項。資源預設安裝到**目前專案**。

需要跳過互動或編寫指令碼時，明確指定執行環境、安裝範圍和語言。以 Codex 為例：

```sh
bec setup codex --local --lang zh-CN
```

### 2. 檢查安裝結果

在同一專案目錄執行檢查。以下以 Codex 為例；請將 `codex` 替換為[支援清單](../../docs/runtimes/README.zh-CN.md)中實際選擇的執行環境識別碼，多選時逐個檢查。

```sh
bec doctor codex --local --json
```

`installed: true` 表示存在受管安裝，`filesHealthy: true` 表示資源完整。`enabled: "unknown"` 表示 CLI 無法確認助手內部是否已啟用資源。前兩項為 false 時，先根據診斷資訊和 [Runtime 指南](../../docs/runtimes/README.zh-CN.md)排查。

### 3. 完成首次任務

重新整理或重新啟動助手，開啟目標專案並建立新對話，確認助手已發現安裝的資源；如宿主要求信任或啟用，請完成相應操作。對於支援 Skill 的助手，可傳送以下提示詞，將 `services/orders` 替換為實際存在的模組路徑：

```text
使用 bec-code-review 對 services/orders 做唯讀程式碼審查，不修改程式碼。
遵循本倉庫慣例，優先檢查授權、交易邊界和錯誤處理。
列出問題位置、影響與修復建議；如果沒有發現問題，請明確說明。
```

預期得到包含問題位置、影響和修復建議的審查結果，或明確的無問題結論。Claude Code 還提供 `/bec-review`、`/bec-debug` 等工作流程，Codex 使用 Skill 和 Agent。不同宿主的資源形式見 [Runtime 指南](../../docs/runtimes/README.zh-CN.md)，更多任務見[範例提示詞](../../docs/example-prompts.zh-CN.md)。

## 其他安裝方式

### 臨時 npx 執行

不安裝全域 CLI 時使用此方式。後續 CLI 命令也需要使用 `npx @bovinphang/backend-craft@latest` 前綴執行。

```sh
cd your-backend-project
npx @bovinphang/backend-craft@latest setup
```

### Claude Code 原生外掛

在 Claude Code 內執行以下命令。每個執行環境選擇一種安裝管道，同一執行環境的 CLI 接入與原生外掛不能同時安裝。啟用和切換管道見 [Runtime 指南](../../docs/runtimes/README.zh-CN.md)。

```text
/plugin marketplace add bovinphang/backend-craft
/plugin install backend-craft@backend-craft
```

### 使用者級全域接入

需要跨專案使用時，以 `--global` 安裝到使用者級目錄。以下明確選擇 Codex；按需選擇範圍，避免無意中同時安裝本機與全域資源。批次接入和完整預設值見 [CLI 管理](../../docs/cli-management.zh-CN.md)。

```sh
bec setup codex --global --lang zh-CN
```

## 能力目錄

### 後端 Skill

| 領域 | Skill |
| --- | --- |
| 服務設計 | `bec-architecture-design`、`bec-api-design` |
| 資料與一致性 | `bec-database-design`、`bec-cache-design`、`bec-transaction-management` |
| 安全與執行保障 | `bec-auth-security`、`bec-observability`、`bec-performance-optimization` |
| 交付與維護 | `bec-project-init`、`bec-code-review`、`bec-debug-framework`、`bec-testing-strategy`、`bec-tdd-workflow`、`bec-refactoring`、`bec-dependency-management`、`bec-doc-sync` |
| 服務框架 | `bec-spring-boot-project-standard`、`bec-fastapi-project-standard`、`bec-gin-project-standard`、`bec-axum-project-standard`、`bec-drogon-project-standard` |

### 公共工程 Skill

| 領域 | Skill |
| --- | --- |
| 語言 | `cc-typescript-project-standard`、`cc-rust-project-standard`、`cc-go-project-standard`、`cc-java-project-standard`、`cc-python-project-standard`、`cc-c-project-standard`、`cc-cpp-project-standard` |
| 執行時與併發 | `cc-rust-async`、`cc-go-concurrency`、`cc-java-runtime`、`cc-python-async`、`cc-native-memory-safety` |
| 桌面 | `cc-electron-project-standard`、`cc-tauri-project-standard` |
| 工程方法 | `cc-source-driven-development`、`cc-doc-sync-core`、`cc-debug-methodology`、`cc-refactoring-core`、`cc-tdd-methodology` |
| 圖表 | `cc-drawio-studio`、`cc-technical-diagrams` |

### Agent

| Agent | 用途 |
| --- | --- |
| `bec-architect` | 架構與模組邊界規劃 |
| `bec-code-reviewer` | 後端程式碼評審 |
| `bec-security-reviewer` | 認證、授權與服務安全評審 |
| `bec-performance-optimizer` | 效能診斷與最佳化 |
| `bec-debugger` | 故障診斷與驗證修復 |
| `bec-test-planner` | 基於風險的測試策略 |
| `bec-refactoring-expert` | 保持行為的重構 |
| `bec-doc-updater` | 文件同步 |

### 助手命令

| 命令 | 用途 |
| --- | --- |
| `/bec-init` | 初始化專案指導內容 |
| `/bec-plan` | 架構或測試規劃 |
| `/bec-review` | 後端程式碼評審 |
| `/bec-debug` | 診斷與修復故障 |
| `/bec-tdd` | 測試驅動工作流 |
| `/bec-refactor` | 結合行為驗證重構 |
| `/bec-doc-sync` | 同步專案文件 |
| `/bec-validate` | 預覽和執行工程驗證 |

這些是助手工作流，終端驗證使用 `bec validate`。報告寫入 `reports/backend-craft/`，Agent 在該目錄使用各自定義的檔名。

## 配置與驗證

專案驗證需要既有工具鏈及準備完成的專案相依套件。

### 識別和驗證專案

```sh
bec project inspect . --json
bec project inspect . --task-path services/api/main.go --task-kind api --json
bec validate . --dry-run --json
bec validate . --json
```

識別讀取工程證據並推薦適用能力。執行前先審閱驗證計劃。驗證使用顯式配置、專案已有任務或保守語言候選。退出碼 `0` 表示透過，`1` 表示失敗，`2` 表示不完整或輸入無效。缺少必需工具、必需階段被跳過、零測試均無法透過。

- [語言指南](../../docs/languages/README.zh-CN.md)介紹六語言驗證，公共 Skill 的語言覆蓋單獨維護。
- [驗證配置](../../docs/validation-config.zh-CN.md)介紹 `.backend-craft.json`、階段執行與測試證據，整合階段需顯式啟用。
- 自動格式與驗證預設關閉。Claude 原生 SessionStart Hook 提供只讀上下文；OpenClaw 原生外掛可開啟 `autoValidate`，配置 `formatStage` 後可開啟 `autoFormat`。
- [HTTP 重放樣例](../../skills/bec-api-design/examples/engineering/README.md)演示冪等場景。

## 更新與解除安裝

```sh
bec update --dry-run
bec update
bec runtime update codex --local
bec runtime uninstall codex --local
bec uninstall --yes
```

`bec update` 核實原 npm/pnpm 來源，升級 CLI 後重新整理當前專案及全域託管資源。`runtime update` 使用當前包內容，預設沿用每個安裝的語言。`bec uninstall` 解除安裝 CLI 並保留資源，新增 `--purge` 可先清理發現的本產品資源。

使用者修改與未知檔案受到保護。跨產品共享 `cc-*` 要求公共包版本、語言與內容摘要一致。升級混合安裝前，按實際 Runtime 和安裝範圍執行 `bec runtime check-migration codex --local --json`。詳見[共存與遷移](../../docs/coexistence.zh-CN.md)。

## 文件導覽

| 指南 | 內容 |
| --- | --- |
| [Runtime 安裝與啟用](../../docs/runtimes/README.zh-CN.md) | 支援的助手、資源路徑與宿主發現 |
| [CLI 管理](../../docs/cli-management.zh-CN.md) | 安裝範圍、批次操作、更新與解除安裝 |
| [範例提示詞](../../docs/example-prompts.zh-CN.md) | 架構、審查與故障診斷任務 |
| [驗證設定](../../docs/validation-config.zh-CN.md) | 專案檢查與測試證據 |
| [共存與遷移](../../docs/coexistence.zh-CN.md) | 共用資源與安裝衝突 |
| [完整文件導覽](../../docs/README.zh-CN.md) | 語言指南、工程結構及擴充 |

## 原始碼開發與貢獻

本倉庫維護後端領域 Skill、Agent 和工作流程，公共 `cc-*` Skill 與工程方法在 [craft-common](https://github.com/bovinphang/craft-common) 統一維護。`pnpm build` 在 `dist/package/` 組合產生完整英文和簡體中文產品。本機開發及 Git 子模組應載入該組合目錄。

使用 Node.js 22+ 和 `package.json` 宣告的 pnpm 版本；相依版本以 `package.json` 和 `pnpm-lock.yaml` 為準。按以下順序建置：

```sh
git clone https://github.com/bovinphang/backend-craft.git
cd backend-craft
pnpm install --frozen-lockfile
pnpm build
node dist/package/dist/bin/backend-craft.js version
```

從原始碼載入 Claude 外掛時，在倉庫根目錄執行：

```sh
claude --plugin-dir ./dist/package
```

開發檢查、雙語維護及發行封存檔（`pnpm run pack:all`）見[貢獻指南](../../CONTRIBUTING.zh-CN.md)。透過 [GitHub Issues](https://github.com/bovinphang/backend-craft/issues)回報可重現問題。

## 許可證

[MIT](../../LICENSE) © bovinphang。
