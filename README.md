<div align="center">

<img src="icons/app-128.png" width="80" alt="Atrium icon">

# Atrium

**A `/` command center for your browser.**

A new way to use your browser. Organize links, run commands, weigh almost nothing.

<a href="#install"><img alt="Chrome" src="https://img.shields.io/badge/Chrome-18181b?style=for-the-badge&logo=googlechrome&logoColor=white"></a>
<a href="#install"><img alt="Edge" src="https://img.shields.io/badge/Edge-18181b?style=for-the-badge&logo=microsoftedge&logoColor=white"></a>
<a href="#install"><img alt="Brave" src="https://img.shields.io/badge/Brave-18181b?style=for-the-badge&logo=brave&logoColor=white"></a>
<br>
<img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-27272a?style=flat-square">
<img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-27272a?style=flat-square">
<img alt="Memory" src="https://img.shields.io/badge/memory-~0.2_MB-27272a?style=flat-square">
<a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-27272a?style=flat-square"></a>

[Highlights](#highlights) · [Install](#install) · [Install with Claude](#install-with-claude-code) · [Commands](#commands) · [Customize](#customize) · [Privacy](#privacy) · [Roadmap](#roadmap)

<br>

<img src="docs/screenshots/hero.png" alt="Atrium in Chrome with vertical tabs: clock, world times, search and a Collection of links" width="560">

</div>

## Highlights

- **Slash commands.** Ask Claude or ChatGPT, search YouTube or X, start a Google Meet, jump to an open tab or find a local dev server.
- **One search bar.** Google suggestions, open tabs, your links and your history in one list.
- **Tidy links.** Tabs, folders, inline editing and drag and drop.
- **Time at a glance.** A large clock, world times and live exchange rates.
- **Google account switcher.** Pick which account your Google links open in.
- **Built for power users.** Plain HTML, CSS and JavaScript. No frameworks, no tracking.

<div align="center">
<img src="docs/screenshots/commands.png" alt="The slash command menu in Atrium" width="560">
</div>

## Install

1. [Download the latest release](../../releases/latest) and unzip it, or `git clone https://github.com/dpichler-22/atrium.git`.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked**, select the `atrium` folder, and open a new tab.

Tested in Chrome on macOS. It should also work in Edge, Brave and other Chromium browsers.

> <img src="docs/icons/important.svg" width="16" height="16" align="absmiddle" alt=""> **Important**
>
> The browser runs Atrium from that folder, so keep it somewhere permanent.

### Install with Claude Code

Run this in your terminal. [Claude Code](https://claude.com/claude-code) does the rest ([INSTALL_WITH_CLAUDE.md](INSTALL_WITH_CLAUDE.md)):

```sh
claude "Install github.com/dpichler-22/atrium using INSTALL_WITH_CLAUDE.md"
```

<div align="center">
<a href="https://claude.ai/new?q=Explain%20what%20Atrium%20%28https%3A//github.com/dpichler-22/atrium%29%20does%20and%20help%20me%20set%20it%20up."><img alt="Ask Claude about Atrium" src="https://img.shields.io/badge/Ask_Claude_about_Atrium-18181b?style=for-the-badge&logo=claude&logoColor=white"></a>
</div>

## Commands

Type a command, press <kbd>Space</kbd> or <kbd>Tab</kbd>, then your query.

<div align="center">

| Command    | What it does                                       |
| ---------- | -------------------------------------------------- |
| `/claude`  | Ask Claude                                         |
| `/gpt`     | Ask ChatGPT                                        |
| `/gemini`  | Ask Gemini                                         |
| `/yt`      | Search YouTube                                     |
| `/x`       | Search X                                           |
| `/in`      | Search LinkedIn                                    |
| `/drive`   | Search Google Drive                                |
| `/img`     | Search Google Images                               |
| `/meetnow` | Start a Google Meet and copy the link, or join one |
| `/tab`     | Switch to an open tab                              |
| `/history` | Search your history                                |
| `/ports`   | Find dev servers running on `localhost`            |

</div>

**Shortcuts:** <kbd>/</kbd> focuses search · <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> opens in a new tab · <kbd>Ctrl</kbd> + <kbd>C</kbd> clears the bar · <kbd>Esc</kbd> closes menus

**Edit your links** with the pencil in the bottom-left corner.

## Customize

Some settings are set in the code for now. Each one is marked in the files:

<div align="center">

| Setting        | Where                             |
| -------------- | --------------------------------- |
| World clocks   | `newtab.html`, marked `Customize` |
| Currencies     | `initRates()` in `app.js`         |
| Starter links  | `DEFAULTS` in `app.js`            |
| Slash commands | `CMDS` in `app.js`                |

</div>

Reload Atrium in `chrome://extensions` after editing. Saved links aren't affected.

## Privacy

No account, analytics or server. Search queries are never stored, and links stay in your browser profile.

<div align="center">

| Connects to                                    | When                                |
| ---------------------------------------------- | ----------------------------------- |
| `suggestqueries.google.com`                    | While you type                      |
| `google.com/s2/favicons`                       | To show website icons               |
| `open.er-api.com`                              | Exchange rates, every 6 hours       |
| `accounts.google.com`, `googleusercontent.com` | Only when you open the account menu |
| `localhost`                                    | Only while `/ports` is open         |

</div>

<details>
<summary><b>Permissions</b></summary>

<div align="center">

| Permission                            | Why                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `tabs`                                | `/tab` and `/meetnow`                                                                                                        |
| `history`                             | History results and `/history`                                                                                               |
| `declarativeNetRequestWithHostAccess` | Removes the `Origin` header on requests to `accounts.google.com`, so the account menu works. See [`rules.json`](rules.json). |

</div>

</details>

<details>
<summary><b>Performance</b></summary>

About 0.2 MB of memory above an empty tab, and the same idle CPU. Nothing runs in the background: the only timer is the clock, once a minute.

</details>

## Roadmap

- [ ] More commands and features
- [ ] Personalize commands
- [ ] Choose your own world clocks and currencies
- [ ] Import and export links
- [ ] Chrome Web Store release

Have an idea? [Open an issue](../../issues/new/choose). Pull requests are welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Davide Pichler

<sub><i>Logos for Claude, ChatGPT, Gemini, YouTube, X, LinkedIn and Google apps are trademarks of their owners. They are included only to identify those services and are not covered by the MIT license.</i></sub>
