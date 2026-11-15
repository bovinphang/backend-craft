<div align="center">

<img src="../../assets/brand/backend-craft.png" alt="backend-craft logo" width="200" />

# Backend Craft

### ひとつのツールキット。すべての AI コーディングアシスタント。本番品質のバックエンド標準。

[![CI](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bovinphang/backend-craft)](https://www.npmjs.com/package/@bovinphang/backend-craft)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E)

**🌐 Language / 语言 / 語言 / 言語 / 언어**

[English](../../README.md) · [简体中文](../../README.zh-CN.md) · [繁體中文](../../docs/zh-TW/README.md) · [**日本語**](../../docs/ja-JP/README.md) · [한국어](../../docs/ko-KR/README.md)

</div>

Backend Craft は、アーキテクチャ、API、データ、セキュリティ、テスト、障害診断のワークフローを、次の **15 の AI コーディングアシスタント**に提供します。

`claude` `codex` `cursor` `windsurf` `opencode`
`kilo` `gemini` `copilot` `antigravity` `augment`
`trae` `codebuddy` `cline` `openclaw` `qoder`

ランタイムごとのパスと注意事項は、[ランタイムガイド](../../docs/runtimes/README.md)を参照してください。

**21 のバックエンドスキル**、**21 の共通エンジニアリングスキル**、**8 のエージェント**、**8 のコマンドワークフロー**を含みます。README は 5 言語で提供されます。インストール可能なスキル、エージェント、コマンドワークフローは英語と簡体字中国語に対応しています。

Rust、Go、Java、Python、C、C++ のサービス開発を対象とし、Spring Boot、FastAPI、Gin、Axum、Drogon の専用スキルを提供します。共通の `cc-*` 基盤は TypeScript、Electron、Tauri も対象とします。

[ドキュメント](../../docs/README.md) · [プロンプト例](../../docs/example-prompts.md) · [貢献ガイド](../../CONTRIBUTING.md) · [変更履歴](../../CHANGELOG.md)

## 主な機能

- アーキテクチャ、API、ストレージ、キャッシュ、トランザクションのワークフローでサービスの発展を計画します。
- 既存プロジェクトの規約に従い、共通の言語標準と 5 つのフレームワーク向け専門スキルを適用します。
- コード、セキュリティ、パフォーマンス、デバッグ、テスト計画の専用エージェントを利用します。
- プロジェクトを調査し、検証計画をプレビューして既存のローカルツールでチェックを実行します。
- ランタイム別リソースを生成し、所有関係を追跡して Frontend Craft と共通コンテンツを共有します。

## インストール

**Node.js 22+** が必要です。CLI は Windows、macOS、Linux に対応します。バックエンドの検証には、プロジェクト既存のツールチェーンと準備済みの依存関係も必要です。

### CLI のグローバルインストール

```sh
npm install -g @bovinphang/backend-craft@latest
cd your-backend-project
bec runtime install codex --local --lang en
bec doctor codex --local --json
```

npm コマンドは `bec` と `backend-craft` をターミナルにインストールします。`runtime install` は選択したランタイムをプロジェクトに接続します。ユーザー全体のリソースには `--global`、簡体字中国語のコンテンツには `--lang zh-CN` を指定します。

### npx による一時実行

```sh
cd your-backend-project
npx @bovinphang/backend-craft@latest runtime install codex --local --lang en
npx @bovinphang/backend-craft@latest matrix --json
```

### Claude Code ネイティブプラグイン

Claude Code 内で Marketplace を追加し、プラグインをインストールします。

```text
/plugin marketplace add bovinphang/backend-craft
/plugin install backend-craft@backend-craft
```

ローカルのソースからプラグインを読み込む場合は、先にビルドし、リポジトリルートで `claude --plugin-dir .` を実行します。[ランタイムインストールガイド](../../docs/runtimes/README.md)を参照してください。

ランタイムごとにインストール経路をひとつ選びます。ホストを更新し、リソースの検出と有効化を確認してください。

### ソースからビルド

リポジトリルートで pnpm 12.4.1 を使って CLI をビルドし、Node.js で直接実行します。このソースでは `@bovinphang/craft-common@2.1.0` に固定しています。

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/bin/backend-craft.js setup codex --local --lang en --dry-run --json
```

### ランタイム設定

インストール済みの CLI を使い、対象プロジェクトで以下を実行します。`setup` コマンドには Backend Craft 1.1.0 以降が必要です。

```sh
bec setup
bec setup codex --local --lang en
bec setup all --local --lang en
bec runtime install --all --global --lang en --dry-run --json
```

`setup` は既定で現在のプロジェクトを対象とします。通常の対話式インストールではランタイム、言語、場所を選びます。通常の非対話式インストールは Claude、グローバル、英語が既定です。スクリプトでは `--local` または `--global` を明示してください。[CLI 管理](../../docs/cli-management.md)を参照してください。

## クイックスタート

### プロジェクトの調査と検証

```sh
bec project inspect . --json
bec project inspect . --task-path services/api/main.go --task-kind api --json
bec validate . --dry-run --json
bec validate . --json
```

調査ではプロジェクトの情報を読み取り、適切な機能を推奨します。実行前に計画を確認してください。検証は明示設定、既存タスク、または言語別の保守的な候補を使用します。終了コードは成功が `0`、失敗が `1`、未完了または入力不正が `2` です。必須ツールの不足、必須段階のスキップ、テスト数ゼロでは成功になりません。

### アシスタントとの作業

```text
このリポジトリのアーキテクチャと API 規約に従って注文サービスを計画してください。
services/orders の認可とトランザクション境界をレビューしてください。
この Go のキャンセル処理の不具合を診断し、既存テストで修正を検証してください。
```

Claude Code は `/bec-review`、`/bec-debug` などのワークフローを提供します。Codex ではスキルとエージェントを使用します。その他のホストのリソースは[ランタイムガイド](../../docs/runtimes/README.md)に記載しています。

## 機能一覧

### バックエンドスキル

| 分野 | スキル |
| --- | --- |
| サービス設計 | `bec-architecture-design`, `bec-api-design` |
| データと整合性 | `bec-database-design`, `bec-cache-design`, `bec-transaction-management` |
| セキュリティと運用 | `bec-auth-security`, `bec-observability`, `bec-performance-optimization` |
| デリバリーと保守 | `bec-project-init`, `bec-code-review`, `bec-debug-framework`, `bec-testing-strategy`, `bec-tdd-workflow`, `bec-refactoring`, `bec-dependency-management`, `bec-doc-sync` |
| サービスフレームワーク | `bec-spring-boot-project-standard`, `bec-fastapi-project-standard`, `bec-gin-project-standard`, `bec-axum-project-standard`, `bec-drogon-project-standard` |

### 共通エンジニアリングスキル

| 分野 | スキル |
| --- | --- |
| 言語 | `cc-typescript-project-standard`, `cc-rust-project-standard`, `cc-go-project-standard`, `cc-java-project-standard`, `cc-python-project-standard`, `cc-c-project-standard`, `cc-cpp-project-standard` |
| ランタイムと並行処理 | `cc-rust-async`, `cc-go-concurrency`, `cc-java-runtime`, `cc-python-async`, `cc-native-memory-safety` |
| デスクトップ | `cc-electron-project-standard`, `cc-tauri-project-standard` |
| エンジニアリング手法 | `cc-source-driven-development`, `cc-doc-sync-core`, `cc-debug-methodology`, `cc-refactoring-core`, `cc-tdd-methodology` |
| 図表 | `cc-drawio-studio`, `cc-technical-diagrams` |

### エージェント

| エージェント | 用途 |
| --- | --- |
| `bec-architect` | アーキテクチャとモジュール境界の計画 |
| `bec-code-reviewer` | バックエンドコードレビュー |
| `bec-security-reviewer` | 認証・認可とサービスセキュリティのレビュー |
| `bec-performance-optimizer` | パフォーマンスの診断と最適化 |
| `bec-debugger` | 障害診断と検証済み修正 |
| `bec-test-planner` | リスクに基づくテスト戦略 |
| `bec-refactoring-expert` | 動作を維持するリファクタリング |
| `bec-doc-updater` | ドキュメントの同期 |

### アシスタントコマンド

| コマンド | 用途 |
| --- | --- |
| `/bec-init` | プロジェクトガイドの初期化 |
| `/bec-plan` | アーキテクチャまたはテストの計画 |
| `/bec-review` | バックエンドコードのレビュー |
| `/bec-debug` | 障害の診断と修正 |
| `/bec-tdd` | テスト駆動ワークフローの適用 |
| `/bec-refactor` | 動作検証を伴うリファクタリング |
| `/bec-doc-sync` | ドキュメントの同期 |
| `/bec-validate` | 検証のプレビューと実行 |

これらはアシスタント用ワークフローです。ターミナルでの検証には `bec validate` を使います。レポートは `reports/backend-craft/` に出力し、各エージェントがファイル名を指定します。

## 設定と検証

- [言語ガイド](../../docs/languages/README.md)では 6 つのプログラミング言語の検証を説明します。共通スキルの言語対応範囲は別途管理します。
- [検証設定](../../docs/validation-config.md)では `.backend-craft.json`、段階ごとの実行、テストの証拠を説明します。統合段階は明示的な有効化が必要です。
- 自動整形と自動検証は既定で無効です。Claude ネイティブの SessionStart は読み取り専用のコンテキストを提供します。OpenClaw ネイティブでは `autoValidate` を有効化でき、`formatStage` の設定後は `autoFormat` も有効化できます。
- [HTTP リプレイの例](../../skills/bec-api-design/examples/engineering/README.md)では冪等性のシナリオを示します。

## 更新とアンインストール

CLI 自己管理コマンドの `bec update` と `bec uninstall` には Backend Craft 1.1.0 以降が必要です。

```sh
bec update --dry-run
bec update
bec runtime update codex --local --dry-run --json
bec runtime update codex --local
bec runtime uninstall codex --local --dry-run --json
bec runtime uninstall codex --local
bec uninstall --yes
```

`bec update` は元の npm/pnpm インストールを確認し、CLI と現在のプロジェクトおよびグローバルの管理対象リソースを更新します。`runtime update` はインストール済みコンテンツを使い、指定がなければ各インストールの言語を維持します。`bec uninstall` はリソースを残して CLI を削除します。先に検出済みの製品リソースを削除する場合は `--purge` を追加します。

変更済みファイルと未知のファイルは保護されます。共有する `cc-*` リソースは共通パッケージのバージョン、言語、コンテンツダイジェストが一致する必要があります。混在するインストールの更新前に、対象ランタイムと範囲を指定して `bec runtime check-migration codex --local --json` を実行してください。[共存と移行](../../docs/coexistence.md)を参照してください。

## ドキュメント

[ドキュメント一覧](../../docs/README.md)にインストール、プロンプト、設定、移行、保守の情報をまとめています。

## 貢献

開発環境、英語・簡体字中国語コンテンツの保守、チェックについては[貢献ガイド](../../CONTRIBUTING.md)を参照してください。再現可能な問題は [GitHub Issues](https://github.com/bovinphang/backend-craft/issues) に報告してください。

## ライセンス

[MIT](../../LICENSE) © bovinphang.

共通コンテンツは craft-common で管理します。このソースリポジトリはドメインスキルを保持し、`pnpm run build` が `dist/package/` に英語・簡体字中国語の製品全体を生成します。ローカル開発と Git サブモジュールでは `--plugin-dir <repository>/dist/package` を使います。配布用アーカイブは `pnpm run pack:all` で生成します。詳しくは [CONTRIBUTING.md](../../CONTRIBUTING.md) を参照してください。
