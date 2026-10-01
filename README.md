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

TAURIGHT is a persistent multi-session browser MCP built on Patchright.

The public runtime is model-free: page snapshots, element numbering, actions, tabs, sessions, profile handling, and update management run locally without an external decision-model dependency.

**One browser identity. Many independent lanes. Persistent by default.**

## Public Distribution Identity

- Public distribution identity: **TAU-BREATH**
- Group: **TAU GROUP**
- Distribution network: **DPA.network**
- GitHub releases and public documentation must not use external AI company names or model names.
- Public project identity, author identity, release notes, package metadata, examples, and documentation should use **TAU-BREATH** consistently.
- TAURIGHT public distribution is integrated under **TAU GROUP / DPA.network**.

## DPA — Decentralized Protection Alliance

**Freedom without surveillance, protection for everyone.**

https://github.com/dpa-network/welecome

[🌐 dpa.network](https://dpa.network)  
📧 [contact@dpa.network](mailto:contact@dpa.network)  
💬 [Matrix](https://matrix.to/#/#dpa_network:matrix.org)  
📢 [Telegram](https://t.me/dpa_network)

---

## Highlights

- Fast compact page snapshots with numbered interactive elements
- Direct snapshot → action workflow without a remote decision-model round trip
- Persistent named browser sessions
- Multiple concurrent sessions from the same logical profile through persistent lanes
- Tabs, reload, wait, screenshots, keyboard, drag/drop, upload, select, and navigation controls
- Automatic tracking of Patchright's npm `latest` stable release before the browser engine is imported
- Profiles stored outside the package/install directory so package and Patchright updates do not remove logins
- Local page scanning: no remote decision service is required for snapshots or direct actions
- Git-friendly public runtime with a deliberately small source surface

## Install

```bash
npm install -g tauright
```

The npm package has not been published yet. Until the first npm release, install from the repository checkout using the local instructions below.

Or run from a local checkout:

```bash
npm install
npm run mcp
```

TAURIGHT uses the default supported browser channel unless another Patchright-supported channel is selected with `PATCHRIGHT_CHANNEL`.

## Persistent data

By default TAURIGHT keeps persistent user data outside the package installation directory:

- Windows: `%LOCALAPPDATA%\TAURIGHT`
- macOS: `~/Library/Application Support/TAURIGHT`
- Linux: `~/.local/share/tauright`

This contains canonical profiles and persistent lane profiles. Package updates, dependency reinstalls, and Patchright upgrades therefore remain separate from browser identity and login state.

Override the root with:

```text
TAURIGHT_DATA_ROOT=D:\my-tauright-data
```

## Same-profile concurrent sessions

Use the same `profile_key` with different session names. Each session gets a persistent lane seeded once from the same canonical profile. Each running browser therefore receives its own user-data directory while sharing the same logical profile origin.

Example:

```text
session=worker-a profile_key=my-profile
session=worker-b profile_key=my-profile
session=worker-c profile_key=my-profile
```

The first time each lane is created, it is copied from the canonical profile. Later launches reuse that lane, so cookies, login state, and other persistent browser data created inside that lane survive restarts.

## Automatic Patchright stable updates

`TAURIGHT_AUTO_UPDATE=1` is enabled by default.

At startup TAURIGHT:

1. Reads the installed Patchright version.
2. Reads npm's `patchright` `latest` dist-tag.
3. Accepts only a plain stable semantic version such as `1.63.0`.
4. Installs it when it differs from the installed version.
5. Imports the browser engine only after the update step completes.

Browser profiles and persistent lanes are stored independently from the installed dependency tree, so a Patchright update does not replace or delete profile data.

If the package registry or network is unavailable, TAURIGHT continues with the installed version by default. Set `TAURIGHT_UPDATE_STRICT=1` to make an update-check failure prevent startup.

Disable automatic updates with:

```text
TAURIGHT_AUTO_UPDATE=0
```

## MCP tools

The public MCP exposes local browser operations:

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

## Quick MCP configuration

Run TAURIGHT over stdio:

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

For a global npm installation, use `tauright` as the command after the package is published.

## Project status

TAURIGHT is currently **0.2.x**. The public core is intentionally small while session, lane, profile persistence, tab control, snapshots, actions, screenshots, and stable Patchright updates are exercised in real workflows.

Issues and focused pull requests are welcome at the public repository.

## Upstream

TAURIGHT uses **Patchright** as its browser automation dependency. Patchright is maintained independently and is distributed under Apache-2.0. See `THIRD_PARTY_NOTICES.md` for attribution.

## Distribution

TAURIGHT is distributed as a **TAU-BREATH** project under **TAU GROUP / DPA.network**.

**DPA — Decentralized Protection Alliance**  
Freedom without surveillance, protection for everyone.

[🌐 dpa.network](https://dpa.network) · [📧 contact@dpa.network](mailto:contact@dpa.network) · [💬 Matrix](https://matrix.to/#/#dpa_network:matrix.org) · [📢 Telegram](https://t.me/dpa_network)
