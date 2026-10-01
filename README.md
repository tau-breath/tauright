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
- Patchright version pinned and tested as part of each TAURIGHT release
- Profiles stored outside the package/install directory so package and Patchright updates do not remove logins
- Local page scanning: no remote decision service is required for snapshots or direct actions
- Self-contained Git-tracked runtime: TAURIGHT and its verified browser dependencies advance together

## Install

### Windows portable release

TAURIGHT's canonical distribution channel is **GitHub Releases**.

1. Download `TAURIGHT-vX.Y.Z-win-x64.zip` from the latest GitHub Release.
2. Optionally verify the accompanying `.sha256` file.
3. Extract the archive anywhere.
4. Run `TAURIGHT.cmd`.

The portable archive includes the Node runtime and TAURIGHT's verified runtime dependencies. No package-registry account, global package install, or publish/login flow is required.

### Git checkout

TAURIGHT tracks its verified runtime dependencies directly in the repository. A Git checkout therefore needs no registry install step. `TAURIGHT.cmd` performs a safe `git pull --ff-only` before launch when it detects a `.git` checkout, so TAURIGHT code and the verified Patchright runtime advance together. If the pull cannot fast-forward, TAURIGHT keeps the current verified runtime and starts normally.

`package.json` is kept as runtime dependency metadata, not as a registry distribution contract. Official releases are built from the same Git-tracked runtime and published as GitHub Release assets.

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

## Dependency update policy

TAURIGHT does **not** query a package registry or mutate its dependencies at startup.

Each TAURIGHT release pins a Patchright version that is tested with that release. The verified runtime is committed with TAURIGHT itself, so one Git fast-forward updates the application and browser runtime together. Browser profiles and persistent lanes remain outside the application directory, so replacing or updating TAURIGHT does not delete login state.

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

For the Windows portable release, point your MCP configuration at the extracted `TAURIGHT.cmd` or directly at its bundled runtime and `bin/tauright-mcp.mjs`.

## Project status

TAURIGHT is currently **0.2.x**. Session, lane, profile persistence, tab control, snapshots, actions, screenshots, and release-pinned Patchright runtime updates are exercised in real workflows.

Issues and focused pull requests are welcome at the public repository.

## Upstream

TAURIGHT uses **Patchright** as its browser automation dependency. Patchright is maintained independently and is distributed under Apache-2.0. See `THIRD_PARTY_NOTICES.md` for attribution.

## Distribution

TAURIGHT is distributed as a **TAU-BREATH** project under **TAU GROUP / DPA.network**.

### Distribution policy: GitHub Releases only

**TAURIGHT does not use npm as a distribution channel.**

We deliberately avoid registry-centric publishing because of software supply-chain risk, authentication friction, and unnecessary dependence on an additional publishing gate. TAURIGHT's canonical public source and release artifacts live on GitHub, with portable release archives and SHA-256 checksums published through GitHub Releases.

**No npm publishing. No runtime registry checks. GitHub Releases is the canonical distribution channel.**

**DPA — Decentralized Protection Alliance**  
Freedom without surveillance, protection for everyone.

[🌐 dpa.network](https://dpa.network) · [📧 contact@dpa.network](mailto:contact@dpa.network) · [💬 Matrix](https://matrix.to/#/#dpa_network:matrix.org) · [📢 Telegram](https://t.me/dpa_network)
