<p align="center">
  <img src="./banner.png" alt="DPA Banner" width="80%">
</p>

<p align="center">
  🌐 <a href="README.md">English</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.zh.md">中文</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

# TAURIGHT

TAURIGHT는 Patchright를 기반으로 만든 지속형 멀티세션 브라우저 MCP입니다.

공개 런타임은 모델 없이 동작합니다. 페이지 스냅샷, 요소 번호 지정, 동작 실행, 탭, 세션, 프로필 처리, 업데이트 관리를 외부 의사결정 모델에 의존하지 않고 로컬에서 수행합니다.

**하나의 브라우저 정체성. 여러 개의 독립된 lane. 기본값은 지속형.**

## DPA — Decentralized Protection Alliance

**감시 없는 자유, 모두를 위한 보호.**

https://github.com/dpa-network/welecome

[🌐 dpa.network](https://dpa.network)  
📧 [contact@dpa.network](mailto:contact@dpa.network)  
💬 [Matrix](https://matrix.to/#/#dpa_network:matrix.org)  
📢 [Telegram](https://t.me/dpa_network)

---

## 주요 특징

- 번호가 매겨진 상호작용 요소를 포함하는 빠르고 간결한 페이지 스냅샷
- 원격 의사결정 모델을 거치는 왕복 과정 없이 `snapshot → action`으로 바로 이어지는 작업 흐름
- 이름이 있는 지속형 브라우저 세션
- 같은 논리 프로필에서 persistent lane을 이용해 여러 세션을 동시에 실행
- 탭, 새로고침, 대기, 스크린샷, 키보드, 드래그 앤 드롭, 업로드, 선택, 탐색 제어
- 각 TAURIGHT 릴리스마다 Patchright 버전을 고정하고 테스트
- 프로필을 패키지/설치 디렉터리 밖에 저장하므로 패키지와 Patchright를 업데이트해도 로그인 상태가 사라지지 않음
- 로컬 페이지 스캔: 스냅샷이나 직접 동작에 원격 의사결정 서비스가 필요하지 않음
- Git으로 추적되는 독립형 런타임: TAURIGHT와 검증된 브라우저 의존성이 함께 업데이트됨

## 설치

### Windows 포터블 릴리스

TAURIGHT의 정식 배포 채널은 **GitHub Releases**입니다.

1. 최신 GitHub Release에서 `TAURIGHT-vX.Y.Z-win-x64.zip`을 다운로드합니다.
2. 필요하면 함께 제공되는 `.sha256` 파일로 무결성을 확인합니다.
3. 원하는 위치에 압축을 풉니다.
4. `TAURIGHT.cmd`를 실행합니다.

포터블 아카이브에는 Node 런타임과 TAURIGHT에서 검증한 런타임 의존성이 포함되어 있습니다. 패키지 레지스트리 계정, 전역 패키지 설치, publish/login 절차가 필요하지 않습니다.

### Git 체크아웃

TAURIGHT는 검증한 런타임 의존성을 저장소에서 직접 추적합니다. 따라서 Git 체크아웃에는 레지스트리 설치 단계가 필요하지 않습니다. `TAURIGHT.cmd`는 `.git` 체크아웃을 감지하면 실행 전에 안전하게 `git pull --ff-only`를 수행하므로 TAURIGHT 코드와 검증된 Patchright 런타임이 함께 업데이트됩니다. fast-forward가 불가능하면 현재 검증된 런타임을 그대로 유지한 채 정상적으로 시작합니다.

`package.json`은 레지스트리 배포 계약이 아니라 런타임 의존성 메타데이터로 유지됩니다. 공식 릴리스는 같은 Git 추적 런타임에서 빌드되며 GitHub Release 자산으로 배포됩니다.

TAURIGHT는 `PATCHRIGHT_CHANNEL`로 다른 Patchright 지원 채널을 선택하지 않는 한 기본 지원 브라우저 채널을 사용합니다.

## 지속형 데이터

TAURIGHT는 기본적으로 지속형 사용자 데이터를 패키지 설치 디렉터리 밖에 저장합니다.

- Windows: `%LOCALAPPDATA%\TAURIGHT`
- macOS: `~/Library/Application Support/TAURIGHT`
- Linux: `~/.local/share/tauright`

이 위치에는 canonical profile과 persistent lane profile이 저장됩니다. 따라서 패키지 업데이트, 의존성 재설치, Patchright 업그레이드는 브라우저 정체성과 로그인 상태와 분리되어 처리됩니다.

루트 경로를 바꾸려면 다음 값을 설정합니다.

```text
TAURIGHT_DATA_ROOT=D:\my-tauright-data
```

## 같은 프로필의 동시 세션

서로 다른 세션 이름에 같은 `profile_key`를 사용합니다. 각 세션은 같은 canonical profile에서 한 번만 초기화된 persistent lane을 받습니다. 따라서 실행 중인 각 브라우저는 같은 논리 프로필 원본을 공유하면서도 서로 독립된 user-data 디렉터리를 사용합니다.

예시:

```text
session=worker-a profile_key=my-profile
session=worker-b profile_key=my-profile
session=worker-c profile_key=my-profile
```

각 lane을 처음 만들 때 canonical profile에서 복사합니다. 이후 실행에서는 해당 lane을 다시 사용하므로 lane 내부에서 생성된 쿠키, 로그인 상태, 기타 지속형 브라우저 데이터가 재시작 후에도 유지됩니다.

## 의존성 업데이트 정책

TAURIGHT는 시작 시 패키지 레지스트리를 조회하거나 의존성을 변경하지 **않습니다**.

각 TAURIGHT 릴리스는 해당 릴리스와 함께 테스트한 Patchright 버전을 고정합니다. 검증된 런타임은 TAURIGHT 자체와 함께 커밋되므로 Git fast-forward 한 번으로 애플리케이션과 브라우저 런타임이 함께 업데이트됩니다. 브라우저 프로필과 persistent lane은 애플리케이션 디렉터리 밖에 유지되므로 TAURIGHT를 교체하거나 업데이트해도 로그인 상태가 삭제되지 않습니다.

## MCP 도구

공개 MCP는 다음 로컬 브라우저 작업을 제공합니다.

- `browser_session_create`
- `browser_sessions`
- `browser_session_use`
- `browser_session_close`
- `browser_status`
- `browser_open`
- `browser_snapshot`
- `browser_act`
- `browser_tabs`
- `browser_tab_new`
- `browser_tab_switch`
- `browser_tab_close`
- `browser_reload`
- `browser_wait`
- `browser_screenshot`
- `browser_close`

## 빠른 MCP 설정

TAURIGHT를 stdio로 실행합니다.

```json
{
  "mcpServers": {
    "tauright": {
      "command": "node",
      "args": ["/absolute/path/to/TAURIGHT/bin/tauright-mcp.mjs"]
    }
  }
}
```

Windows 포터블 릴리스에서는 MCP 설정이 압축을 푼 `TAURIGHT.cmd`를 가리키게 하거나, 포함된 런타임과 `bin/tauright-mcp.mjs`를 직접 가리키게 하면 됩니다.

## 프로젝트 상태

TAURIGHT는 현재 **0.2.x**입니다. 세션, lane, 프로필 지속성, 탭 제어, 스냅샷, 동작, 스크린샷, 릴리스에 고정된 Patchright 런타임 업데이트를 실제 작업 흐름에서 사용하며 검증하고 있습니다.

공개 저장소에서 이슈와 범위가 명확한 pull request를 환영합니다.

## Upstream

TAURIGHT는 브라우저 자동화 의존성으로 **Patchright**를 사용합니다. Patchright는 독립적으로 유지보수되며 Apache-2.0 라이선스로 배포됩니다. 저작자 표시와 관련한 내용은 `THIRD_PARTY_NOTICES.md`를 참고하세요.

## 배포

TAURIGHT는 **TAU GROUP / DPA.network** 아래의 **TAU-BREATH** 프로젝트로 배포됩니다.

### 배포 정책: GitHub Releases 전용

**TAURIGHT는 npm을 배포 채널로 사용하지 않습니다.**

소프트웨어 공급망 위험, 인증 절차의 번거로움, 추가 게시 관문에 대한 불필요한 의존을 피하기 위해 레지스트리 중심 배포 방식을 의도적으로 사용하지 않습니다. TAURIGHT의 공식 공개 소스와 릴리스 자산은 GitHub에 있으며, 포터블 릴리스 아카이브와 SHA-256 체크섬은 GitHub Releases를 통해 배포됩니다.

**npm publish 없음. 런타임 레지스트리 확인 없음. GitHub Releases가 정식 배포 채널입니다.**

**DPA — Decentralized Protection Alliance**  
감시 없는 자유, 모두를 위한 보호.

[🌐 dpa.network](https://dpa.network) · [📧 contact@dpa.network](mailto:contact@dpa.network) · [💬 Matrix](https://matrix.to/#/#dpa_network:matrix.org) · [📢 Telegram](https://t.me/dpa_network)
