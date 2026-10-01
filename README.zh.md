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

TAURIGHT 是一个基于 Patchright 的持久化多会话浏览器 MCP。

公开运行时不依赖外部模型：页面快照、元素编号、操作、标签页、会话、配置文件处理和更新管理都在本地完成，无需远程决策模型。

**一个浏览器身份。多个独立 lane。默认持久化。**

## DPA — Decentralized Protection Alliance

**Freedom without surveillance, protection for everyone.**

https://github.com/dpa-network/welecome

[🌐 dpa.network](https://dpa.network)  
📧 [contact@dpa.network](mailto:contact@dpa.network)  
💬 [Matrix](https://matrix.to/#/#dpa_network:matrix.org)  
📢 [Telegram](https://t.me/dpa_network)

---

## 主要特性

- 快速、紧凑的页面快照，并为可交互元素编号
- 无需远程决策模型往返即可完成直接的 snapshot → action 流程
- 持久化命名浏览器会话
- 通过持久 lane，从同一逻辑配置文件同时运行多个会话
- 支持 tabs、reload、wait、screenshot、keyboard、drag/drop、upload、select 和 navigation 控制
- 每个 TAURIGHT 版本都固定并验证对应的 Patchright 版本
- 配置文件保存在软件包/安装目录之外，因此软件包和 Patchright 更新不会删除登录状态
- 本地页面扫描：快照与直接操作不需要远程决策服务
- 自包含 Git 跟踪运行时：TAURIGHT 与其经过验证的浏览器依赖一起升级

## 安装

### Windows 便携版

TAURIGHT 的官方发行渠道是 **GitHub Releases**。

1. 从最新 GitHub Release 下载 `TAURIGHT-vX.Y.Z-win-x64.zip`。
2. 如有需要，校验随附的 `.sha256` 文件。
3. 解压到任意位置。
4. 运行 `TAURIGHT.cmd`。

便携版压缩包包含 Node 运行时和 TAURIGHT 经过验证的运行时依赖。无需软件包注册表账号、全局安装，也无需 publish/login 流程。

### Git checkout

TAURIGHT 直接在仓库中跟踪经过验证的运行时依赖，因此 Git checkout 不需要注册表安装步骤。`TAURIGHT.cmd` 检测到 `.git` checkout 后，会在启动前安全执行 `git pull --ff-only`，让 TAURIGHT 代码与经过验证的 Patchright 运行时一起更新。如果无法 fast-forward，TAURIGHT 会继续使用当前已验证的运行时并正常启动。

`package.json` 仅作为运行时依赖元数据保留，而不是注册表发行协议。官方发行版从同一套 Git 跟踪运行时构建，并作为 GitHub Release asset 发布。

除非通过 `PATCHRIGHT_CHANNEL` 选择其他 Patchright 支持的浏览器通道，否则 TAURIGHT 使用默认支持的浏览器通道。

## 持久化数据

默认情况下，TAURIGHT 将持久用户数据保存在软件包安装目录之外。

- Windows: `%LOCALAPPDATA%\TAURIGHT`
- macOS: `~/Library/Application Support/TAURIGHT`
- Linux: `~/.local/share/tauright`

这里保存 canonical profile 和 persistent lane profile。这样，软件包更新、依赖重装和 Patchright 升级就与浏览器身份和登录状态分离。

可通过以下方式覆盖根目录：

```text
TAURIGHT_DATA_ROOT=D:\my-tauright-data
```

## 同一配置文件的并发会话

使用不同的会话名称和相同的 `profile_key`。每个会话会获得一个持久 lane，该 lane 只在首次创建时从同一个 canonical profile 初始化。这样，每个运行中的浏览器都使用独立的 user-data 目录，同时共享同一个逻辑配置文件来源。

示例：

```text
session=worker-a profile_key=my-profile
session=worker-b profile_key=my-profile
session=worker-c profile_key=my-profile
```

每个 lane 首次创建时都会复制 canonical profile。后续启动会重复使用该 lane，因此 cookie、登录状态以及在该 lane 内创建的其他持久浏览器数据会在重启后继续保留。

## 依赖更新策略

TAURIGHT 在启动时**不会**查询软件包注册表，也不会修改依赖。

每个 TAURIGHT 版本都会固定一个与该版本一起测试过的 Patchright 版本。经过验证的运行时与 TAURIGHT 本身一起提交，因此一次 Git fast-forward 就能同时更新应用和浏览器运行时。浏览器配置文件和 persistent lane 位于应用目录之外，所以替换或更新 TAURIGHT 不会删除登录状态。

## MCP 工具

公开 MCP 提供以下本地浏览器操作：

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

## 快速 MCP 配置

通过 stdio 运行 TAURIGHT：

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

对于 Windows 便携版，可以将 MCP 配置指向解压后的 `TAURIGHT.cmd`，也可以直接指向其内置运行时和 `bin/tauright-mcp.mjs`。

## 项目状态

TAURIGHT 当前为 **0.2.x**。会话、lane、配置文件持久化、标签页控制、快照、操作、截图以及版本固定的 Patchright 运行时更新都已在实际工作流中使用和验证。

欢迎在公开仓库提交 issue 和范围明确的 pull request。

## Upstream

TAURIGHT 使用 **Patchright** 作为浏览器自动化依赖。Patchright 独立维护，并以 Apache-2.0 许可证发行。归属信息请参阅 `THIRD_PARTY_NOTICES.md`。

## 发行

TAURIGHT 作为 **TAU-BREATH** 项目，在 **TAU GROUP / DPA.network** 下发行。

### 发行策略：仅 GitHub Releases

**TAURIGHT 不使用 npm 作为发行渠道。**

为了避免软件供应链风险、认证摩擦，以及对额外发布门槛的不必要依赖，我们有意避开以注册表为中心的发布方式。TAURIGHT 的官方公开源码和发行产物位于 GitHub，便携版压缩包和 SHA-256 校验值通过 GitHub Releases 发布。

**不通过 npm 发布。不在运行时检查注册表。GitHub Releases 是官方发行渠道。**

**DPA — Decentralized Protection Alliance**  
Freedom without surveillance, protection for everyone.

[🌐 dpa.network](https://dpa.network) · [📧 contact@dpa.network](mailto:contact@dpa.network) · [💬 Matrix](https://matrix.to/#/#dpa_network:matrix.org) · [📢 Telegram](https://t.me/dpa_network)
