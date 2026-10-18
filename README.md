<div align="center">

<img src="icons/app-128.png" width="88" alt="Atrium icon">

# Atrium

**A `/` command center for your browser.**

A new tab page with a clock, search, slash commands and your links. No frameworks and no tracking, and it weighs almost nothing.

<a href="#install"><img alt="Chrome" src="https://img.shields.io/badge/Chrome-18181b?style=for-the-badge&logo=googlechrome&logoColor=white"></a>
<a href="#install"><img alt="Edge" src="https://img.shields.io/badge/Edge-18181b?style=for-the-badge&logo=microsoftedge&logoColor=white"></a>
<a href="#install"><img alt="Brave" src="https://img.shields.io/badge/Brave-18181b?style=for-the-badge&logo=brave&logoColor=white"></a>
<br>
<img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-27272a?style=flat-square">
<img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-27272a?style=flat-square">
<img alt="Memory" src="https://img.shields.io/badge/memory-~0.2_MB-27272a?style=flat-square">
<a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-27272a?style=flat-square"></a>

<br>

<img src="docs/screenshots/hero.png" alt="Atrium in Chrome with vertical tabs: clock, world times, search and a Collection of links" width="100%">

</div>

## Highlights

- **Slash commands.** Type `/` to ask Claude or ChatGPT, search YouTube, X or LinkedIn, start a Google Meet, jump to an open tab, or find a local dev server.
- **One search bar.** Google suggestions, open tabs, your links and your history in one list.
- **Links that stay tidy.** Tabs, folders, inline editing and live drag and drop.
- **Time at a glance.** A large clock, three world times and live exchange rates.
- **Google account switcher.** Choose which signed-in account Gmail, Drive, Calendar and the other Google links open in.
- **Quiet design.** Dark by default, with a light mode. System font and no clutter. The page fits the window, so only the panels scroll.
- **Built for people with a thousand tabs.** Plain HTML, CSS and JavaScript. Nothing runs in the background.

<div align="center">
<img src="docs/screenshots/commands.png" alt="The slash command menu in Atrium" width="100%">
</div>

## Install

Atrium isn't on the Chrome Web Store yet. Installing it from source takes about a minute.

Tested in Chrome 155 on macOS. It should also work in other Chromium browsers such as Edge and Brave.

1. Download the latest release from [Releases](../../releases) and unzip it, or clone the repo:
   ```sh
   git clone https://github.com/dpichler-22/atrium.git
   ```
2. Open `chrome://extensions` (`edge://extensions` in Edge, `brave://extensions` in Brave).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the `atrium` folder.
5. Open a new tab.

> [!IMPORTANT]
> The browser runs Atrium from that folder, so keep it in a permanent place. Avoid iCloud-synced folders such as Desktop or Documents.

**Updating:** pull or download the new version, then press the reload arrow on Atrium in `chrome://extensions`. Your links are kept.

## Commands

Type a command and press <kbd>Space</kbd> or <kbd>Tab</kbd> to start it, then type your query.

| Command    | What it does                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `/claude`  | Ask Claude                                                                                       |
| `/gpt`     | Ask ChatGPT                                                                                      |
| `/gemini`  | Ask Gemini. The prompt is copied for you to paste.                                               |
| `/yt`      | Search YouTube                                                                                   |
| `/x`       | Search X                                                                                         |
| `/in`      | Search LinkedIn                                                                                  |
| `/drive`   | Search Google Drive                                                                              |
| `/img`     | Search Google Images                                                                             |
| `/meetnow` | Start a Google Meet, copy its link and open it. Add a code or link to join that meeting instead. |
| `/tab`     | Find and switch to an open tab                                                                   |
| `/history` | Search your browsing history                                                                     |
| `/ports`   | List the dev servers running on `localhost`                                                      |

### Keyboard

| Key                                               | Action                                              |
| ------------------------------------------------- | --------------------------------------------------- |
| <kbd>/</kbd>                                      | Focus the search bar from anywhere on the page      |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>Enter</kbd>        | Move through results and open one                   |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Open the result in a new tab                        |
| <kbd>Backspace</kbd>                              | At the start of the bar, cancel the current command |
| <kbd>Ctrl</kbd> + <kbd>C</kbd>                    | Clear the search bar                                |
| <kbd>Esc</kbd>                                    | Close menus and leave edit mode                     |

## Your links

The pencil in the bottom-left corner turns on edit mode. In edit mode you can:

- add, rename and delete tabs, links and folders
- drag items to reorder them or move them into folders

Atrium starts with a small set of links in five tabs (Daily, Dev, AI, Create and Read). Change them to whatever you use.

Your links are saved in your browser profile, and every open Atrium tab stays in sync.

## Privacy

Atrium has no account, analytics, ads or server of its own. It never stores your search queries.

It connects to these services only:

| Service                                         | When                                | Why                                   |
| ----------------------------------------------- | ----------------------------------- | ------------------------------------- |
| `suggestqueries.google.com`                     | While you type                      | Search suggestions                    |
| `www.google.com/s2/favicons`                    | When a link is shown                | Website icons (cached by the browser) |
| `open.er-api.com`                               | At most once every 6 hours          | Exchange rates                        |
| `accounts.google.com`                           | Only when you open the account menu | Lists your signed-in Google accounts  |
| Google profile photos (`googleusercontent.com`) | Only when you open the account menu | Account pictures in that menu         |
| `localhost` / `127.0.0.1`                       | Only while `/ports` is open         | Finds local dev servers               |

## Permissions

| Permission                            | Why Atrium needs it                                                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tabs`                                | `/tab` search, and `/meetnow` reading the new meeting code                                                                                               |
| `history`                             | History results in search and in `/history`                                                                                                              |
| `declarativeNetRequestWithHostAccess` | Removes the extension's `Origin` header on requests to `accounts.google.com`, so Google returns your signed-in accounts. See [`rules.json`](rules.json). |
| Host access (listed above)            | Suggestions, exchange rates, the account menu and `/ports`                                                                                               |

## Performance

Atrium is plain HTML, CSS and JavaScript with no libraries and no build step. Once the page loads, the only thing that runs is a clock update once a minute. There's no background service worker.

| Measured in Chrome                   | Result                           |
| ------------------------------------ | -------------------------------- |
| JavaScript memory above an empty tab | about 0.2 MB                     |
| Each extra open Atrium tab           | about 0.3 MB (measured on 1.2.0) |
| CPU while idle                       | the same as an empty tab         |

## Project structure

```
atrium/
├── manifest.json   # Manifest V3: new tab override and permissions
├── newtab.html     # page markup
├── style.css       # all styles, dark and light themes
├── app.js          # all logic, no dependencies
├── rules.json      # declarativeNetRequest rule for the account menu
└── icons/          # app icon and command logos
```

The `key` in `manifest.json` keeps the extension ID the same wherever the folder lives, so moving it doesn't lose your links. If you fork Atrium to publish your own version, remove the key.

## Roadmap

- [ ] Choose your own world clocks and currencies
- [ ] Chrome Web Store release
- [ ] Optional sync through Chrome bookmarks
- [ ] Import and export links
- [ ] Firefox version

Have an idea? [Open an issue](../../issues/new/choose).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. The short version: no frameworks, keep it light, and format with Prettier.

## License

[MIT](LICENSE) © Davide Pichler

Logos for Claude, ChatGPT, Gemini, YouTube, X, LinkedIn and Google apps are trademarks of their owners. They are included only to identify those services and are not covered by the MIT license.
