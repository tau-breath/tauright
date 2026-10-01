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

## Why TAURIGHT

TAURIGHT is designed for browser work that has to survive beyond a one-shot script: authenticated sessions, long-running automation, repeated operator workflows, browser agents, QA, monitoring, and sites that react differently to stock Playwright automation.

| Capability | What TAURIGHT provides |
| --- | --- |
| Reduced automation signals | Inherits Patchright's Chromium driver patches and launches Chrome without Playwright's usual `--enable-automation` flag |
| Real persistent identity | Cookies, local storage, sessions, extensions, and normal browser state can live in a persistent profile |
| Same-profile concurrency | Persistent lanes let multiple TAURIGHT sessions originate from the same canonical profile without fighting over Chrome's profile lock |
| Real Chrome by default | Uses the installed Chrome channel by default instead of requiring a special browser build |
| Local snapshots | Compact visible text and numbered interactive elements are generated locally with no remote model/API call |
| Rich interaction | Click, type, key presses, select, hover, right-click, drag/drop, upload, scrolling, back/forward, screenshots |
| Tabs and popups | Create, switch, list, close, and automatically follow newly opened tabs |
| Dynamic-page awareness | Waits for network activity and DOM mutations to settle instead of relying only on fixed sleeps |
| Safer element targeting | Revalidates numbered elements after page changes so a stale snapshot does not silently click the wrong control |
| Frames and modern controls | Scans child frames and recognizes native controls, ARIA widgets, custom pointer controls, styled checkboxes/radios, and hidden file inputs |

## Detection resistance

TAURIGHT inherits Patchright's Chromium-side reduction of several signals commonly exposed by stock Playwright. This is **signal reduction, not a universal bypass guarantee**.

- Patchright avoids the common CDP `Runtime.enable` leak by using isolated execution contexts for JavaScript evaluation.
- Patchright avoids the `Console.enable` CDP signal. One trade-off is that normal Playwright console functionality is limited.
- TAURIGHT launches Chromium-family browsers with `--disable-blink-features=AutomationControlled` and removes Playwright's default `--enable-automation` argument.
- TAURIGHT uses a normal installed Google Chrome channel by default and does not inject a fake user-agent or synthetic fingerprint profile.
- Persistent profiles preserve ordinary browser state instead of recreating a fresh automation identity for every task.

Detection systems can also use IP reputation, network/TLS characteristics, account history, behavior, browser version, and site-specific signals. TAURIGHT therefore does not claim that every site or anti-bot system will always accept automated traffic.

## Browser capabilities

TAURIGHT exposes the parts people usually need from a practical browser automation layer:

- persistent headed or headless Chrome sessions
- multiple named sessions running in parallel
- same-profile persistent lanes for concurrent work
- durable cookies and login state across restarts
- compact local page snapshots with numbered controls
- buttons, links, text fields, selects, checkboxes, radios, ARIA controls, and custom pointer-based controls
- iframe-aware element enumeration
- click, sequential typing, Enter and arbitrary key presses
- hover and right-click
- drag and drop
- file upload, including hidden file inputs
- scroll, back, forward, and reload
- tab creation, switching, closing, and popup/new-tab tracking
- alert/confirm/prompt handling with explicit acceptance for destructive confirmations
- viewport or full-page screenshots
- DOM/network settling for dynamic applications
- element identity checks before acting on an older snapshot

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
