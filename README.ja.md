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

TAURIGHT は Patchright を基盤とする、永続型マルチセッション・ブラウザ MCP です。

公開ランタイムはモデル非依存です。ページスナップショット、要素番号、操作、タブ、セッション、プロファイル処理、更新管理は、外部の意思決定モデルなしでローカル実行されます。

**ひとつのブラウザ ID。複数の独立 lane。永続性がデフォルト。**

## 公開配布 ID

- 公開配布 ID: **TAU-BREATH**
- グループ: **TAU GROUP**
- 配布ネットワーク: **DPA.network**
- GitHub Releases と公開ドキュメントでは、外部 AI 企業名やモデル名を使用しません。
- 公開プロジェクト ID、作者 ID、リリースノート、パッケージメタデータ、例、ドキュメントでは **TAU-BREATH** を一貫して使用します。
- TAURIGHT の公開配布は **TAU GROUP / DPA.network** に統合されます。

## DPA — Decentralized Protection Alliance

**Freedom without surveillance, protection for everyone.**

https://github.com/dpa-network/welecome

[🌐 dpa.network](https://dpa.network)  
📧 [contact@dpa.network](mailto:contact@dpa.network)  
💬 [Matrix](https://matrix.to/#/#dpa_network:matrix.org)  
📢 [Telegram](https://t.me/dpa_network)

---

## 主な特徴

- 番号付きの操作可能要素を含む、高速でコンパクトなページスナップショット
- リモート意思決定モデルへの往復なしで行う直接的な snapshot → action フロー
- 名前付きの永続ブラウザセッション
- 同一の論理プロファイルから、永続 lane を使って複数セッションを同時実行
- tabs、reload、wait、screenshot、keyboard、drag/drop、upload、select、navigation の制御
- 各 TAURIGHT リリースごとに固定・検証される Patchright バージョン
- プロファイルをパッケージ/インストール先の外に保存し、パッケージや Patchright の更新でログイン状態が消えない
- ローカルページスキャン: snapshot や直接操作にリモート意思決定サービスは不要
- 自己完結型の Git 追跡ランタイム: TAURIGHT と検証済みブラウザ依存関係が一緒に更新される

## インストール

### Windows ポータブルリリース

TAURIGHT の公式配布チャネルは **GitHub Releases** です。

1. 最新の GitHub Release から `TAURIGHT-vX.Y.Z-win-x64.zip` をダウンロードします。
2. 必要に応じて同梱の `.sha256` ファイルを検証します。
3. 任意の場所に展開します。
4. `TAURIGHT.cmd` を実行します。

ポータブルアーカイブには Node ランタイムと TAURIGHT の検証済みランタイム依存関係が含まれます。パッケージレジストリアカウント、グローバルパッケージのインストール、publish/login フローは不要です。

### Git checkout

TAURIGHT は検証済みランタイム依存関係をリポジトリ内で直接追跡します。そのため Git checkout ではレジストリからのインストール手順は不要です。`TAURIGHT.cmd` は `.git` checkout を検出すると起動前に安全な `git pull --ff-only` を実行し、TAURIGHT 本体と検証済み Patchright ランタイムを一緒に更新します。fast-forward できない場合は、現在の検証済みランタイムをそのまま使用して正常に起動します。

`package.json` はレジストリ配布契約ではなく、ランタイム依存関係のメタデータとして保持されます。公式リリースは同じ Git 追跡ランタイムからビルドされ、GitHub Release asset として公開されます。

`PATCHRIGHT_CHANNEL` で別の Patchright 対応チャネルを指定しない限り、TAURIGHT は既定の対応ブラウザチャネルを使用します。

## 永続データ

TAURIGHT は既定で、永続ユーザーデータをパッケージのインストール先とは別の場所に保存します。

- Windows: `%LOCALAPPDATA%\TAURIGHT`
- macOS: `~/Library/Application Support/TAURIGHT`
- Linux: `~/.local/share/tauright`

ここには canonical profile と persistent lane profile が保存されます。したがって、パッケージ更新、依存関係の再インストール、Patchright のアップグレードは、ブラウザ ID やログイン状態から分離されます。

ルートは次のように上書きできます。

```text
TAURIGHT_DATA_ROOT=D:\my-tauright-data
```

## 同一プロファイルの同時セッション

異なるセッション名で同じ `profile_key` を使用します。各セッションには、同じ canonical profile から一度だけ初期化される永続 lane が割り当てられます。これにより、各実行中ブラウザは独立した user-data ディレクトリを持ちながら、同じ論理プロファイルの起点を共有します。

例:

```text
session=worker-a profile_key=my-profile
session=worker-b profile_key=my-profile
session=worker-c profile_key=my-profile
```

各 lane の初回作成時には canonical profile がコピーされます。その後は同じ lane が再利用されるため、cookie、ログイン状態、その lane 内で作成されたその他の永続ブラウザデータは再起動後も維持されます。

## 依存関係の更新ポリシー

TAURIGHT は起動時にパッケージレジストリを問い合わせたり、依存関係を変更したり **しません**。

各 TAURIGHT リリースは、そのリリースでテスト済みの Patchright バージョンを固定します。検証済みランタイムは TAURIGHT 自体と一緒にコミットされるため、一度の Git fast-forward でアプリケーションとブラウザランタイムが同時に更新されます。ブラウザプロファイルと persistent lane はアプリケーションディレクトリの外にあるため、TAURIGHT を置き換えたり更新したりしてもログイン状態は削除されません。

## MCP ツール

公開 MCP は次のローカルブラウザ操作を提供します。

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

## クイック MCP 設定

TAURIGHT を stdio で実行します。

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

Windows ポータブルリリースでは、MCP 設定を展開済みの `TAURIGHT.cmd` に向けるか、同梱ランタイムと `bin/tauright-mcp.mjs` を直接指定できます。

## プロジェクト状況

TAURIGHT は現在 **0.2.x** です。セッション、lane、プロファイル永続化、タブ制御、スナップショット、操作、スクリーンショット、リリース固定 Patchright ランタイム更新は実ワークフローで検証されています。

公開リポジトリでは issue と、目的が明確な pull request を歓迎します。

## Upstream

TAURIGHT はブラウザ自動化依存関係として **Patchright** を使用します。Patchright は独立して保守され、Apache-2.0 の下で配布されています。帰属情報は `THIRD_PARTY_NOTICES.md` を参照してください。

## 配布

TAURIGHT は **TAU-BREATH** プロジェクトとして **TAU GROUP / DPA.network** の下で配布されます。

### 配布ポリシー: GitHub Releases のみ

**TAURIGHT は npm を配布チャネルとして使用しません。**

ソフトウェアサプライチェーンのリスク、認証上の摩擦、追加の publish gate への不要な依存を避けるため、レジストリ中心の公開方式を意図的に採用していません。TAURIGHT の公式公開ソースとリリース成果物は GitHub に置かれ、ポータブルリリースアーカイブと SHA-256 checksum は GitHub Releases で公開されます。

**npm publishing なし。起動時の registry check なし。GitHub Releases が公式配布チャネルです。**

**DPA — Decentralized Protection Alliance**  
Freedom without surveillance, protection for everyone.

[🌐 dpa.network](https://dpa.network) · [📧 contact@dpa.network](mailto:contact@dpa.network) · [💬 Matrix](https://matrix.to/#/#dpa_network:matrix.org) · [📢 Telegram](https://t.me/dpa_network)
