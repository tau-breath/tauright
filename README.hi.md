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

TAURIGHT, Patchright पर आधारित एक persistent multi-session browser MCP है।

Public runtime किसी बाहरी decision model पर निर्भर नहीं है। Page snapshots, element numbering, actions, tabs, sessions, profile handling और update management स्थानीय रूप से चलते हैं।

**एक browser identity. कई independent lane. Persistence डिफ़ॉल्ट है।**

## Public Distribution Identity

- Public distribution identity: **TAU-BREATH**
- Group: **TAU GROUP**
- Distribution network: **DPA.network**
- GitHub Releases और public documentation में बाहरी AI कंपनियों या model names का उपयोग नहीं किया जाता।
- Public project identity, author identity, release notes, package metadata, examples और documentation में **TAU-BREATH** को एकरूप रूप से उपयोग किया जाता है।
- TAURIGHT की public distribution **TAU GROUP / DPA.network** के अंतर्गत एकीकृत है।

## DPA — Decentralized Protection Alliance

**Freedom without surveillance, protection for everyone.**

https://github.com/dpa-network/welecome

[🌐 dpa.network](https://dpa.network)  
📧 [contact@dpa.network](mailto:contact@dpa.network)  
💬 [Matrix](https://matrix.to/#/#dpa_network:matrix.org)  
📢 [Telegram](https://t.me/dpa_network)

---

## मुख्य विशेषताएँ

- Numbered interactive elements के साथ तेज और compact page snapshots
- Remote decision-model round trip के बिना सीधा snapshot → action workflow
- Persistent named browser sessions
- एक ही logical profile से persistent lane के माध्यम से कई concurrent sessions
- tabs, reload, wait, screenshot, keyboard, drag/drop, upload, select और navigation controls
- हर TAURIGHT release के साथ Patchright version pin और test किया जाता है
- Profiles package/install directory से बाहर रखे जाते हैं, ताकि package या Patchright update login state न मिटाए
- Local page scanning: snapshots या direct actions के लिए remote decision service की आवश्यकता नहीं
- Self-contained Git-tracked runtime: TAURIGHT और verified browser dependencies साथ-साथ आगे बढ़ते हैं

## Install

### Windows portable release

TAURIGHT का आधिकारिक distribution channel **GitHub Releases** है।

1. Latest GitHub Release से `TAURIGHT-vX.Y.Z-win-x64.zip` डाउनलोड करें।
2. चाहें तो साथ दिया गया `.sha256` file verify करें।
3. Archive को किसी भी स्थान पर extract करें।
4. `TAURIGHT.cmd` चलाएँ।

Portable archive में Node runtime और TAURIGHT की verified runtime dependencies शामिल हैं। Package-registry account, global package install या publish/login flow की आवश्यकता नहीं है।

### Git checkout

TAURIGHT अपनी verified runtime dependencies को सीधे repository में track करता है। इसलिए Git checkout के लिए registry install step की आवश्यकता नहीं होती। `TAURIGHT.cmd`, `.git` checkout मिलने पर launch से पहले सुरक्षित `git pull --ff-only` चलाता है, जिससे TAURIGHT code और verified Patchright runtime साथ अपडेट होते हैं। यदि fast-forward संभव न हो, TAURIGHT मौजूदा verified runtime को बनाए रखकर सामान्य रूप से शुरू होता है।

`package.json` को registry distribution contract के रूप में नहीं, बल्कि runtime dependency metadata के रूप में रखा गया है। Official releases इसी Git-tracked runtime से build होकर GitHub Release assets के रूप में publish होते हैं।

यदि `PATCHRIGHT_CHANNEL` से कोई अन्य Patchright-supported browser channel नहीं चुना गया है, तो TAURIGHT default supported browser channel उपयोग करता है।

## Persistent data

डिफ़ॉल्ट रूप से TAURIGHT persistent user data को package installation directory से बाहर रखता है:

- Windows: `%LOCALAPPDATA%\TAURIGHT`
- macOS: `~/Library/Application Support/TAURIGHT`
- Linux: `~/.local/share/tauright`

यहाँ canonical profiles और persistent lane profiles रहते हैं। इस तरह package updates, dependency reinstalls और Patchright upgrades browser identity तथा login state से अलग रहते हैं।

Root path को इस तरह override किया जा सकता है:

```text
TAURIGHT_DATA_ROOT=D:\my-tauright-data
```

## एक ही profile के concurrent sessions

अलग-अलग session names के साथ वही `profile_key` उपयोग करें। हर session को एक persistent lane मिलता है, जिसे उसी canonical profile से केवल पहली बार seed किया जाता है। इसलिए हर चल रहा browser अपना user-data directory उपयोग करता है, जबकि logical profile origin साझा रहता है।

उदाहरण:

```text
session=worker-a profile_key=my-profile
session=worker-b profile_key=my-profile
session=worker-c profile_key=my-profile
```

हर lane पहली बार बनने पर canonical profile से copy होता है। बाद के launches उसी lane को reuse करते हैं, इसलिए cookies, login state और lane के भीतर बना अन्य persistent browser data restart के बाद भी बना रहता है।

## Dependency update policy

TAURIGHT startup पर package registry को query **नहीं** करता और dependencies को mutate **नहीं** करता।

हर TAURIGHT release उस Patchright version को pin करता है जो उस release के साथ test किया गया है। Verified runtime को TAURIGHT के साथ commit किया जाता है, इसलिए एक Git fast-forward application और browser runtime दोनों को साथ अपडेट करता है। Browser profiles और persistent lane application directory के बाहर रहते हैं, इसलिए TAURIGHT को replace या update करने से login state नहीं मिटती।

## MCP tools

Public MCP निम्न local browser operations उपलब्ध कराता है:

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

TAURIGHT को stdio पर चलाएँ:

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

Windows portable release में MCP configuration को extracted `TAURIGHT.cmd` की ओर point किया जा सकता है, या bundled runtime और `bin/tauright-mcp.mjs` को सीधे उपयोग किया जा सकता है।

## Project status

TAURIGHT वर्तमान में **0.2.x** है। Sessions, lane, profile persistence, tab control, snapshots, actions, screenshots और release-pinned Patchright runtime updates का वास्तविक workflows में उपयोग और परीक्षण किया जा रहा है।

Public repository में issues और focused pull requests का स्वागत है।

## Upstream

TAURIGHT browser automation dependency के रूप में **Patchright** उपयोग करता है। Patchright स्वतंत्र रूप से maintain किया जाता है और Apache-2.0 के अंतर्गत distribute होता है। Attribution के लिए `THIRD_PARTY_NOTICES.md` देखें।

## Distribution

TAURIGHT को **TAU-BREATH** project के रूप में **TAU GROUP / DPA.network** के अंतर्गत distribute किया जाता है।

### Distribution policy: केवल GitHub Releases

**TAURIGHT npm को distribution channel के रूप में उपयोग नहीं करता।**

Software supply-chain risk, authentication friction और किसी अतिरिक्त publishing gate पर अनावश्यक निर्भरता से बचने के लिए हम registry-centric publishing से जानबूझकर बचते हैं। TAURIGHT का canonical public source और release artifacts GitHub पर रहते हैं, और portable release archives तथा SHA-256 checksums GitHub Releases के माध्यम से publish किए जाते हैं।

**No npm publishing. No runtime registry checks. GitHub Releases आधिकारिक distribution channel है।**

**DPA — Decentralized Protection Alliance**  
Freedom without surveillance, protection for everyone.

[🌐 dpa.network](https://dpa.network) · [📧 contact@dpa.network](mailto:contact@dpa.network) · [💬 Matrix](https://matrix.to/#/#dpa_network:matrix.org) · [📢 Telegram](https://t.me/dpa_network)
