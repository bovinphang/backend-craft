<div align="center">

<img src="../../assets/brand/backend-craft.png" alt="backend-craft logo" width="200" />

# Backend Craft

### 하나의 도구 모음으로 모든 AI 코딩 도우미에 프로덕션 수준의 백엔드 표준을 적용합니다.

[![CI](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/bovinphang/backend-craft/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@bovinphang/backend-craft)](https://www.npmjs.com/package/@bovinphang/backend-craft)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-5FA04E)

**🌐 Language / 语言 / 語言 / 言語 / 언어**

[English](../../README.md) · [简体中文](../../README.zh-CN.md) · [繁體中文](../../docs/zh-TW/README.md) · [日本語](../../docs/ja-JP/README.md) · [**한국어**](../../docs/ko-KR/README.md)

</div>

Backend Craft는 아키텍처, API, 데이터, 보안, 테스트 및 문제 진단 워크플로를 다음 **15개 AI 코딩 도우미**에 제공합니다.

`claude` `codex` `cursor` `windsurf` `opencode`
`kilo` `gemini` `copilot` `antigravity` `augment`
`trae` `codebuddy` `cline` `openclaw` `qoder`

런타임별 경로와 주의 사항은 [런타임 가이드](../../docs/runtimes/README.md)를 참조하세요.

**백엔드 스킬 21개**, **공통 엔지니어링 스킬 21개**, **에이전트 8개**, **명령 워크플로 8개**를 포함합니다. README는 5개 언어로 제공됩니다. 설치 가능한 스킬, 에이전트 및 명령 워크플로는 영어와 중국어 간체로 제공됩니다.

Rust, Go, Java, Python, C, C++ 서비스 개발을 지원하며 Spring Boot, FastAPI, Gin, Axum, Drogon 전용 스킬을 제공합니다. 공통 `cc-*` 기반은 TypeScript, Electron, Tauri도 지원합니다.

[문서](../../docs/README.md) · [프롬프트 예시](../../docs/example-prompts.md) · [기여 안내](../../CONTRIBUTING.md) · [변경 이력](../../CHANGELOG.md)

## 주요 기능

- 아키텍처, API, 스토리지, 캐시 및 트랜잭션 워크플로로 서비스 발전을 계획합니다.
- 기존 프로젝트 규칙에 따라 공통 언어 표준과 5개 프레임워크 전용 스킬을 적용합니다.
- 코드, 보안, 성능, 디버깅 및 테스트 계획 전용 에이전트를 사용합니다.
- 프로젝트를 분석하고 검증 계획을 미리 확인한 후 기존 로컬 도구로 검사를 실행합니다.
- 런타임별 리소스를 생성하고 소유 관계를 추적하며 Frontend Craft와 공통 콘텐츠를 공유합니다.

## 설치

**Node.js 22 이상**이 필요합니다. CLI는 Windows, macOS, Linux를 지원합니다. 백엔드 검증에는 프로젝트의 기존 도구 체인과 준비된 의존성도 필요합니다.

### CLI 전역 설치

```sh
npm install -g @bovinphang/backend-craft@latest
cd your-backend-project
bec runtime install codex --local --lang en
bec doctor codex --local --json
```

npm 명령은 `bec`와 `backend-craft` 터미널 명령을 설치합니다. `runtime install`은 선택한 런타임을 프로젝트에 연결합니다. 사용자 전체 리소스에는 `--global`, 중국어 간체 콘텐츠에는 `--lang zh-CN`을 사용하세요.

### npx로 임시 실행

```sh
cd your-backend-project
npx @bovinphang/backend-craft@latest runtime install codex --local --lang en
npx @bovinphang/backend-craft@latest matrix --json
```

### Claude Code 네이티브 플러그인

Claude Code에서 Marketplace를 추가하고 플러그인을 설치하세요.

```text
/plugin marketplace add bovinphang/backend-craft
/plugin install backend-craft@backend-craft
```

로컬 소스에서 플러그인을 불러오려면 먼저 빌드한 후 저장소 루트에서 `claude --plugin-dir .`을 실행하세요. [런타임 설치 가이드](../../docs/runtimes/README.md)를 참조하세요.

런타임마다 설치 경로를 하나 선택하세요. 호스트를 새로 고친 후 리소스가 발견되고 활성화되는지 확인하세요.

### 소스에서 빌드

저장소 루트에서 pnpm 12.4.1로 CLI를 빌드하고 Node.js로 직접 실행하세요. 이 소스는 `@bovinphang/craft-common@2.1.0`으로 고정되어 있습니다.

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/bin/backend-craft.js setup codex --local --lang en --dry-run --json
```

### 런타임 설정

설치된 CLI로 대상 프로젝트에서 다음 명령을 실행하세요. `setup` 명령에는 Backend Craft 1.1.0 이상이 필요합니다.

```sh
bec setup
bec setup codex --local --lang en
bec setup all --local --lang en
bec runtime install --all --global --lang en --dry-run --json
```

`setup`은 기본적으로 현재 프로젝트를 대상으로 합니다. 일반 대화형 설치에서는 런타임, 언어, 위치를 선택합니다. 일반 비대화형 설치의 기본값은 Claude, 전역 범위, 영어입니다. 스크립트에서는 `--local` 또는 `--global`을 명시하세요. [CLI 관리](../../docs/cli-management.md)를 참조하세요.

## 빠른 시작

### 프로젝트 분석 및 검증

```sh
bec project inspect . --json
bec project inspect . --task-path services/api/main.go --task-kind api --json
bec validate . --dry-run --json
bec validate . --json
```

분석은 프로젝트 근거를 읽고 적합한 기능을 추천합니다. 실행 전에 계획을 검토하세요. 검증은 명시적 설정, 기존 프로젝트 작업 또는 언어별 보수적 제안을 사용합니다. 종료 코드는 통과 `0`, 실패 `1`, 불완전 또는 잘못된 입력 `2`입니다. 필수 도구 누락, 필수 단계 건너뛰기 또는 테스트 0개인 경우 통과할 수 없습니다.

### 도우미와 작업하기

```text
이 저장소의 아키텍처 및 API 규칙에 따라 주문 서비스를 계획하세요.
services/orders의 권한 부여와 트랜잭션 경계를 검토하세요.
이 Go 취소 전파 버그를 진단하고 기존 테스트로 수정을 검증하세요.
```

Claude Code는 `/bec-review`, `/bec-debug` 워크플로를 제공합니다. Codex는 스킬과 에이전트로 이 작업을 수행합니다. 다른 호스트의 리소스는 [런타임 가이드](../../docs/runtimes/README.md)에 설명되어 있습니다.

## 기능 목록

### 백엔드 스킬

| 영역 | 스킬 |
| --- | --- |
| 서비스 설계 | `bec-architecture-design`, `bec-api-design` |
| 데이터 및 일관성 | `bec-database-design`, `bec-cache-design`, `bec-transaction-management` |
| 보안 및 운영 | `bec-auth-security`, `bec-observability`, `bec-performance-optimization` |
| 제공 및 유지보수 | `bec-project-init`, `bec-code-review`, `bec-debug-framework`, `bec-testing-strategy`, `bec-tdd-workflow`, `bec-refactoring`, `bec-dependency-management`, `bec-doc-sync` |
| 서비스 프레임워크 | `bec-spring-boot-project-standard`, `bec-fastapi-project-standard`, `bec-gin-project-standard`, `bec-axum-project-standard`, `bec-drogon-project-standard` |

### 공통 엔지니어링 스킬

| 영역 | 스킬 |
| --- | --- |
| 언어 | `cc-typescript-project-standard`, `cc-rust-project-standard`, `cc-go-project-standard`, `cc-java-project-standard`, `cc-python-project-standard`, `cc-c-project-standard`, `cc-cpp-project-standard` |
| 런타임 및 동시성 | `cc-rust-async`, `cc-go-concurrency`, `cc-java-runtime`, `cc-python-async`, `cc-native-memory-safety` |
| 데스크톱 | `cc-electron-project-standard`, `cc-tauri-project-standard` |
| 엔지니어링 방법 | `cc-source-driven-development`, `cc-doc-sync-core`, `cc-debug-methodology`, `cc-refactoring-core`, `cc-tdd-methodology` |
| 다이어그램 | `cc-drawio-studio`, `cc-technical-diagrams` |

### 에이전트

| 에이전트 | 용도 |
| --- | --- |
| `bec-architect` | 아키텍처 및 모듈 경계 계획 |
| `bec-code-reviewer` | 백엔드 코드 검토 |
| `bec-security-reviewer` | 인증, 권한 부여 및 서비스 보안 검토 |
| `bec-performance-optimizer` | 성능 진단 및 최적화 |
| `bec-debugger` | 장애 진단 및 검증된 수정 |
| `bec-test-planner` | 위험 기반 테스트 전략 |
| `bec-refactoring-expert` | 동작을 유지하는 리팩터링 |
| `bec-doc-updater` | 문서 동기화 |

### 도우미 명령

| 명령 | 용도 |
| --- | --- |
| `/bec-init` | 프로젝트 지침 초기화 |
| `/bec-plan` | 아키텍처 또는 테스트 계획 |
| `/bec-review` | 백엔드 코드 검토 |
| `/bec-debug` | 장애 진단 및 수정 |
| `/bec-tdd` | 테스트 주도 워크플로 적용 |
| `/bec-refactor` | 동작 검증을 포함한 리팩터링 |
| `/bec-doc-sync` | 문서 동기화 |
| `/bec-validate` | 검증 미리 확인 및 실행 |

이 명령은 도우미 워크플로입니다. 터미널 검증에는 `bec validate`를 사용하세요. 보고서는 `reports/backend-craft/`에 저장되며 각 에이전트가 파일명을 지정합니다.

## 설정 및 검증

- [언어 가이드](../../docs/languages/README.md)는 6개 프로그래밍 언어의 검증을 설명합니다. 공통 스킬의 언어 지원 범위는 별도로 관리합니다.
- [검증 설정](../../docs/validation-config.md)은 `.backend-craft.json`, 단계 실행 및 테스트 근거를 설명합니다. 통합 단계는 명시적으로 활성화해야 합니다.
- 자동 서식 지정과 검증은 기본적으로 꺼져 있습니다. Claude 네이티브 SessionStart는 읽기 전용 컨텍스트를 제공합니다. OpenClaw 네이티브에서는 `autoValidate`를 켤 수 있으며 `formatStage`를 설정하면 `autoFormat`도 켤 수 있습니다.
- [HTTP 재실행 예시](../../skills/bec-api-design/examples/engineering/README.md)는 멱등성 시나리오를 보여줍니다.

## 업데이트 및 제거

CLI 자체 관리 명령인 `bec update`와 `bec uninstall`에는 Backend Craft 1.1.0 이상이 필요합니다.

```sh
bec update --dry-run
bec update
bec runtime update codex --local --dry-run --json
bec runtime update codex --local
bec runtime uninstall codex --local --dry-run --json
bec runtime uninstall codex --local
bec uninstall --yes
```

`bec update`는 원래 npm/pnpm 설치를 확인하고 CLI를 업그레이드한 뒤 현재 프로젝트와 전역의 관리 리소스를 갱신합니다. `runtime update`는 설치된 콘텐츠를 사용하며 재정의하지 않으면 각 설치의 언어를 유지합니다. `bec uninstall`은 리소스를 유지하고 CLI를 제거합니다. 발견된 제품 리소스를 먼저 정리하려면 `--purge`를 추가하세요.

수정된 파일과 알 수 없는 파일은 보호됩니다. 공유 `cc-*` 리소스는 공통 패키지 버전, 언어 및 콘텐츠 다이제스트가 일치해야 합니다. 혼합 설치를 업그레이드하기 전에 해당 런타임과 범위로 `bec runtime check-migration codex --local --json`을 실행하세요. [공존 및 마이그레이션](../../docs/coexistence.md)을 참조하세요.

## 문서

[문서 목록](../../docs/README.md)은 설치, 프롬프트, 설정, 마이그레이션 및 유지보수를 안내합니다.

## 기여

개발 환경, 영어·중국어 간체 콘텐츠 유지보수 및 검사는 [기여 안내](../../CONTRIBUTING.md)를 참조하세요. 재현 가능한 문제는 [GitHub Issues](https://github.com/bovinphang/backend-craft/issues)로 제보하세요.

## 라이선스

[MIT](../../LICENSE) © bovinphang.

공통 콘텐츠는 craft-common에서 관리합니다. 이 소스 저장소는 도메인 스킬을 저장하며 `pnpm run build`가 `dist/package/`에 영어·중국어 간체 제품 전체를 생성합니다. 로컬 개발과 Git 서브모듈에서는 `--plugin-dir <repository>/dist/package`를 사용합니다. 배포용 아카이브는 `pnpm run pack:all`로 생성합니다. 자세한 내용은 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 참조하세요.
